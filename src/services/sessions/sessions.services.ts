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
    JoinSessionTeamCard, PlayerStatusSession
} from "../../models/formatSocket.models";
import {CardsDto} from "../../dto/cards.dto";
import {Can} from "../../models/enums";
import {SessionDto} from "../../dto/session.dto";
import {PlayerLobby} from "../../models/player.models";

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
                        luk: -1,
                        cellPosition: {
                            id: -1,
                            x: -1,
                            y: -1,
                            value: 0
                        },
                    },
                    indexInsideArray: -1,
                    dice: -1,
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

    async setDataInsideDb(game: FormatRestApiModels) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            if (game.data) {
                const updateSend = {
                    id: game.data.id,
                    game: {
                        sessionStatusGame: game.data.game.sessionStatusGame,
                        game: game.data.game.game,
                        maps: game.data.game.maps
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

    async playerStatusSession(playerStatusSession: PlayerStatusSession) {
        try {
            if (playerStatusSession.room !== null && playerStatusSession.room !== undefined) {
                // partie join
                const existed = await this.roomExists(playerStatusSession.room)
                if (existed.code < 200 || existed.code > 299) {
                    return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
                }
                let user = await this.userServices.getUserSimplified(playerStatusSession.token)
                if (user.code < 200 || user.code > 299) {
                    return Utils.formatResponse(user.code, `${user.message}`, user.data, user.error);
                }
                let game = await this.getSession(playerStatusSession.room)
                if (game.code < 200 || game.code > 299) {
                    return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
                }
                let isInside = false

                game.data.game.sessionStatusGame.lobby.forEach((player: PlayerLobby, index: number) => {
                    if (player.pseudo === user.data.pseudo && player.avatar === user.data.avatar) {
                        isInside = true
                    }
                })
                if (isInside) {
                    return game
                } else {
                    game.data.game.sessionStatusGame.lobby.push({
                        score: 0,
                        avatar: user.data.avatar,
                        pseudo: user.data.pseudo,
                        cards: user.data.cards,
                    })
                    const session = await this.setDataInsideDb({
                        date: new Date().toISOString(),
                        code: 200,
                        message: 'Document created succes',
                        data: game.data,
                        error: null
                    })
                    if (session.code < 200 || session.code > 299) {
                        return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
                    }
                    return Utils.formatResponse(200, 'Document created succes', session.data, null);
                }
            } else {
                // partie get inside
                let user = await this.userServices.getUserSimplified(playerStatusSession.token)
                if (user.code < 200 || user.code > 299) {
                    return Utils.formatResponse(user.code, `${user.message}`, user.data, user.error);
                }
                // Récupérez la liste de toutes les sessions existantes
                const allSessions = await this.getFilesInDirectory();
                if (allSessions.code < 200 || allSessions.code > 299) {
                    return Utils.formatResponse(allSessions.code, `${allSessions.message}`, allSessions.data, allSessions.error);
                }
                const sessions: Array<SessionDto> = allSessions.data
                if (sessions.length < 1) {
                    return Utils.formatResponse(
                        200,
                        'No session existed',
                        null,
                        null);
                } else {
                    let isInside = false
                    let indixSession = -1
                    sessions.forEach((session: SessionDto, index: number) => {
                        session.game.sessionStatusGame.lobby.forEach((player: PlayerLobby, index: number) => {
                            if (player.pseudo === user.data.pseudo && player.avatar === user.data.avatar) {
                                isInside = true
                                indixSession = index
                            }
                        })
                    })
                    if (isInside) {
                        return Utils.formatResponse(200, 'Player already inside session', allSessions.data[indixSession], null);
                    } else {
                        return Utils.formatResponse(200, 'Player not inside session', [], null);
                    }
                }
            }
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
            let newGame = Utils.initTeamEntityPlayingWithCards(
                game.data.game.game.teams,
                game.data.game.sessionStatusGame.lobby,
                data.lobbyPosition,
                data.teamPosition,
                data.cardPosition
            )
            if (newGame.code < 200 || newGame.code > 299 || !newGame) {
                return Utils.formatResponse(newGame.code, `${newGame.message}`, newGame.data, newGame.error);
            }
            game.data.game.teams = newGame.data;
            const session = await this.setDataInsideDb({
                date: new Date().toISOString(),
                code: 200,
                message: 'Document created succes',
                data: game.data,
                error: null
            })
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            console.log('session', session)
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
            if (!game.data.game.game || !game.data.game.game.teams) {
                return Utils.formatResponse(500, 'Game or teams not found', null, null);
            }
            let newGame = Utils.initPlaceTeamCard(
                data,
                game.data.game.game.teams,
                game.data.game.sessionStatusGame.lobby)
            if (newGame.code < 200 || newGame.code > 299 || !newGame) {
                return Utils.formatResponse(newGame.code, `${newGame.message}`, newGame.data, newGame.error);
            }
            game.data.game.game.teams = newGame.data;
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', session.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

    async creatList(room: string) {
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
            let needMinimumOnePlayer = Utils.getIfJustOnePlayerHaveCard(game.data.game.game.teams)
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
            game.data.game.sessionStatusGame.status = StatusGame.GAME;
            game.data.game.game.monsters = Utils.initMonsterEntityPlaying(cards, game.data.game.maps.cellsGrid)
            const monsterCells = game.data.game.game.monsters.map(monster => {
                return monster.cellPosition
            })
            game.data.game.game.teams = Utils.placeEntityPlayer(game.data.game.game.teams, game.data.game.maps.cellsGrid, monsterCells)
            game.data.game.sessionStatusGame.entityTurn = Utils.turnInit(game.data.game.game)
            game.data.game.sessionStatusGame.currentTurnEntity = {
                turnEntity: game.data.game.sessionStatusGame.entityTurn[0],
                dice: -1,
                moves: [],
                indexInsideArray: 0,
                move: {
                    id: -1,
                    x: -1,
                    y: -1,
                    value: 0
                },
                currentAction: Can.WHO_IS_TURN
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

    async roolingTurn(room: string, entityTurn: CurrentTurnAction) {
        try {
            const existed = await this.roomExists(room)
            if (existed.code < 200 || existed.code > 299) {
                return Utils.formatResponse(existed.code, `${existed.message}`, existed.data, existed.error);
            }
            let game = await this.getSession(room)
            if (game.code < 200 || game.code > 299) {
                return Utils.formatResponse(game.code, `${game.message}`, game.data, game.error);
            }
            switch (entityTurn.currentAction) {
                case Can.WHO_IS_TURN:
                    game.data.game.sessionStatusGame.currentTurnEntity = {
                        ...entityTurn,
                        currentAction: Can.SEND_DICE
                    }
                    break
                case Can.SEND_DICE:
                    let cell = entityTurn.turnEntity.cellPosition?.id ?? -1
                    if (cell === -1) {
                        return Utils.formatResponse(500, 'Entity not found', null, null);
                    }
                    let findAllMoving = Utils.findCellsAtDistance(game.data.game.maps.cellsGrid, cell, entityTurn.dice)
                    if (findAllMoving.code < 200 || findAllMoving.code > 299) {
                        return Utils.formatResponse(findAllMoving.code, `${findAllMoving.message}`, findAllMoving.data, findAllMoving.error);
                    }
                    game.data.game.sessionStatusGame.currentTurnEntity = {
                        ...entityTurn,
                        moves: findAllMoving.data,
                        currentAction: Can.CHOOSE_MOVE
                    }
                    break
                case Can.CHOOSE_MOVE:
                    game.data.game.sessionStatusGame.currentTurnEntity = {
                        ...entityTurn,
                        currentAction: Can.MOVE
                    }
                    break
                case Can.MOVE:
                    game.data.game.sessionStatusGame.currentTurnEntity = {
                        ...entityTurn,
                        currentAction: Can.END_MOVE
                    }
                    break
                case Can.END_MOVE:
                    game.data.game.sessionStatusGame.currentTurnEntity = {
                        ...entityTurn,
                        currentAction: Can.END_TURN
                    }
                    break
                case Can.END_TURN:
                    console.log('currentTurnEntity', entityTurn);
                    const nextPlayerIndex = entityTurn.indexInsideArray + 1;
                    if (nextPlayerIndex < game.data.game.sessionStatusGame.entityTurn.length) {
                        // Le joueur suivant existe dans la liste
                        const nextPlayer = game.data.game.sessionStatusGame.entityTurn[nextPlayerIndex];
                        game.data.game.sessionStatusGame.currentTurnEntity = {
                            turnEntity: nextPlayer,
                            indexInsideArray: nextPlayerIndex,
                            dice: -1,
                            moves: [],
                            move: {
                                id: -1,
                                x: -1,
                                y: -1,
                                value: -1,
                            },
                            currentAction: Can.NEXT_TURN
                        };
                    } else {
                        // Le cycle de tours est terminé, recréez la liste des joueurs
                        const newTurn = await this.creatList(room);
                        if (newTurn.code < 200 || newTurn.code > 299) {
                            return Utils.formatResponse(newTurn.code, `${newTurn.message}`, newTurn.data, newTurn.error);
                        }
                        newTurn.data.game.sessionStatusGame.turnCount++;

                        // Réinitialise le jeu avec le premier joueur dans la liste
                        const firstPlayer = newTurn.data.game.sessionStatusGame.entityTurn[0];

                        newTurn.data.game.sessionStatusGame.currentTurnEntity = {
                            turnEntity: firstPlayer,
                            indexInsideArray: 0,
                            dice: -1,
                            moves: [],
                            move: {
                                id: -1,
                                x: -1,
                                y: -1,
                                value: -1,
                            },
                            currentAction: Can.NEXT_TURN
                        };
                        game = newTurn;
                    }
                    break
                case Can.END_GAME:
                    break
                default:
                    return Utils.formatResponse(200, 'error Action', null, null)
            }
            const session = await this.setDataInsideDb(game)
            if (session.code < 200 || session.code > 299) {
                return Utils.formatResponse(session.code, `${session.message}`, session.data, session.error);
            }
            return Utils.formatResponse(200, 'Document created succes', game.data, null);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

}
