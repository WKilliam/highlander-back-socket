import {DataSource, Repository} from "typeorm";
import {SessionsServices} from "../sessions/sessions.services";
import {Utils} from "../../utils/utils";
import {FormatRestApi, FormatRestApiModels} from "../../models/formatRestApi";
import {CardByEntityPlaying, CardEntitySimplify} from "../../models/cards.models";
import {SessionDto} from "../../dto/session.dto";
import {PlayerCards, PlayerModels} from "../../models/player.models";
import {ConstantText} from "../../utils/constant.text";
import {UsersServices} from "../users/users.services";
import {TokenManager} from "../../utils/tokennezer/jsonwebtoken";
import {Dice} from "../dice";
import {CardsServices} from "../cards/cards.services";
import {Can, EntityCategorie} from "../../models/enums";
import {PlayerCardsEntity} from "../../models/cards.player.entity.models";
import {Cells} from "../../models/maps.models";
import {EntityEvolving, EntityResume} from "../../models/actions.game.models";
import {MasterMaidData} from "../../models/users.models";

export class SocketService {
    dataSourceConfig: Promise<DataSource>;
    sessionService: SessionsServices;
    cardsService: CardsServices;
    usersService: UsersServices;
    private textSuccesCanJoinRoom0 = ConstantText.hashMapText.get('Succes-canJoinRoom-0') ?? 'XXX'
    private textSuccesCanJoinRoom = ConstantText.hashMapText.get('Succes-canJoinRoom') ?? 'XXX'
    private failledAvartarAndPseudoNotMatch = 'Avatar or pseudo is not similar to the user'
    private failledInternalServer = 'Internal server error'
    private failledUserCheckInsideSession: string = 'Error check user inside session'
    private succesUpdateSesssionJoin: string = 'Succes update session join'
    private queueClientActionCall: Map<string, MasterMaidData> = new Map<string, MasterMaidData>()

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.sessionService = new SessionsServices(dataSourceConfig);
        this.usersService = new UsersServices(dataSourceConfig);
        this.cardsService = new CardsServices(dataSourceConfig);
    }

    async updateSession(room: string, session: SessionDto) {
        const update = await this.sessionService.updateSession(room, session)
        return FormatRestApiModels.createFormatRestApi(update.code, update.message, update.data, update.error);
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
    async joinTeam(room: string, positionPlayerInLobby: number, teamSelectedPerPlayer: number, cardPositionInsideTeamCards: number) {
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session;
            const changeCard = Utils.setPlayerTeam(
                session.data,
                positionPlayerInLobby,
                teamSelectedPerPlayer,
                cardPositionInsideTeamCards,
                null)
            if (changeCard.code !== 200) return FormatRestApiModels.createFormatRestApi(changeCard.code, changeCard.message, changeCard.data, changeCard.error)
            return this.updateSession(room, changeCard.data)
            // const sessionDto = changeCard.data
            // const update = await this.sessionService.updateSession(room,sessionDto)
            // if (Utils.codeErrorChecking(update.code)) return FormatRestApiModels.createFormatRestApi(update.code, update.message, update.data, update.error)
            // return FormatRestApiModels.createFormatRestApi(200, this.succesUpdateSesssionJoin, update.data, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }
    async joinTeamWithCard(room: string, lobbyPosition: number, teamPosition: number, cardPosition: number, selectedCard: number | null) {
        if (selectedCard === null) return FormatRestApiModels.createFormatRestApi(400, 'Card is empty', null, null)
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session;
            const changeCard = Utils.setPlayerTeam(
                session.data,
                lobbyPosition,
                teamPosition,
                cardPosition,
                selectedCard)
            if (Utils.codeErrorChecking(changeCard.code)) return FormatRestApiModels.createFormatRestApi(changeCard.code, changeCard.message, changeCard.data, changeCard.error)
            return this.updateSession(room, changeCard.data)
            // const sessionDto = changeCard.data
            // const update = await this.sessionService.updateSession(room,sessionDto)
            // if (Utils.codeErrorChecking(update.code)) return FormatRestApiModels.createFormatRestApi(update.code, update.message, update.data, update.error)
            // return FormatRestApiModels.createFormatRestApi(200, this.succesUpdateSesssionJoin, update, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }

    }
    async countReturn(room: string) {
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session;
            const count = Utils.countReturn(session.data)
            return FormatRestApiModels.createFormatRestApi(200, 'Count return', count, null)
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }
    async whoIsPlayEntityType(room: string) {
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session;
            const checkTurn = Utils.checkEntityPlay(session.data)
            if (Utils.codeErrorChecking(checkTurn.code)) return FormatRestApiModels.createFormatRestApi(checkTurn.code, checkTurn.message, checkTurn.data, checkTurn.error)
            return this.updateSession(room, checkTurn.data)
            // const sessionDto = checkTurn.data
            // const update = await this.sessionService.updateSession(room,sessionDto)
            // if (Utils.codeErrorChecking(update.code)) return FormatRestApiModels.createFormatRestApi(update.code, update.message, update.data, update.error)
            // return FormatRestApiModels.createFormatRestApi(200, this.succesUpdateSesssionJoin, update.data, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }
    async initGame(room: string) {
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session;
            const cardsDB = await this.cardsService.getAllCards()
            const sessionDto = Utils.createGameContent(session.data, cardsDB.data)
            const update = await this.sessionService.updateSession(room, sessionDto)
            return FormatRestApiModels.createFormatRestApi(update.code, update.message, update.data, update.error)
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }
    async humainActionMoving(room: string, entityResume: EntityResume, entityEvolving: EntityEvolving) {
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session;
            switch (entityEvolving.currentCan) {
                case Can.NULL:
                    const canNull = Utils.caseNULL(session.data, entityResume)
                    if (Utils.codeErrorChecking(canNull.code)) return FormatRestApiModels.createFormatRestApi(canNull.code, canNull.message, canNull.data, canNull.error)
                    return this.updateSession(room, canNull.data)
                case Can.START_TURN:
                    const canStartTurn = Utils.caseSTART_TURN(session.data, entityResume)
                    if (Utils.codeErrorChecking(canStartTurn.code)) return FormatRestApiModels.createFormatRestApi(canStartTurn.code, canStartTurn.message, canStartTurn.data, canStartTurn.error)
                    return this.updateSession(room, canStartTurn.data)
                case Can.SEND_DICE:
                    const canSendDice = Utils.caseSEND_DICE(session.data, entityResume, entityEvolving)
                    if (Utils.codeErrorChecking(canSendDice.code)) return FormatRestApiModels.createFormatRestApi(canSendDice.code, canSendDice.message, canSendDice.data, canSendDice.error)
                    return this.updateSession(room, canSendDice.data)
                case Can.CHOOSE_MOVE:
                    const canChooseMove = Utils.caseCHOOSE_MOVE(session.data, entityResume, entityEvolving)
                    if (Utils.codeErrorChecking(canChooseMove.code)) return FormatRestApiModels.createFormatRestApi(canChooseMove.code, canChooseMove.message, canChooseMove.data, canChooseMove.error)
                    return this.updateSession(room, canChooseMove.data)
                case Can.MOVE:
                    const canMove = Utils.caseMOVE(session.data, entityResume, entityEvolving)
                    if (Utils.codeErrorChecking(canMove.code)) return FormatRestApiModels.createFormatRestApi(canMove.code, canMove.message, canMove.data, canMove.error)
                    return this.updateSession(room, canMove.data)
                case Can.FINISH_TURN:
                    const canFinishTurn = Utils.caseFINISH_TURN(session.data, entityResume, entityEvolving)
                    if (Utils.codeErrorChecking(canFinishTurn.code)) return FormatRestApiModels.createFormatRestApi(canFinishTurn.code, canFinishTurn.message, canFinishTurn.data, canFinishTurn.error)
                    const nextTurn = await this.whoIsPlayEntityType(room)
                    if (Utils.codeErrorChecking(nextTurn.code)) return FormatRestApiModels.createFormatRestApi(nextTurn.code, nextTurn.message, nextTurn.data, nextTurn.error)
                    return this.updateSession(room, nextTurn.data)
                case Can.START_FIGHT:
                    return FormatRestApiModels.createFormatRestApi(400, 'Can is not valid', null, null)
                case Can.API_CHALLENGERS_SEND_DICE:
                    return FormatRestApiModels.createFormatRestApi(400, 'Can is not valid', null, null)
                case Can.RESULT_TURN_FIGHT:
                    return FormatRestApiModels.createFormatRestApi(400, 'Can is not valid', null, null)
                case Can.END_TURN_FIGHT:
                    return FormatRestApiModels.createFormatRestApi(400, 'Can is not valid', null, null)
                case Can.END_FIGHT:
                    return FormatRestApiModels.createFormatRestApi(400, 'Can is not valid', null, null)
                default:
                    return FormatRestApiModels.createFormatRestApi(400, 'Can is not valid', null, null)
            }
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }

    async botAction(room: string, action: EntityEvolving) {
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session
            // const ping = Utils.pingMaidMasterSend(session.data, room, this.queueClientActionCall)
            // if(Utils.codeErrorChecking(ping.code)) return FormatRestApiModels.createFormatRestApi(ping.code, ping.message, ping.data, ping.error)
            // this.queueClientActionCall.set(room,{valid:ping.data.valid,countCheckError:ping.data.countCheckError,lobbyPosition:ping.data.lobbyPosition})
            // return FormatRestApiModels.createFormatRestApi(200, 'Ping maid master send', this.queueClientActionCall.get(room), null)
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }
    async pingMaidMasterSend(room: string) {
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session
            const ping = Utils.pingMaidMasterSend(session.data, room, this.queueClientActionCall)
            if(Utils.codeErrorChecking(ping.code)) return FormatRestApiModels.createFormatRestApi(ping.code, ping.message, ping.data, ping.error)
            this.queueClientActionCall.set(room,{valid:ping.data.valid,countCheckError:ping.data.countCheckError,lobbyPosition:ping.data.lobbyPosition})
            return FormatRestApiModels.createFormatRestApi(200, 'Ping maid master send', this.queueClientActionCall.get(room), null)
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }

    async pingMaidMasterReive(room: string, action: EntityEvolving) {
        try {
            const session = await this.sessionService.getSession(room);
            if (Utils.codeErrorChecking(session.code)) return session
            // const ping = Utils.pingMaidMasterSend(session.data, room, this.queueClientActionCall)
            // if(Utils.codeErrorChecking(ping.code)) return FormatRestApiModels.createFormatRestApi(ping.code, ping.message, ping.data, ping.error)
            // this.queueClientActionCall.set(room,{valid:ping.data.valid,countCheckError:ping.data.countCheckError,lobbyPosition:ping.data.lobbyPosition})
            // return FormatRestApiModels.createFormatRestApi(200, 'Ping maid master send', this.queueClientActionCall.get(room), null)
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500,
                this.failledInternalServer,
                null,
                error.message);
        }
    }

    async apiFightSystem(room: string,titleFight:string) {

    }


}
