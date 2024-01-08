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
            if(Utils.codeErrorChecking(existed.code)) return FormatRestApiModels.createFormatRestApi(existed.code, `${existed.message}`, existed.data, existed.error);
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            const updateResult = await sessionRepository.update(session.id, session);
            const updatedSession = await sessionRepository.findOne({
                where: {id: session.id},
            });
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
            const sessionStatusGame: SessionStatusGame = SessionModels.createSessionStatusGame(gamekey.data.gameKey, session.teamNames)
            const game: Game = SessionModels.initGame(session.teamNames)
            let sessionDto = new SessionDto()
            sessionDto.game = {
                sessionStatusGame: sessionStatusGame,
                game: game,
                maps: mapSimply
            };
            const sessionSend = await sessionRepository.save(sessionDto);
            if (!sessionSend) {
                return FormatRestApiModels.createFormatRestApi(500, 'Error save session', null, 'Error save session');
            }
            return FormatRestApiModels.createFormatRestApi(200, 'Document créé avec succès', sessionSend, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
        }
    }

    async checkIfUserInsideSession(avatar: string, pseudo: string) {
        try {
            const getSession = await this.getAllSessionInDb()
            if (Utils.codeErrorChecking(getSession.code)) {
                return FormatRestApiModels.createFormatRestApi(getSession.code, `${getSession.message}`, getSession.data, getSession.error);
            }
            if(getSession.data.length < 1) {
                return FormatRestApiModels.createFormatRestApi(200, this.textSuccesCanJoinRoom, true, '');
            }
            let isInside = false
            let indexSession = -1
            getSession.data.forEach((session: SessionDto, index: number) => {
                console.log(session)
                session.game.sessionStatusGame.lobby.filter((player: PlayerLobby, index: number) => {
                    if (player.pseudo === pseudo && player.avatar === avatar) {
                        isInside = true
                        indexSession = index
                    }
                })
            })
            if (isInside) {
                return FormatRestApiModels.createFormatRestApi(200, this.textSuccesCanJoinRoom0, getSession.data[indexSession], '');
            } else {
                return FormatRestApiModels.createFormatRestApi(200, this.textSuccesCanJoinRoom, true, '');
            }
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
        }
    }




    // async setDataInsideDb(game: FormatRestApi) {
    //     try {
    //         const dataSource: DataSource = await this.dataSourceConfig;
    //         const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
    //         if (game.data) {
    //             const updateSend = {
    //                 id: game.data.id,
    //                 game: {
    //                     sessionStatusGame: game.data.game.sessionStatusGame,
    //                     game: game.data.game.game,
    //                     maps: game.data.game.maps
    //                 }
    //             }
    //             const updateResult = await sessionRepository.update(game.data.id, updateSend);
    //             const updatedSession = await sessionRepository.findOne({
    //                 where: {id: game.data.id},
    //             });
    //
    //             return FormatRestApiModels.createFormatRestApi(200, 'Document updated successfully', updatedSession, null);
    //         } else {
    //             return FormatRestApiModels.createFormatRestApi(400, 'Les données à mettre à jour sont vides ou non définies', null, null);
    //         }
    //     } catch (error) {
    //         return FormatRestApiModels.createFormatRestApi(500, 'Erreur lors de la création du document JSON', null, error);
    //     }
    // }

    // async playerStatusSession(playerStatusSession: PlayerStatusSession) {
    //     try {
    //         if (playerStatusSession.room !== null && playerStatusSession.room !== undefined) {
    //             // partie join
    //             const existed = await this.roomExists(playerStatusSession.room)
    //             if (existed.code < 200 || existed.code > 299) {
    //                 return FormatRestApiModels.createFormatRestApi(existed.code, `${existed.message}`, existed.data, existed.error);
    //             }
    //             let user = await this.userServices.getUserSimplified(playerStatusSession.token)
    //             if (user.code < 200 || user.code > 299) {
    //                 return FormatRestApiModels.createFormatRestApi(user.code, `${user.message}`, user.data, user.error);
    //             }
    //             let game = await this.getSession(playerStatusSession.room)
    //             if (game.code < 200 || game.code > 299) {
    //                 return FormatRestApiModels.createFormatRestApi(game.code, `${game.message}`, game.data, game.error);
    //             }
    //             let isInside = false
    //
    //             game.data.game.sessionStatusGame.lobby.forEach((player: PlayerLobby, index: number) => {
    //                 if (player.pseudo === user.data.pseudo && player.avatar === user.data.avatar) {
    //                     isInside = true
    //                 }
    //             })
    //             if (isInside) {
    //                 return game
    //             } else {
    //                 game.data.game.sessionStatusGame.lobby.push({
    //                     score: 0,
    //                     avatar: user.data.avatar,
    //                     pseudo: user.data.pseudo,
    //                     cards: user.data.cards,
    //                 })
    //                 const session = await this.setDataInsideDb({
    //                     date: new Date().toISOString(),
    //                     code: 200,
    //                     message: 'Document created succes',
    //                     data: game.data,
    //                     error: null
    //                 })
    //                 if (session.code < 200 || session.code > 299) {
    //                     return FormatRestApiModels.createFormatRestApi(session.code, `${session.message}`, session.data, session.error);
    //                 }
    //                 return FormatRestApiModels.createFormatRestApi(200, 'Document created succes', session.data, null);
    //             }
    //         } else {
    //             // partie get inside
    //             let user = await this.userServices.getUserSimplified(playerStatusSession.token)
    //             if (user.code < 200 || user.code > 299) {
    //                 return FormatRestApiModels.createFormatRestApi(user.code, `${user.message}`, user.data, user.error);
    //             }
    //             // Récupérez la liste de toutes les sessions existantes
    //             const allSessions = await this.getFilesInDirectory();
    //             if (allSessions.code < 200 || allSessions.code > 299) {
    //                 return FormatRestApiModels.createFormatRestApi(allSessions.code, `${allSessions.message}`, allSessions.data, allSessions.error);
    //             }
    //             const sessions: Array<SessionDto> = allSessions.data
    //             if (sessions.length < 1) {
    //                 return FormatRestApiModels.createFormatRestApi(
    //                     200,
    //                     'No session existed',
    //                     null,
    //                     null);
    //             } else {
    //                 let isInside = false
    //                 let indexSession = -1
    //                 sessions.forEach((session: SessionDto, index: number) => {
    //                     session.game.sessionStatusGame.lobby.forEach((player: PlayerLobby, indexPlayer: number) => {
    //                         if (player.pseudo === user.data.pseudo && player.avatar === user.data.avatar) {
    //                             isInside = true
    //                             indexSession = index
    //                         }
    //                     })
    //                 })
    //                 console.log('isInside', allSessions)
    //                 console.log('sessions', sessions)
    //                 if (isInside) {
    //                     return FormatRestApiModels.createFormatRestApi(
    //                         200,
    //                         'Player already inside session',
    //                         allSessions.data[indexSession],
    //                         null);
    //                 } else {
    //                     return FormatRestApiModels.createFormatRestApi(200, 'Player not inside session', [], null);
    //                 }
    //             }
    //         }
    //     } catch (error: any) {
    //         return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
    //     }
    // }
    //
    // async joinTeam(data: JoinSessionTeam) {
    //     try {
    //         const dataSource: DataSource = await this.dataSourceConfig;
    //         if (data.lobbyPosition < 0 || data.lobbyPosition > 7 || data.teamPosition < 0 || data.teamPosition > 3 || data.cardPosition < 0 || data.cardPosition > 1) {
    //             return FormatRestApiModels.createFormatRestApi(500, 'Position not valid', null, null);
    //         }
    //         const existed: FormatRestApiModels = await this.roomExists(data.room)
    //         if (existed.code < 200 || existed.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(existed.code, `${existed.message}`, existed.data, existed.error);
    //         }
    //         let game = await this.getSession(data.room)
    //         if (game.code < 200 || game.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(game.code, `${game.message}`, game.data, game.error);
    //         }
    //         let newGame = Utils.initTeamEntityPlayingWithCards(
    //             game.data.game.game.teams,
    //             game.data.game.sessionStatusGame.lobby,
    //             data.lobbyPosition,
    //             data.teamPosition,
    //             data.cardPosition
    //         )
    //         if (newGame.code < 200 || newGame.code > 299 || !newGame) {
    //             return FormatRestApiModels.createFormatRestApi(newGame.code, `${newGame.message}`, newGame.data, newGame.error);
    //         }
    //         game.data.game.teams = newGame.data;
    //         const session = await this.setDataInsideDb({
    //             date: new Date().toISOString(),
    //             code: 200,
    //             message: 'Document created succes',
    //             data: game.data,
    //             error: null
    //         })
    //         if (session.code < 200 || session.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(session.code, `${session.message}`, session.data, session.error);
    //         }
    //         this.ecrireObjetJSONDansFichier(session.data)
    //         return FormatRestApiModels.createFormatRestApi(200, 'Document created succes', session.data, null);
    //     } catch (error: any) {
    //         return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
    //     }
    // }
    //
    // async cardSelected(data: JoinSessionTeamCard) {
    //     console.log('cardSelected')
    //     try {
    //         let game = await this.getSession(data.room)
    //         const existed = await this.roomExists(data.room)
    //         if (existed.code < 200 || existed.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(existed.code, `${existed.message}`, existed.data, existed.error);
    //         }
    //         if (!game.data.game.game || !game.data.game.game.teams) {
    //             return FormatRestApiModels.createFormatRestApi(500, 'Game or teams not found', null, null);
    //         }
    //         let newGame = Utils.initPlaceTeamCard(
    //             data,
    //             game.data.game.game.teams,
    //             game.data.game.sessionStatusGame.lobby)
    //         if (newGame.code < 200 || newGame.code > 299 || !newGame) {
    //             return FormatRestApiModels.createFormatRestApi(newGame.code, `${newGame.message}`, newGame.data, newGame.error);
    //         }
    //         game.data.game.game.teams = newGame.data;
    //         const session = await this.setDataInsideDb(game)
    //         if (session.code < 200 || session.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(session.code, `${session.message}`, session.data, session.error);
    //         }
    //         return FormatRestApiModels.createFormatRestApi(200, 'Document created succes', session.data, null);
    //     } catch (error: any) {
    //         return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
    //     }
    // }
    //
    // async creatList(room: string) {
    //     try {
    //         const dataSource: DataSource = await this.dataSourceConfig;
    //         const cardsRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
    //         const existed = await this.roomExists(room)
    //         if (existed.code < 200 || existed.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(existed.code, `${existed.message}`, existed.data, existed.error);
    //         }
    //         let game = await this.getSession(room)
    //         if (game.code < 200 || game.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(game.code, `${game.message}`, game.data, game.error);
    //         }
    //         let needMinimumOnePlayer = Utils.getIfJustOnePlayerHaveCard(game.data.game.game.teams)
    //         if (!needMinimumOnePlayer) {
    //             return FormatRestApiModels.createFormatRestApi(500, 'Need minimum one player have card', null, null);
    //         }
    //         const cards = await cardsRepository.find({
    //             select: [
    //                 "id",
    //                 "name",
    //                 "description",
    //                 "image",
    //                 "rarity",
    //                 "atk",
    //                 "def",
    //                 "spd",
    //                 "luk",
    //                 "createdAt",
    //                 "deck",
    //                 "effects",
    //                 "capacities"
    //             ],
    //             relations: [
    //                 "deck",
    //                 "effects",
    //                 "capacities"
    //             ],
    //         });
    //         if (!cards) {
    //             return FormatRestApiModels.createFormatRestApi(500, 'Cards not found', null, null);
    //         }
    //         game.data.game.sessionStatusGame.status = StatusGame.GAME;
    //         game.data.game.game.monsters = Utils.initMonsterEntityPlaying(cards, game.data.game.maps.cellsGrid)
    //         const monsterCells = game.data.game.game.monsters.map(monster => {
    //             return monster.cellPosition
    //         })
    //         game.data.game.game.teams = Utils.placeEntityPlayer(game.data.game.game.teams, game.data.game.maps.cellsGrid, monsterCells)
    //         game.data.game.sessionStatusGame.entityTurn = Utils.turnInit(game.data.game.game)
    //         game.data.game.sessionStatusGame.currentTurnEntity = {
    //             turnEntity: game.data.game.sessionStatusGame.entityTurn[0],
    //             dice: -1,
    //             moves: [],
    //             indexInsideArray: 0,
    //             move: {
    //                 id: -1,
    //                 x: -1,
    //                 y: -1,
    //                 value: 0
    //             },
    //             currentAction: Can.WHO_IS_TURN
    //         }
    //         const session = await this.setDataInsideDb(game)
    //         if (session.code < 200 || session.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(session.code, `${session.message}`, session.data, session.error);
    //         }
    //         return FormatRestApiModels.createFormatRestApi(200, 'Document created succes', session.data, null);
    //     } catch (error: any) {
    //         return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
    //     }
    // }
    //
    // async roolingTurn(room: string, entityTurn: CurrentTurnAction) {
    //     try {
    //         const existed = await this.roomExists(room)
    //         if (existed.code < 200 || existed.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(existed.code, `${existed.message}`, existed.data, existed.error);
    //         }
    //         let game = await this.getSession(room)
    //         if (game.code < 200 || game.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(game.code, `${game.message}`, game.data, game.error);
    //         }
    //         switch (entityTurn.currentAction) {
    //             case Can.WHO_IS_TURN:
    //                 game.data.game.sessionStatusGame.currentTurnEntity = {
    //                     ...entityTurn,
    //                     currentAction: Can.SEND_DICE
    //                 }
    //                 break
    //             case Can.SEND_DICE:
    //                 let cell = entityTurn.turnEntity.cellPosition?.id ?? -1
    //                 if (cell === -1) {
    //                     return FormatRestApiModels.createFormatRestApi(500, 'Entity not found', null, null);
    //                 }
    //                 let findAllMoving = Utils.findCellsAtDistance(game.data.game.maps.cellsGrid, cell, entityTurn.dice)
    //                 if (findAllMoving.code < 200 || findAllMoving.code > 299) {
    //                     return FormatRestApiModels.createFormatRestApi(findAllMoving.code, `${findAllMoving.message}`, findAllMoving.data, findAllMoving.error);
    //                 }
    //                 game.data.game.sessionStatusGame.currentTurnEntity = {
    //                     ...entityTurn,
    //                     moves: findAllMoving.data,
    //                     currentAction: Can.CHOOSE_MOVE
    //                 }
    //                 break
    //             case Can.CHOOSE_MOVE:
    //                 game.data.game.sessionStatusGame.currentTurnEntity = {
    //                     ...entityTurn,
    //                     currentAction: Can.MOVE
    //                 }
    //                 break
    //             case Can.MOVE:
    //                 game.data.game.sessionStatusGame.currentTurnEntity = {
    //                     ...entityTurn,
    //                     currentAction: Can.END_MOVE
    //                 }
    //                 break
    //             case Can.END_MOVE:
    //                 game.data.game.sessionStatusGame.currentTurnEntity = {
    //                     ...entityTurn,
    //                     currentAction: Can.END_TURN
    //                 }
    //                 if(entityTurn.turnEntity.typeEntity === EntityCategorie.COMPUTER) {
    //                     game.data.game.game.monsters[entityTurn.turnEntity.teamIndex].cellPosition = entityTurn.move
    //                     game.data.game.sessionStatusGame.entityTurn.forEach((entity: TurnListEntity, index: number) => {
    //                         if(entity.team === entityTurn.turnEntity.team){
    //                             entity.cellPosition = entityTurn.move
    //                         }
    //                     })
    //                 }else{
    //                     game.data.game.game.teams[entityTurn.turnEntity.teamIndex].cellPosition = entityTurn.move
    //                     game.data.game.sessionStatusGame.entityTurn.forEach((entity: TurnListEntity, index: number) => {
    //                         if(entity.team === entityTurn.turnEntity.team){
    //                             entity.cellPosition = entityTurn.move
    //                         }
    //                     })
    //                 }
    //                 break
    //             case Can.END_TURN:
    //
    //                 const nextPlayerIndex = entityTurn.indexInsideArray + 1;
    //                 if (nextPlayerIndex < game.data.game.sessionStatusGame.entityTurn.length) {
    //                     // the next player in the list
    //                     const nextPlayer = game.data.game.sessionStatusGame.entityTurn[nextPlayerIndex];
    //                     game.data.game.sessionStatusGame.currentTurnEntity = {
    //                         turnEntity: nextPlayer,
    //                         indexInsideArray: nextPlayerIndex,
    //                         dice: -1,
    //                         moves: [],
    //                         move: {
    //                             id: -1,
    //                             x: -1,
    //                             y: -1,
    //                             value: -1,
    //                         },
    //                         currentAction: Can.NEXT_TURN
    //                     };
    //                     // console.log('nextPlayer', game.data.game.sessionStatusGame.currentTurnEntity);
    //                 } else {
    //                     game.data.game.sessionStatusGame.entityTurn = Utils.turnInit(game.data.game.game)
    //                     game.data.game.sessionStatusGame.turnCount = game.data.game.sessionStatusGame.turnCount + 1
    //                     // reset the list to the first player
    //                     const firstPlayer = game.data.game.sessionStatusGame.entityTurn[0];
    //                     game.data.game.sessionStatusGame.currentTurnEntity = {
    //                         turnEntity: firstPlayer,
    //                         indexInsideArray: 0,
    //                         dice: -1,
    //                         moves: [],
    //                         move: {
    //                             id: -1,
    //                             x: -1,
    //                             y: -1,
    //                             value: -1,
    //                         },
    //                         currentAction: Can.NEXT_TURN
    //                     };
    //                 }
    //                 break
    //             case Can.END_GAME:
    //                 break
    //             default:
    //                 return FormatRestApiModels.createFormatRestApi(200, 'error Action', null, null)
    //         }
    //         const session = await this.setDataInsideDb(game)
    //         if (session.code < 200 || session.code > 299) {
    //             return FormatRestApiModels.createFormatRestApi(session.code, `${session.message}`, session.data, session.error);
    //         }
    //         return FormatRestApiModels.createFormatRestApi(200, 'Document created succes', game.data, null);
    //     } catch (error: any) {
    //         return FormatRestApiModels.createFormatRestApi(500, error.message, null, null);
    //     }
    // }
    //
    // // this methoe is not significative inside code , using juste for see the data object result
    // ecrireObjetJSONDansFichier(objet: any): void {
    //     const contenuJSON = JSON.stringify(objet, null, 4);
    //
    //     fs.writeFile("nomFichier.json", contenuJSON, 'utf8', (err) => {
    //         if (err) {
    //             console.error(`Erreur lors de l'écriture dans le fichier nomFichier: ${err}`);
    //             return;
    //         }
    //         console.log(`Objet JSON écrit dans nomFichier`);
    //     });
    // }
}
