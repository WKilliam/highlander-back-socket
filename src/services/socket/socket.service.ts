import {SessionsServices} from "../sessions/sessions.services";
import {AppDataSource} from "../../utils/database/database.config";
import {SocketJoinSession, SocketJoinTeamCard} from "../../models/sockets.models";
import {JsonconceptorService} from "../jsonconceptor/jsonconceptor.service";
import {Utils} from "../../utils/utils";

export class SocketService{

    joinTeam(socketJoinTeamCard: SocketJoinTeamCard) {
        try {
            // let value = JsonconceptorService.changeTeamCard(socketJoinTeamCard);
            return Utils.formatResponse(200, 'Directory created', "value");
        }catch (error){
            return Utils.formatResponse(500, 'Internal Server Error', error);
        }
    }

    joinSession(joinSession:SocketJoinSession) {
        try {
            // let value = JsonconceptorService.changeSession(joinSession);
            return Utils.formatResponse(200, 'Directory created', "value");
        }catch (error){
            return Utils.formatResponse(500, 'Internal Server Error', error);
        }
    }

}
