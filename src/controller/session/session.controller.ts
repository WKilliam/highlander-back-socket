import {Router} from "express";
import {SessionsServices} from "../../services/sessions/sessions.services";
import {AppDataSource} from "../../utils/database/database.config";
import {SessionCreated} from "../../models/room.content.models";
import {CardCreateArg} from "../../models/cards.models";
const sessionsServices: SessionsServices = new SessionsServices(AppDataSource);
const SessionController = Router();

SessionController.post('/new', async (req, res) => {
    const {
        name,
        password,
        mapId,
        teamNames,
    } = req.body;
    let sessionCreated:SessionCreated = {
        name: name,
        password: password,
        mapId: mapId,
        teamNames: teamNames,
        createdAt: new Date().toISOString()
    }
    const received = await sessionsServices.create(sessionCreated);
    res.status(received.code).json(received);
});

export default SessionController;
