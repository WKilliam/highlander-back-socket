import {DataSource} from "typeorm";
import {Utils} from "../../utils/utils";
import {
    CurrentTurnAction, FormatSocketModels,
    JoinSessionSocket,
    JoinSessionTeam,
    JoinSessionTeamCard,
    PlayerStatusSession
} from "../../models/formatSocket.models";
import {SessionsServices} from "../sessions/sessions.services";
import {FormatRestApiModels} from "../../models/formatRestApi.models";
import {EntityCategorie} from "../../models/room.content.models";
import {Can} from "../../models/enums";
import {SessionDto} from "../../dto/session.dto";

export class SocketService {
    dataSourceConfig: Promise<DataSource>;
    sessionService: SessionsServices;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.sessionService = new SessionsServices(dataSourceConfig);
    }

    async joinSession(data: PlayerStatusSession) {
        try {
            return this.sessionService.playerStatusSession(data);
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async joinTeam(data: JoinSessionTeam) {
        try {
            return this.sessionService.joinTeam(data);
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async cardSelected(data: JoinSessionTeamCard) {
        try {
            return this.sessionService.cardSelected(data);
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async createTurnList(room: string) {
        try {
            return this.sessionService.creatList(room);
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    humainAction(room: string, entityTurn: CurrentTurnAction) {
        switch (entityTurn.currentAction) {
            case Can.WHO_IS_TURN:
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.SEND_DICE:
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.CHOOSE_MOVE:
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.MOVE:
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.END_MOVE:
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.END_TURN:
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.END_GAME:
                return this.sessionService.roolingTurn(room, entityTurn);
            default:
                return Utils.formatResponse(200, "", null,  'Error Internal Server')
        }
    }

    /**
     * COMPUTER
     */

    botAction(room: string, entityTurn: CurrentTurnAction) {
        switch (entityTurn.currentAction) {
            case Can.WHO_IS_TURN:
                console.log('botAction who is turn ', entityTurn)
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.SEND_DICE:
                console.log('botAction send dice ', entityTurn)
                let newEntityTurn :CurrentTurnAction = {
                    ...entityTurn,
                    dice: this.randomDice()
                }
                return this.sessionService.roolingTurn(room, newEntityTurn);
            case Can.CHOOSE_MOVE:
                console.log('botAction choose move ', entityTurn)
                let newEntityTurn2 :CurrentTurnAction  = {
                    ...entityTurn,
                    move: this.computerMove(entityTurn)
                }
                return this.sessionService.roolingTurn(room, newEntityTurn2);
            case Can.MOVE:
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.END_MOVE:
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.END_TURN:
                return this.sessionService.roolingTurn(room, entityTurn);
            case Can.END_GAME:
                return this.sessionService.roolingTurn(room, entityTurn);
            default:
                return Utils.formatResponse(200, "", null,  'Error Internal Server bad action selected')
        }

    }


    computerMove(data: CurrentTurnAction) {
        const moves = data.moves
        let indexMap = Utils.generateRandomNumber(0, moves.length - 1);
        return moves[indexMap]
    }

    randomDice() {
        return Utils.generateRandomNumber(1, 20);
    }

}
