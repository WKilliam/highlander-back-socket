import {DataSource, Repository} from "typeorm";
import {
    EntityCategorie,
    Game,
    SessionCreated, SessionGame,
    SessionStatusGame,
    StatusGame, TurnListEntity,
} from "../../models/room.content.models";
import {Utils} from "../../utils/utils";
import {MapsDto} from "../../dto/maps.dto";
import * as fs from 'fs';
import {FormatRestApiModels} from "../../models/formatRestApi.models";
import {Cells, Maps} from "../../models/maps.models";
import {TokenManager} from "../../utils/tokennezer/jsonwebtoken";
import {UsersServices} from "../users/users.services";
import {ClientDto} from "../../dto/clients.dto";
import {
    CurrentTurnAction,
    JoinSessionSocket,
    JoinSessionTeam,
    JoinSessionTeamCard
} from "../../models/formatSocket.models";
import {CardsDto} from "../../dto/cards.dto";
import {Can} from "../../models/enums";
import {SessionDto} from "../../dto/session.dto";

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

    async setDataInsideDb(game: FormatRestApiModels) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            if (game.data) {
                const updateSend = {
                    id: game.data.id,
                    game: {
                        sessionStatusGame: game.data.sessionStatusGame,
                        game: game.data.game,
                        maps: game.data.maps
                    }
                }
                const updateResult = await sessionRepository.update(game.data.id, updateSend);
                const updatedSession = await sessionRepository.findOne({
                    where: {id: game.data.id},
                });
                return Utils.formatResponse(200, 'Document updated successfully', updatedSession, null);
            } else {
                return Utils.formatResponse(400, 'Les données à mettre à jour sont vides ou non définies', null, null);
            }
        } catch (error) {
            return Utils.formatResponse(500, 'Erreur lors de la création du document JSON', null, error);
        }
    }

    async getFilesInDirectory() {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            const sessions = await sessionRepository.find();
            if (!sessions) {
                return Utils.formatResponse(500, 'Error get ', null, 'Error get ');
            }
            return Utils.formatResponse(200, 'Success get ', sessions, null);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Error get ', null, error);
        }
    }

    async newKeyIfNotExist() {
        let key: string = '';
        let isExist: boolean = true;
        let end: number = 0;

        while (true) {
            key = this.createGameKey();
            if (end === 5) {
                return Utils.formatResponse(500, 'Key count timeout error', 'key not found', 'Key count timeout error');
            } else {
                let sessions = await this.getFilesInDirectory()
                if (sessions.code < 200 || sessions.code > 299) {
                    return Utils.formatResponse(sessions.code, `${sessions.message}`, sessions.data, sessions.error);
                }
                let tabString: Array<string> = []
                for (let i = 0; i < sessions.data; i++) {
                    tabString.push(sessions.data.game.sessionStatusGame.room)
                }
                if (tabString.includes(key)) {
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
            const existed = await this.roomExists(room)
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            const session = await sessionRepository.find()
            let returnSession: SessionGame | null = null
            for (let i = 0; i < session.length; i++) {
                if (session[i].game.sessionStatusGame.room === room) {
                    returnSession = {
                        id: session[i].id,
                        sessionStatusGame: session[i].game.sessionStatusGame,
                        game: session[i].game.game,
                        maps: session[i].game.maps
                    }
                }
            }
            if (!returnSession) {
                return Utils.formatResponse(500, 'Session not found', null, null);
            }
            return Utils.formatResponse(200, 'Document créé avec succès', returnSession, null);
        } catch (error) {
            return Utils.formatResponse(500, 'Erreur lors de la création du document JSON', null, error);
        }
    }

    async roomExists(roomId: string) {
        let tabString: Array<string> = []
        let sessions = await this.getFilesInDirectory()
        if (sessions.code < 200 || sessions.code > 299) {
            return Utils.formatResponse(sessions.code, `${sessions.message}`, sessions.data, sessions.error);
        }
        for (let i = 0; i < sessions.data.length; i++) {
            const room = sessions.data[i].game
            tabString.push(room.sessionStatusGame.room)
        }
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
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
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
            const gamekey = await this.newKeyIfNotExist();
            if (gamekey.code === 500) {
                return Utils.formatResponse(500, 'Key count timeout error', 'key not found', 'Key count timeout error');
            }
            const sessionStatusGame: SessionStatusGame = {
                room: gamekey.data.gameKey,
                teamNames: session.teamNames,
                status: StatusGame.LOBBY,
                turnCount: 0,
                lobby: [],
                entityTurn: [],
                currentTurnEntity: {
                    turnEntity: {
                        pseudo: '',
                        teamIndex: -1,
                        cardIndex: -1,
                        typeEntity: EntityCategorie.HUMAIN,
                        luk: -1
                    },
                    dice: -1,
                    currentCell: {
                        id: -1,
                        x: -1,
                        y: -1,
                        value: 0
                    },
                    moves: [],
                    move: {
                        id: -1,
                        x: -1,
                        y: -1,
                        value: 0
                    },
                    currentAction: ''
                }
            }
            let teams = Utils.initTeamEntityPlaying(session.teamNames);
            const game: Game = {
                teams: teams,
                monsters: [],
                fightings: []
            }
            let sessionDto = new SessionDto()
            sessionDto.game = {
                sessionStatusGame: sessionStatusGame,
                game: game,
                maps: mapSimply
            };
            const sessionSend = await sessionRepository.save(sessionDto);
            if (!sessionSend) {
                return Utils.formatResponse(500, 'Error save session', null, 'Error save session');
            }
            return Utils.formatResponse(200, 'Document créé avec succès', sessionSend, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async activeForPlayer(token: any) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const userRepository: Repository<ClientDto> = dataSource.getRepository(ClientDto);
            const tokenManager = new TokenManager('votre_clé_secrète');
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            const tokenData = tokenManager.verifyToken(token);
            if (tokenData.code < 200 || tokenData.code > 299) {
                return Utils.formatResponse(tokenData.code, `${tokenData.message}`, tokenData.data, tokenData.error);
            }
            const user = await userRepository.findOne({where: {id: tokenData.data.userId}});
            if (!user) {
                return Utils.formatResponse(500, 'User not found', null, null);
            }
            // Récupérez la liste de toutes les sessions existantes
            const allSessions = await this.getFilesInDirectory();
            if (allSessions.data.length < 1) {
                return Utils.formatResponse(
                    200,
                    'No session existed',
                    null);
            }
            let tabAllSession: Array<string> = []
            for (let i = 0; i < allSessions.data.length; i++) {
                tabAllSession.push(allSessions.data[i].game.sessionStatusGame.room)
            }

            for (const sessionName of tabAllSession) {
                try {
                    console.log('sessionName', sessionName)
                    let game = await this.getSession(sessionName)
                    if (game.code < 200 || game.code > 299) {
                        return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
                    }
                    for (let i = 0; i < game.data.sessionStatusGame.lobby.length; i++) {
                        if (game.data.sessionStatusGame.lobby[i].pseudo === user?.pseudo &&
                            game.data.sessionStatusGame.lobby[i].avatar === user?.avatar) {
                            let session = await this.getSession(game.data.sessionStatusGame.room)
                            if (session.code < 200 || session.code > 299) {
                                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
                            }
                            return Utils.formatResponse(200, 'Session found', session, null);
                        }
                    }
                } catch (error: any) {
                    return Utils.formatResponse(500, error.message, null, 'Session not found');
                }
            }
            return Utils.formatResponse(200, 'Player not inside session', null, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async joinSession(data: JoinSessionSocket) {
        try {
            const existed = await this.roomExists(data.room)
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            const tokenManager = new TokenManager('votre_clé_secrète');
            const tokenData = tokenManager.verifyToken(data.token);
            if (tokenData.code < 200 || tokenData.code > 299) {
                return Utils.formatResponse(tokenData.code, `${tokenData.message}`, tokenData.data, tokenData.error);
            }
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
            let game = await this.getSession(data.room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            if (game.data.sessionStatusGame.lobby.length === 8) {
                return Utils.formatResponse(500, 'Session is full', null, null);
            }
            for (const playerLobby in game.data.sessionStatusGame.lobby) {
                if (game.data.sessionStatusGame.lobby[playerLobby].pseudo === login.data.pseudo &&
                    game.data.sessionStatusGame.lobby[playerLobby].avatar === login.data.avatar) {
                    let session = await this.getSession(game.data.sessionStatusGame.room)
                    if (session.code < 200 || session.code > 299) {
                        return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
                    }
                    return Utils.formatResponse(200, 'Session found', session.data, null);
                }
            }
            game.data.sessionStatusGame.lobby.push({
                score: 0,
                avatar: login.data.avatar,
                pseudo: login.data.pseudo,
                cards: login.data.cards,
            })
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async joinTeam(data: JoinSessionTeam) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            if (data.lobbyPosition < 0 || data.lobbyPosition > 7 || data.teamPosition < 0 || data.teamPosition > 3 || data.cardPosition < 0 || data.cardPosition > 1) {
                return Utils.formatResponse(500, 'Position not valid', null, null);
            }
            const existed: FormatRestApiModels = await this.roomExists(data.room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(data.room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            if (!game.data.game || !game.data.game.teams) {
                return Utils.formatResponse(500, 'Game or teams not found', null, null);
            }
            let newGame = Utils.initTeamEntityPlayingWithCards(
                game.data.game.teams,
                game.data.sessionStatusGame.lobby,
                data.lobbyPosition,
                data.teamPosition,
                data.cardPosition
            )
            if (newGame.code < 200 || newGame.code > 299 || !newGame) {
                return Utils.formatResponse(newGame.code, `${newGame.message}`, newGame.data, newGame.error);
            }
            game.data.game.teams = newGame.data;
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async cardSelected(data: JoinSessionTeamCard) {
        console.log('cardSelected')
        try {
            let game = await this.getSession(data.room)
            const existed = await this.roomExists(data.room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            if (!game.data.game || !game.data.game.teams) {
                return Utils.formatResponse(500, 'Game or teams not found', null, null);
            }
            let newGame = Utils.initPlaceTeamCard(
                data,
                game.data.game.teams,
                game.data.sessionStatusGame.lobby)
            if (newGame.code < 200 || newGame.code > 299 || !newGame) {
                return Utils.formatResponse(newGame.code, `${newGame.message}`, newGame.data, newGame.error);
            }
            game.data.game.teams = newGame.data;
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async startGame(room: string) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const cardsRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            let needMinimumOnePlayer = Utils.getIfJustOnePlayerHaveCard(game.data.game.teams)
            if (!needMinimumOnePlayer) {
                return Utils.formatResponse(500, 'Need minimum one player have card', null, null);
            }
            const cards = await cardsRepository.find({
                select: [
                    "id",
                    "name",
                    "description",
                    "image",
                    "rarity",
                    "atk",
                    "def",
                    "spd",
                    "luk",
                    "createdAt",
                    "deck",
                    "effects",
                    "capacities"
                ],
                relations: [
                    "deck",
                    "effects",
                    "capacities"
                ],
            });
            if (!cards) {
                return Utils.formatResponse(500, 'Cards not found', null, null);
            }
            game.data.sessionStatusGame.status = StatusGame.GAME;
            game.data.game.monsters = Utils.initMonsterEntityPlaying(cards, game.data.maps.cellsGrid)
            const monsterCells = game.data.game.monsters.map(monster => {
                return monster.cellPosition
            })
            game.data.game.teams = Utils.placeEntityPlayer(game.data.game.teams, game.data.maps.cellsGrid, monsterCells)
            game.data.sessionStatusGame.entityTurn = Utils.turnInit(game.data.game)
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async whoIsTurn(room: string) {
        try {
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            const entity = game.data.sessionStatusGame.entityTurn[0]
            game.data.sessionStatusGame.currentTurnEntity = {
                turnEntity: entity,
                currentCell: {
                    id: -1,
                    x: -1,
                    y: -1,
                    value: 0
                },
                dice: -1,
                move: {
                    id: -1,
                    x: -1,
                    y: -1,
                    value: 0
                },
                moves: [],
                currentAction: Can.START_TURN
            }
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async startTurn(action: CurrentTurnAction, room: string) {
        try {
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            game.data.sessionStatusGame.currentTurnEntity = {
                ...action,
                currentAction: Can.SEND_DICE
            }
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }


    async sendDice(action: CurrentTurnAction, room: string) {
        try {
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            if (action.currentCell.id === -1) {
                return Utils.formatResponse(500, 'Current cell not found', null, null);
            }
            if (action.dice === -1) {
                return Utils.formatResponse(500, 'Dice not found', null, null);
            }
            const startId = action.currentCell.id ?? -1
            if (startId === -1) {
                return Utils.formatResponse(500, 'Current cell not found', null, null);
            }
            const cells = Utils.findCellsAtDistance(
                game.data.maps.cellsGrid,
                startId,
                action.dice
            )
            if (cells.data.length === 0) {
                return Utils.formatResponse(500, 'Cells not found', null, null);
            }
            game.data.sessionStatusGame.currentTurnEntity = {
                ...action,
                currentAction: Can.CHOOSE_MOVE,
                moves: cells.data
            }
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async chooseMove(action: CurrentTurnAction, room: string) {
        try {
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            if (game.data.sessionStatusGame.currentTurnEntity.move.id === -1) {
                return Utils.formatResponse(500, 'Move not found', null, null);
            }
            game.data.sessionStatusGame.currentTurnEntity = {
                ...action,
                currentAction: Can.MOVE,
            }
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async move(action: CurrentTurnAction, room: string) {
        try {
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }

            game.data.sessionStatusGame.currentTurnEntity = {
                ...action,
                currentAction: Can.END_MOVE,
            }
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async endMove(action: CurrentTurnAction, room: string) {
        try {
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            game.data.sessionStatusGame.currentTurnEntity = {
                ...action,
                currentAction: Can.END_TURN,
            }
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async endTurn(action: CurrentTurnAction, room: string) {
        try {
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            game.data.sessionStatusGame.currentTurnEntity = {
                ...action,
                currentAction: Can.START_GAME,
            }
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }


}
