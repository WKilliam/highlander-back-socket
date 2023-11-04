import {Router} from "express";
import {JsonServices} from "../../services/jsonconceptor/json.services";
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
        cardsId,
        cellPosition,
        state,
        tag,
        path,
        value
    } = request.body;
    const received: FormatModel = JsonServices.securityCheckPlayer(
        sessionKey,
        teamTag,
        position,
    )
    if (received.code >= 200 || received.code <= 299) {
        return response.status(received.code).json(received);
    } else {
        return response.status(received.code).json(received);
    }
});

JsonController.post("/checkIfUserInsideSession", (
    request,
    response) => {
    const {
        avatar,
        pseudo,
    } = request.body;
    const received: FormatModel = JsonServices.checkIfUserInsideONSession(avatar, pseudo)
    if (received.code >= 200 || received.code <= 299) {
        return response.status(received.code).json(received);
    } else {
        return response.status(received.code).json(received);
    }
});


export default JsonController;
