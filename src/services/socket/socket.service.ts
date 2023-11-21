import {DataSource} from "typeorm";
import {Utils} from "../../utils/utils";
import {
    CurrentTurnAction, FormatSocketModels,
    JoinSessionSocket,
    JoinSessionTeam,
    JoinSessionTeamCard
} from "../../models/formatSocket.models";
import {SessionsServices} from "../sessions/sessions.services";
import {FormatRestApiModels} from "../../models/formatRestApi.models";
import {Can} from "../../models/enums";

export class SocketService {
    dataSourceConfig: Promise<DataSource>;
    sessionService: SessionsServices;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.sessionService = new SessionsServices(dataSourceConfig);
    }

    async joinSession(data: JoinSessionSocket) {
        try {
            let joinned = await this.sessionService.joinSession(data);
            return Utils.formatSocketMessage(
                data.room,
                joinned.data,
                `${joinned.message}`, 200, null)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async joinTeam(data: JoinSessionTeam) {
        try {
            let joinedTeam = await this.sessionService.joinTeam(data);
            return Utils.formatSocketMessage(
                data.room,
                joinedTeam.data,
                `${joinedTeam.message}`,
                joinedTeam.code,
                joinedTeam.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async cardSelected(data: JoinSessionTeamCard) {
        try {
            let cardSelected = await this.sessionService.cardSelected(data);
            return Utils.formatSocketMessage(
                data.room,
                cardSelected.data,
                `${cardSelected.message}`,
                cardSelected.code,
                cardSelected.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async createTurnList(room: string) {
        try {
            let createTurn: FormatRestApiModels;
            createTurn = await this.sessionService.createTurnList(room);
            return Utils.formatSocketMessage(
                room,
                createTurn.data,
                `${createTurn.message}`,
                createTurn.code,
                createTurn.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async whoIsTurn(room: string) {
        try {
            let whoIsTurn: FormatRestApiModels;
            whoIsTurn = await this.sessionService.whoIsTurn(room);
            return Utils.formatSocketMessage(
                room,
                whoIsTurn.data,
                `${whoIsTurn.message}`,
                whoIsTurn.code,
                whoIsTurn.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async sendDice(data: CurrentTurnAction) {
        try {
            let sendDice: FormatRestApiModels;
            sendDice = await this.sessionService.sendDice(data);
            return Utils.formatSocketMessage(
                data.room,
                sendDice.data,
                `${sendDice.message}`,
                sendDice.code,
                sendDice.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async chooseMove(data: CurrentTurnAction) {
        try {
            let chooseMove: FormatRestApiModels;
            if(data.turnEntity.typeEntity === 'HUMAIN'){
                chooseMove = await this.sessionService.chooseMove(data);
            }else{
                data.move = this.computerMove(data)
                chooseMove = await this.sessionService.chooseMove(data);
            }
            return Utils.formatSocketMessage(
                data.room,
                chooseMove.data,
                `${chooseMove.message}`,
                chooseMove.code,
                chooseMove.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async endMove(data: CurrentTurnAction) {
        try {
            let endMove: FormatRestApiModels;
            endMove = await this.sessionService.endMove(data);
            return Utils.formatSocketMessage(
                data.room,
                endMove.data,
                `${endMove.message}`,
                endMove.code,
                endMove.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    /**
     * COMPUTER
     */

    computerMove(data: CurrentTurnAction) {
        const moves = data.moves
        let indexMap = Utils.generateRandomNumber(0, moves.length - 1);
        return moves[indexMap]
    }


}
