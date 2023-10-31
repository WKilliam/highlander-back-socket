import {Router} from "express";
import {JsonServices} from "../../services/jsonconceptor/json.services";
import {Utils} from "../../utils/utils";
import {SessionJsonTeamUpdate} from "../../models/sessions.models";
import {FormatModel} from "../../models/format.model";

const JsonController = Router();
const jsonServices = new JsonServices();


JsonController.get("/getMapCells", async (
    request,
    response) => {
    const sessionKey = request.query.session as string;
    const received: FormatModel = JsonServices.getKeyJson(sessionKey, 'map.cellsGrid')
    if (received.code >= 200 || received.code <= 299) {
        return response.status(received.code).json(received.data);
    } else {
        return response.status(received.code).json(received);
    }
});

JsonController.post("/content", (
    request,
    response) => {
    const {
        sessionKey
    } = request.body;
    const received: FormatModel = JsonServices.checkSessionOnJson(sessionKey)
    if (received.code >= 200 || received.code <= 299) {
        return response.status(received.code).json(received.data);
    } else {
        return response.status(received.code).json(received);
    }
});

JsonController.post("/addAllPlayers", (
    request,
    response) => {
    const {
        sessionKey,
        avatar,
        pseudo,
        teamTag,
        cardsTag,
        position,
        cardsId
    } = request.body;
    const received: FormatModel = JsonServices.setCardTeam(
        sessionKey,
        avatar,
        pseudo,
        teamTag,
        cardsTag,
        position,
        cardsId
    )
    if (received.code >= 200 || received.code <= 299) {
        return response.status(received.code).json(received.data);
    } else {
        return response.status(received.code).json(received);
    }
});


export default JsonController;
