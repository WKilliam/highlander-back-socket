import {DataSource, Repository} from "typeorm";
import {Utils} from "../../utils/utils";
import {MapsDto} from "../../dto/maps.dto";
import {FormatRestApiModels} from "../../models/formatRestApi";
import {Cells, Maps} from "../../models/maps.models";
import {UsersServices} from "../users/users.services";
import {SessionDto} from "../../dto/session.dto";
import {SessionCreated} from "../../models/room.content.models";
import {Game, SessionModels, SessionStatusGame} from "../../models/session.models";
import {PlayerLobby} from "../../models/player.models";
import {ConstantText} from "../../utils/constant.text";
import {TokenManager} from "../../utils/tokennezer/jsonwebtoken";
import { promises as fsPromises } from 'fs';


interface GameKey {
    gameKey: string;
}

export class SessionsServices {
    dataSourceConfig: Promise<DataSource>;
    private userServices: UsersServices;
    private textSuccesCanJoinRoom0 = ConstantText.hashMapText.get('Succes-canJoinRoom-0') ?? 'XXX'
    private textSuccesCanJoinRoom = ConstantText.hashMapText.get('Succes-canJoinRoom') ?? 'XXX'
    private successCreateSession = ConstantText.hashMapText.get('Success-updateSession') ?? 'XXX'

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

    async getAllSessionInDb() {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            const sessions = await sessionRepository.find();
            if (!sessions) {
                return FormatRestApiModels.createFormatRestApi(500, 'Error get ', null, 'Error get ');
            }
            return FormatRestApiModels.createFormatRestApi(200, 'Success get ', sessions, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, 'Error get ', null, error);
        }
    }

    async newKeyIfNotExist() {
        let key: string = '';
        let isExist: boolean = true;
        let end: number = 0;

        while (true) {
            key = this.createGameKey();
            if (end === 5) {
                return FormatRestApiModels.createFormatRestApi(500, 'Key count timeout error', 'key not found', 'Key count timeout error');
            } else {
                let sessions = await this.getAllSessionInDb()
                if (Utils.codeErrorChecking(sessions.code)) {
                    return FormatRestApiModels.createFormatRestApi(sessions.code, `${sessions.message}`, sessions.data, sessions.error);
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
                    return FormatRestApiModels.createFormatRestApi(200, 'Key success', gameKey, '');
                }
            }
        }
    }

    async updateSession(room: string, session: SessionDto) {
        try {
            const existed = await this.roomExists(room)
            if (Utils.codeErrorChecking(existed.code)) return FormatRestApiModels.createFormatRestApi(existed.code, `${existed.message}`, existed.data, existed.error);
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            const updateResult = await sessionRepository.update(session.id, session);
            const updatedSession = await sessionRepository.findOne({
                where: {id: session.id},
            });
            // Assurez-vous que updatedSession n'est pas undefined avant de tenter de l'écrire dans un fichier.
            if (updatedSession) {
                // Convertir l'objet de session en chaîne JSON
                const sessionData = JSON.stringify(updatedSession, null, 2);
                // Écrire le fichier JSON à la racine du projet
                await fsPromises.writeFile('updatedSession.json', sessionData, 'utf8');
            }
            return FormatRestApiModels.createFormatRestApi(200, this.successCreateSession, updatedSession, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
        }
    }

    async getSession(room: string) {
        try {
            const existed = await this.roomExists(room)
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            if (Utils.codeErrorChecking(existed.code)) {
                return FormatRestApiModels.createFormatRestApi(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            const session = await sessionRepository.find()
            let returnSession: SessionDto | null = null
            for (let i = 0; i < session.length; i++) {
                if (session[i].game.sessionStatusGame.room === room) {
                    returnSession = {
                        id: session[i].id,
                        game: session[i].game
                    }
                }
            }
            if (!returnSession) {
                return FormatRestApiModels.createFormatRestApi(500, 'Session not found', null, null);
            }
            return FormatRestApiModels.createFormatRestApi(200, 'Document créé avec succès', returnSession, null);
        } catch (error) {
            return FormatRestApiModels.createFormatRestApi(500, 'Erreur lors de la création du document JSON', null, error);
        }
    }

    async roomExists(roomId: string) {
        let tabString: Array<string> = []
        let sessions = await this.getAllSessionInDb()
        if (Utils.codeErrorChecking(sessions.code)) {
            return FormatRestApiModels.createFormatRestApi(sessions.code, `${sessions.message}`, sessions.data, sessions.error);
        }
        for (let i = 0; i < sessions.data.length; i++) {
            const room = sessions.data[i].game
            tabString.push(room.sessionStatusGame.room)
        }
        if (tabString.includes(roomId)) {
            return FormatRestApiModels.createFormatRestApi(200, 'Room exists', null, null);
        } else {
            return FormatRestApiModels.createFormatRestApi(500, 'Room not found', null, null);
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
                return FormatRestApiModels.createFormatRestApi(500, 'Map not found', 'map not found', 'Map not found');
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
                return FormatRestApiModels.createFormatRestApi(500, 'Key count timeout error', 'key not found', 'Key count timeout error');
            }
            const tokenManager = new TokenManager('votre_clé_secrète');
            const tokenData = tokenManager.verifyToken(session.token);
            const login = await this.userServices.login({
                email: tokenData.data.email,
                password: tokenData.data.password
            })
            if (Utils.codeErrorChecking(login.code)) return FormatRestApiModels.createFormatRestApi(login.code, `${login.message}`, login.data, login.error);
            const sessionStatusGame: SessionStatusGame = SessionModels.createSessionStatusGame(gamekey.data.gameKey, session.teamNames)
            const game: Game = SessionModels.initGame(session.teamNames)
            let sessionDto = new SessionDto()
            sessionDto.game = {
                sessionStatusGame: sessionStatusGame,
                game: game,
                maps: mapSimply
            };
            sessionDto.game.sessionStatusGame.lobby.push(login.data)
            const sessionSend = await sessionRepository.save(sessionDto);
            return FormatRestApiModels.createFormatRestApi(200, 'Document créé avec succès', sessionSend, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
        }
    }

    async checkIfUserInsideSession(avatar: string, pseudo: string) {
        try {
            const getSession = await this.getAllSessionInDb()
            const sessionDtoDefault: SessionDto = {id: -1, game: SessionModels.initSessionGame()}
            if (Utils.codeErrorChecking(getSession.code)) {
                return FormatRestApiModels.createFormatRestApi(getSession.code, `${getSession.message}`, getSession.data, getSession.error);
            }
            if (getSession.data.length < 1) {
                return FormatRestApiModels.createFormatRestApi(200, this.textSuccesCanJoinRoom, sessionDtoDefault, '');
            }
            let isInside = false
            let indexSession = ''
            getSession.data.forEach((session: SessionDto, index: number) => {
                session.game.sessionStatusGame.lobby.filter((player: PlayerLobby) => {
                    if (player.pseudo === pseudo && player.avatar === avatar) {
                        isInside = true
                        indexSession = session.game.sessionStatusGame.room
                    }
                })
            })
            if (isInside) {
                const insideSession = await this.getSession(indexSession)
                // player inside session
                return FormatRestApiModels.createFormatRestApi(200, this.textSuccesCanJoinRoom0, insideSession.data, '');
            } else {
                // player not inside session and can join
                return FormatRestApiModels.createFormatRestApi(200, this.textSuccesCanJoinRoom, sessionDtoDefault, '');
            }
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
        }
    }

}
