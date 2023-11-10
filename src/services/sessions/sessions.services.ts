import {DataSource, Repository} from "typeorm";
import {EntityStatus, Game, SessionCreated, SessionStatusGame, StatusGame} from "../../models/room.content.models";
import {Utils} from "../../utils/utils";
import {MapsDto} from "../../dto/maps.dto";
import * as fs from 'fs';
import {FormatRestApiModels} from "../../models/formatRestApi.models";
import {Cells, Maps} from "../../models/maps.models";
import PouchDB from 'pouchdb';
import {TokenManager} from "../../utils/tokennezer/jsonwebtoken";
import {UsersServices} from "../users/users.services";
import {CardByEntityPlaying} from "../../models/cards.models";
import {ClientDto} from "../../dto/clients.dto";
import {JoinSessionSocket, JoinSessionTeam} from "../../models/formatSocket.models";
import {PlayerLobby} from "../../models/player.models";

interface Document {
    _id: string;
    sessionStatusGame: SessionStatusGame;
    game: Game;
    maps: Maps;
}

interface GameKey {
    gameKey: string;
}

export class SessionsServices {
    dataSourceConfig: Promise<DataSource>;
    private readonly directory: string = 'parties';
    private userServices: UsersServices;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.userServices = new UsersServices(dataSourceConfig);
    }

    createGameKey(): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    getFilesInDirectory(): string[] {
        return fs.readdirSync(this.directory);
    }

    newKeyIfNotExist() {
        let key: string = '';
        let isExist: boolean = true;
        let end: number = 0;

        while (true) {
            key = this.createGameKey();
            if (end === 5) {
                return Utils.formatResponse(500, 'Key count timeout error', 'key not found', 'Key count timeout error');
            } else {
                if (this.getFilesInDirectory().includes(key)) {
                    end++;
                } else {
                    let gameKey: GameKey = {
                        gameKey: key
                    }
                    return Utils.formatResponse(200, 'Key success', gameKey,);
                }
            }
        }
    }

    async getSession(room: string) {
        try {
            const pouchDB = new PouchDB(`${this.directory}/${room}`);
            const doc: Document = await pouchDB.get(room);
            return Utils.formatResponse(200, 'Document créé avec succès', doc, null);
        } catch (error) {
            return Utils.formatResponse(500, 'Erreur lors de la création du document JSON', null, error);
        }
    }

    async roomExists(roomId: string) {
        let tabString = this.getFilesInDirectory()
        if (tabString.includes(roomId)) {
            return Utils.formatResponse(200, 'Room exists', null, null);
        } else {
            return Utils.formatResponse(500, 'Room not found', null, null);
        }
    }



    async create(session: SessionCreated) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const mapDtoRepository: Repository<MapsDto> = dataSource.getRepository(MapsDto);
            const map = await mapDtoRepository.findOne({
                where: {id: session.mapId},
                relations: ['cells']
            });
            if (!map) {
                return Utils.formatResponse(500, 'Map not found', 'map not found', 'Map not found');
            }
            let arrayCells: Array<Cells> = [];
            for (let i = 0; i < map.cells.length; i++) {
                arrayCells.push({
                    id: map.cells[i].id,
                    x: map.cells[i].x,
                    y: map.cells[i].y,
                    value: map.cells[i].value
                });
            }
            const mapSimply: Maps = {
                id: map.id,
                name: map.name,
                width: map.width,
                height: map.height,
                cellsGrid: arrayCells,
                backgroundImg: map.backgroundImage
            }
            const gamekey: FormatRestApiModels = this.newKeyIfNotExist();
            if (gamekey.code === 500) {
                return Utils.formatResponse(500, 'Key count timeout error', 'key not found', 'Key count timeout error');
            }
            const pouchDB = new PouchDB(`${this.directory}/${gamekey.data.gameKey}`);
            const sessionStatusGame: SessionStatusGame = {
                room: gamekey.data.gameKey,
                teamNames: session.teamNames,
                status: StatusGame.LOBBY,
                turnCount: 0,
                lobby: [],
                entityTurn: []
            }
            let teams = Utils.initTeamEntityPlaying(session.teamNames);
            const game: Game = {
                teams: teams,
                monsters: []
            }
            let docInit: Document = {
                _id: gamekey.data.gameKey,
                sessionStatusGame: sessionStatusGame,
                game: game,
                maps: mapSimply
            };
            const doc: Document = JSON.parse(JSON.stringify(docInit));
            try {
                const response = await pouchDB.put(doc);
                const retrievedDoc = await pouchDB.get(gamekey.data.gameKey);
                return Utils.formatResponse(200, 'Document créé avec succès', retrievedDoc, null);
            } catch (error) {
                return Utils.formatResponse(500, 'Erreur lors de la création du document JSON', null, error);
            }
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async joinSession(data: JoinSessionSocket) {
        try {
            const existed = await this.roomExists(data.room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            const pouchDB = new PouchDB(`${this.directory}/${data.room}`);
            const tokenManager = new TokenManager('votre_clé_secrète');
            const tokenData = tokenManager.verifyToken(data.token);
            if (tokenData.code < 200 || tokenData.code > 299) {
                return Utils.formatResponse(tokenData.code, `${tokenData.message}`, tokenData.data, tokenData.error);
            }
            let doc: Document = await pouchDB.get(data.room);
            if (tokenData.code < 200 || tokenData.code > 299) {
                return Utils.formatResponse(tokenData.code, `${tokenData.message}`, tokenData.data, tokenData.error);
            }
            const login = await this.userServices.login({
                email: tokenData.data.email,
                password: tokenData.data.password
            });
            if (login.code < 200 || login.code > 299) {
                return Utils.formatResponse(login.code, `${login.message}`, login.data, login.error);
            }
            if (doc.sessionStatusGame.lobby.length === 8) {
                return Utils.formatResponse(500, 'Session is full', null, null);
            }
            for (const playerLobby in doc.sessionStatusGame.lobby) {
                if (doc.sessionStatusGame.lobby[playerLobby].pseudo === login.data.pseudo && doc.sessionStatusGame.lobby[playerLobby].avatar === login.data.avatar) {
                    return Utils.formatResponse(200, 'Player already inside session', doc, null);
                }
            }
            doc.sessionStatusGame.lobby.push({
                score: 0,
                avatar: login.data.avatar,
                pseudo: login.data.pseudo,
                cards: login.data.cards,
            })
            const response = await pouchDB.put(doc);
            if(response.ok){
                return Utils.formatResponse(200, 'Document créé avec succès', doc, null);
            }else{
                return Utils.formatResponse(500, 'Erreur lors de la création du document JSON', null, response);
            }
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async joinTeam(data: JoinSessionTeam) {
        try {
            const existed:FormatRestApiModels = await this.roomExists(data.room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            const pouchDB = new PouchDB(`${this.directory}/${data.room}`);
            let doc: Document = await pouchDB.get(data.room);
            // Vérifiez si doc.game et doc.game.teams existent
            if (!doc.game || !doc.game.teams) {
                return Utils.formatResponse(500, 'Game or teams not found', null, null);
            }
            const team = doc.game.teams[data.teamPosition].cardsPlayer as Array<CardByEntityPlaying>;
            let session = doc.game.teams
            let lobby = doc.sessionStatusGame.lobby
            let newGame = Utils.initTeamEntityPlayingWithCards(session,lobby,data.lobbyPosition,data.teamPosition,data.cardPosition)
            if (newGame.code < 200 || newGame.code > 299) {
                return Utils.formatResponse(newGame.code, `${newGame.message}`, newGame.data, newGame.error);
            }
            doc.game.teams = newGame.data;
            await pouchDB.put(doc);
            const retrievedDoc = await pouchDB.get(data.room);
            return Utils.formatResponse(200, 'Document créé avec succès', retrievedDoc, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async cardSelected(room: string, lobbyPosition: number, teamPosition: number, cardPosition: number) {
        try {
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            const pouchDB = new PouchDB(`${this.directory}/${room}`);
            let doc: Document = await pouchDB.get(room);
            if (!doc.game || !doc.game.teams) {
                return Utils.formatResponse(500, 'Game or teams not found', null, null);
            }
            const team = doc.game.teams[teamPosition].cardsPlayer as Array<CardByEntityPlaying>;
            const card = doc.sessionStatusGame.lobby[lobbyPosition].cards[cardPosition];
            team[teamPosition].atk = card.atk;
            team[teamPosition].def = card.def;
            team[teamPosition].spd = card.spd;
            team[teamPosition].luk = card.luk;
            team[teamPosition].rarity = card.rarity;
            team[teamPosition].imageSrc = card.imageSrc;
            team[teamPosition].effects = card.effects;
            team[teamPosition].capacities = card.capacities;

            await pouchDB.put(doc);
            const retrievedDoc = await pouchDB.get(room);
            return Utils.formatResponse(200, 'Document créé avec succès', retrievedDoc, null);

        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }


    async activeForPlayer(token: any) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const userRepository: Repository<ClientDto> = dataSource.getRepository(ClientDto);
            const tokenManager = new TokenManager('votre_clé_secrète');
            const tokenData = tokenManager.verifyToken(token);
            if (tokenData.code < 200 || tokenData.code > 299) {
                return Utils.formatResponse(tokenData.code, `${tokenData.message}`, tokenData.data, tokenData.error);
            }
            const user = await userRepository.findOne({where: {id: tokenData.data.userId}});
            if (!user) {
                return Utils.formatResponse(500, 'User not found', null, null);
            }
            // Récupérez la liste de toutes les sessions existantes
            const allSessions = this.getFilesInDirectory();
            if (allSessions.length === 0) {
                return Utils.formatResponse(500, 'No session found', null, null);
            }
            try{
                for (const sessionName of allSessions) {
                    try{
                        const pouchDB = new PouchDB(`${this.directory}/${sessionName}`);
                        const doc: Document = await pouchDB.get(sessionName);
                        for (let i = 0; i < doc.sessionStatusGame.lobby.length; i++) {
                            if (doc.sessionStatusGame.lobby[i].pseudo === user?.pseudo && doc.sessionStatusGame.lobby[i].avatar === user?.avatar) {
                                const retrievedDoc = await pouchDB.get(sessionName);
                                return Utils.formatResponse(200, `Player inside session by ${sessionName}`, retrievedDoc, null);
                            }
                        }
                    }catch (error:any){
                        return Utils.formatResponse(500, error.message, null, 'Session not found');
                    }
                }
                return Utils.formatResponse(200, 'Player not inside session', null, null);
            }catch (error: any) {
                return Utils.formatResponse(500, error.message, null, null);
            }
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }
}
