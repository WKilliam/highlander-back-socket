import {DataSource} from "typeorm";
import {Utils} from "../../utils/utils";
import {
    JoinSessionSocket,
    JoinSessionTeam, JoinSessionTeamCard
} from "../../models/formatSocket.models";
import {SessionsServices} from "../sessions/sessions.services";
import {FormatRestApiModels} from "../../models/formatRestApi.models";

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

    async startGame(room: string) {
        try {
            let cardSelected: FormatRestApiModels = await this.sessionService.startGame(room);
            return Utils.formatSocketMessage(
                room,
                cardSelected.data,
                `${cardSelected.message}`,
                cardSelected.code,
                cardSelected.error)
        } catch (error: any) {
            return Utils.formatSocketMessage('', null, 'Error Internal Server', 500, error.message)
        }
    }
}
