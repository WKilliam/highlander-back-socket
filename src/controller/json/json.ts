import {Router} from "express";
import {JsonServices} from "../../services/json/json.services";
import {Utils} from "../../utils/utils";
import {SessionJsonTeamUpdate} from "../../models/sessions.models";
import {FormatModel} from "../../models/format.model";

const JsonController = Router();
const jsonServices = new JsonServices();


JsonController.get("/getMapCells", async (
    request,
    response) => {
    const sessionKey = request.query.session as string;
    const received = await jsonServices.getJson(sessionKey, 'map.cellsGrid')
    if (received.code >= 200 || received.code <= 299) {
        return response.status(received.code).json(received.data);
    } else {
        return response.status(received.code).json(received);
    }
});

JsonController.patch("/teamsUpdate", async (
    request,
    response) => {
    const {
        sessionKey,
        team,
        name,
        isAlive,
    } = request.body;
    let sessionTeamUpdate: SessionJsonTeamUpdate = {
        name: name,
        isAlive: isAlive,
    }
    let received:FormatModel ;
    switch (team) {
        case 1:
             received = await jsonServices.patchJson(sessionKey, 'teams.one', sessionTeamUpdate)
            break;
        case 2:
            received = await jsonServices.patchJson(sessionKey, 'teams.two', sessionTeamUpdate)
            break;
        case 3:
            received = await jsonServices.patchJson(sessionKey, 'teams.three', sessionTeamUpdate)
            break;
        case 4:
            received = await jsonServices.patchJson(sessionKey, 'teams.four', sessionTeamUpdate)
            break;
        default:
            received = Utils.formatResponse(500, 'Internal Server Error', null, 'Team not found')
            break;
    }
    if (received.code >= 200 || received.code <= 299) {
        return response.status(received.code).json(received.message);
    }else {
        return response.status(received.code).json(received);
    }
});


JsonController.get("/test", async (
    request,
    response) => {
    response.status(200).json('ok');
});

export default JsonController;
