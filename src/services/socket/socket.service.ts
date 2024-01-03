import {DataSource, Repository} from "typeorm";
import {SessionsServices} from "../sessions/sessions.services";
import {Utils} from "../../utils/utils";
import {FormatRestApi, FormatRestApiModels} from "../../models/formatRestApi";
import {CardByEntityPlaying, CardEntitySimplify} from "../../models/cards.models";
import {SessionDto} from "../../dto/session.dto";
import {PlayerModels} from "../../models/player.models";
import {ConstantText} from "../../utils/constant.text";
import {UsersServices} from "../users/users.services";
import {TokenManager} from "../../utils/tokennezer/jsonwebtoken";
import {Dice} from "../dice";

export class SocketService {
    dataSourceConfig: Promise<DataSource>;
    sessionService: SessionsServices;
    usersService: UsersServices;
    private textSuccesCanJoinRoom0 = ConstantText.hashMapText.get('Succes-canJoinRoom-0') ?? 'XXX'
    private textSuccesCanJoinRoom = ConstantText.hashMapText.get('Succes-canJoinRoom') ?? 'XXX'
    private failledAvartarAndPseudoNotMatch = 'Avatar or pseudo is not similar to the user'
    private failledInternalServer = 'Internal server error'
    private failledUserCheckInsideSession: string = 'Error check user inside session'
    private succesUpdateSesssionJoin: string = 'Succes update session join'

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.sessionService = new SessionsServices(dataSourceConfig);
        this.usersService = new UsersServices(dataSourceConfig);
    }


    async canJoinSession(token: string, avatar: string, pseudo: string) {
        try {
            const tokenManager = new TokenManager('votre_clé_secrète');
            const tokenData = tokenManager.verifyToken(token);
            const login = await this.usersService.login({
                email: tokenData.data.email,
                password: tokenData.data.password
            })
            if (Utils.codeErrorChecking(login.code)) return login;
            const checkSimilarityAvatarAndPseudo = (login.data.avatar === avatar && login.data.pseudo === pseudo)
            if (!checkSimilarityAvatarAndPseudo) {
                return FormatRestApiModels.createFormatRestApi(400,
                    this.failledAvartarAndPseudoNotMatch,
                    null,
                    null);
            } else {
                const ckeckIfUserInsideSession: FormatRestApi = await this.sessionService.checkIfUserInsideSession(avatar, pseudo);
                if (Utils.codeErrorChecking(ckeckIfUserInsideSession.code)) {
                    return FormatRestApiModels.createFormatRestApi(
                        ckeckIfUserInsideSession.code,
                        this.failledUserCheckInsideSession,
                        ckeckIfUserInsideSession.data,
                        ckeckIfUserInsideSession.error);
                } else {
                    return FormatRestApiModels.createFormatRestApi(
                        ckeckIfUserInsideSession.code,
                        ckeckIfUserInsideSession.message,
                        ckeckIfUserInsideSession.data,
                        ckeckIfUserInsideSession.error);
                }
            }
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }

    async joinSession(room: string, token: string, avatar: string, pseudo: string, score: number, cards: Array<CardEntitySimplify>) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            const canJoin = await this.canJoinSession(token, avatar, pseudo);
            if (Utils.codeErrorChecking(canJoin.code)) return canJoin;
            if (canJoin.message === this.textSuccesCanJoinRoom && canJoin.data) {
                // add session
                let lobbyInit = PlayerModels.initPlayerLobby()
                lobbyInit.avatar = avatar
                lobbyInit.pseudo = pseudo
                lobbyInit.score = score
                lobbyInit.cards = cards
                const session = await this.sessionService.getSession(room);
                if (Utils.codeErrorChecking(session.code)) return session;
                let sessionDto = session.data
                sessionDto.game.sessionStatusGame.lobby.push(lobbyInit)
                await sessionRepository.update(sessionDto.id, sessionDto);
                const updatedSession = await sessionRepository.findOne({
                    where: {id: sessionDto.id},
                });
                return FormatRestApiModels.createFormatRestApi(200, this.succesUpdateSesssionJoin, updatedSession, null);
            } else if (canJoin.message === this.textSuccesCanJoinRoom0) {
                // return session
                return FormatRestApiModels.createFormatRestApi(canJoin.code, canJoin.message, canJoin.data, canJoin.error);
            } else {
                return FormatRestApiModels.createFormatRestApi(500,
                    this.failledInternalServer,
                    null,
                    'Error');
            }
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }

    diceRolling(luk: number, arrayLimit: Array<number>, min: number, max: number) {
        if (!luk) return FormatRestApiModels.createFormatRestApi(400, 'Luk is empty', null, null)
        if (!min && !max) {
            min = 1
            max = 20
        }
        if (!arrayLimit) {
            arrayLimit = []
        }
        const dice = Dice.diceRuning(luk, arrayLimit, min, max)[0]
        return FormatRestApiModels.createFormatRestApi(200, 'Rolling', dice, null)
    }

    async joinTeam(
        room: string,
        positionPlayerInLobby: number,
        teamSelectedPerPlayer: number,
        cardPositionInsideTeamCards: number) {
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session;
            const changeCard = Utils.setPlayerTeam(
                session.data,
                positionPlayerInLobby,
                teamSelectedPerPlayer,
                cardPositionInsideTeamCards,
                null)
            if(changeCard.code !== 200) return FormatRestApiModels.createFormatRestApi(changeCard.code, changeCard.message, changeCard.data, changeCard.error)
            const sessionDto = changeCard.data
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            await sessionRepository.update(sessionDto.id, sessionDto);
            const updatedSession = await sessionRepository.findOne({
                where: {id: sessionDto.id},
            });
            return FormatRestApiModels.createFormatRestApi(200, this.succesUpdateSesssionJoin, updatedSession, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }

    async joinTeamWithCard(
        room: string,
        lobbyPosition: number,
        teamPosition: number,
        cardPosition: number,
        selectedCard: number | null
    ) {
        if(selectedCard === null) return FormatRestApiModels.createFormatRestApi(400, 'Card is empty', null, null)
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session;
            const changeCard = Utils.setPlayerTeam(
                session.data,
                lobbyPosition,
                teamPosition,
                cardPosition,
                selectedCard)
            if(changeCard.code !== 200) return FormatRestApiModels.createFormatRestApi(changeCard.code, changeCard.message, changeCard.data, changeCard.error)
            const sessionDto = changeCard.data
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            await sessionRepository.update(sessionDto.id, sessionDto);
            const updatedSession = await sessionRepository.findOne({
                where: {id: sessionDto.id},
            });
            return FormatRestApiModels.createFormatRestApi(200, this.succesUpdateSesssionJoin, updatedSession, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }


    //
    // async joinSession(data: PlayerStatusSession) {
    //     try {
    //         return this.sessionService.playerStatusSession(data);
    //     } catch (error: any) {
    //         return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
    //     }
    // }
    //
    // async joinTeam(data: JoinSessionTeam) {
    //     try {
    //         return this.sessionService.joinTeam(data);
    //     } catch (error: any) {
    //         return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
    //     }
    // }
    //
    // async cardSelected(data: JoinSessionTeamCard) {
    //     try {
    //         return this.sessionService.cardSelected(data);
    //     } catch (error: any) {
    //         return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
    //     }
    // }
    //
    // async createTurnList(room: string) {
    //     try {
    //         return this.sessionService.creatList(room);
    //     } catch (error: any) {
    //         return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
    //     }
    // }
    //
    // humainAction(room: string, entityTurn: CurrentTurnAction) {
    //     switch (entityTurn.currentAction) {
    //         case Can.WHO_IS_TURN:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.SEND_DICE:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.CHOOSE_MOVE:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.MOVE:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.END_MOVE:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.END_TURN:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.END_GAME:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         default:
    //             return FormatRestApiModels.createFormatRestApi(200, "", null, 'Error Internal Server')
    //     }
    // }
    //
    // /**
    //  * COMPUTER
    //  */
    //
    // botAction(room: string, entityTurn: CurrentTurnAction) {
    //     switch (entityTurn.currentAction) {
    //         case Can.WHO_IS_TURN:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.SEND_DICE:
    //             let newEntityTurn: CurrentTurnAction = {
    //                 ...entityTurn,
    //                 dice: this.randomDice()
    //             }
    //             return this.sessionService.roolingTurn(room, newEntityTurn);
    //         case Can.CHOOSE_MOVE:
    //             let newEntityTurn2: CurrentTurnAction = {
    //                 ...entityTurn,
    //                 move: this.computerMove(entityTurn)
    //             }
    //             return this.sessionService.roolingTurn(room, newEntityTurn2);
    //         case Can.MOVE:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.END_MOVE:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.END_TURN:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         case Can.END_GAME:
    //             return this.sessionService.roolingTurn(room, entityTurn);
    //         default:
    //             return FormatRestApiModels.createFormatRestApi(200, "", null, 'Error Internal Server bad action selected')
    //     }
    //
    // }
    //
    //
    // computerMove(data: CurrentTurnAction) {
    //     const moves = data.moves
    //     let indexMap = Utils.generateRandomNumber(0, moves.length - 1);
    //     return moves[indexMap]
    // }
    //
    // randomDice() {
    //     return Utils.generateRandomNumber(1, 20);
    // }


}
