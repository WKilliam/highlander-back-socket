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
import {EntityCategorie} from "../../models/room.content.models";
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
            return this.sessionService.joinSession(data);
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
            return this.sessionService.startGame(room);
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
                whoIsTurn,
                `${whoIsTurn.message}`,
                whoIsTurn.code,
                whoIsTurn.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async startTurn(data: {action:CurrentTurnAction,room:string}) {
        try {
            let endMove: FormatRestApiModels;
            endMove = await this.sessionService.startTurn(data.action,data.room);
            return Utils.formatSocketMessage(
                data.room,
                endMove,
                `${endMove.message}`,
                endMove.code,
                endMove.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }


    async sendDice(data: {action:CurrentTurnAction,room:string}) {
        try {
            let sendDice: FormatRestApiModels;
            // sendDice = await this.sessionService.sendDice(data.action,data.room);

            if(data.action.turnEntity.typeEntity === EntityCategorie.HUMAIN) {
                sendDice = await this.sessionService.sendDice(data.action,data.room);
                return Utils.formatSocketMessage(
                    data.room,
                    sendDice,
                    `${sendDice.message}`,
                    sendDice.code,
                    sendDice.error)
            }else if (data.action.turnEntity.typeEntity === EntityCategorie.COMPUTER){
                let currentAction = {
                    ...data.action,
                    dice : Utils.generateRandomNumber(1,20)
                }
                sendDice = await this.sessionService.sendDice(currentAction,data.room);
                return Utils.formatSocketMessage(
                    data.room,
                    sendDice,
                    `${sendDice.message}`,
                    sendDice.code,
                    sendDice.error)
            }else{
                return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, 'TypeEntity not found')
            }
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async chooseMove(data: {action:CurrentTurnAction,room:string}) {
        try {
            let chooseMove: FormatRestApiModels;
            if(data.action.turnEntity.typeEntity === EntityCategorie.HUMAIN) {
                chooseMove = await this.sessionService.chooseMove(data.action,data.room);
                return Utils.formatSocketMessage(
                    data.room,
                    chooseMove,
                    `${chooseMove.message}`,
                    chooseMove.code,
                    chooseMove.error)
            }else if (data.action.turnEntity.typeEntity === EntityCategorie.COMPUTER){
                let currentAction = {
                    ...data.action,
                    move: this.computerMove(data.action)
                }
                chooseMove = await this.sessionService.chooseMove(currentAction,data.room);
                return Utils.formatSocketMessage(
                    data.room,
                    chooseMove,
                    `${chooseMove.message}`,
                    chooseMove.code,
                    chooseMove.error)
            }else{
                return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, 'TypeEntity not found')
            }
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }


    async move(data: {action:CurrentTurnAction,room:string}) {
        try {
            let endMove: FormatRestApiModels;
            if(data.action.turnEntity.typeEntity === EntityCategorie.HUMAIN) {
                endMove = await this.sessionService.endMove(data.action,data.room);
                return Utils.formatSocketMessage(
                    data.room,
                    endMove,
                    `${endMove.message}`,
                    endMove.code,
                    endMove.error)
            }else if (data.action.turnEntity.typeEntity === EntityCategorie.COMPUTER){
                let currentAction = {
                    ...data.action,
                    move: this.computerMove(data.action)
                }
                endMove = await this.sessionService.endMove(currentAction,data.room);
                return Utils.formatSocketMessage(
                    data.room,
                    endMove,
                    `${endMove.message}`,
                    endMove.code,
                    endMove.error)
            }else{
                return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, 'TypeEntity not found')
            }
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async endMove(data: {action:CurrentTurnAction,room:string}) {
        try {
            let endMove: FormatRestApiModels;
            endMove = await this.sessionService.endMove(data.action,data.room);
            return Utils.formatSocketMessage(
                data.room,
                endMove,
                `${endMove.message}`,
                endMove.code,
                endMove.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }

    async endTurn(data: {action:CurrentTurnAction,room:string}) {
        try {
            let endMove: FormatRestApiModels;
            endMove = await this.sessionService.endTurn(data.action,data.room);
            return Utils.formatSocketMessage(
                data.room,
                endMove,
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
