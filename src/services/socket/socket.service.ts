import {Socket_GetTeamInfos} from "../../models/sockets.models";
import {JsonconceptorService} from "../jsonconceptor/jsonconceptor.service";
import {Utils} from "../../utils/utils";

export class SocketService{

    getTeamContent(message: Socket_GetTeamInfos) {
        try {
            let data: any;
            switch (message.teamId) {
                case 1:
                    data = JsonconceptorService.getJsonFile(message.sessionKey, 'teams.one')
                    break
                case 2:
                    data = JsonconceptorService.getJsonFile(message.sessionKey, 'teams.two')
                    break
                case 3:
                    data = JsonconceptorService.getJsonFile(message.sessionKey, 'teams.three')
                    break
                case 4:
                    data = JsonconceptorService.getJsonFile(message.sessionKey, 'teams.four')
                    break
                default:
                    return Utils.formatResponse(500, `Internal Server Error`, null)
            }
            return Utils.formatResponse(200, 'Directory created', data);
        }catch (error){
            return Utils.formatResponse(500, `Internal Server Error`, error);
        }
    }

}
