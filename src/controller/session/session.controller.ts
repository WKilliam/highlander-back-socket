import {Router} from "express";
import {SessionsServices} from "../../services/sessions/sessions.services";
import {AppDataSource} from "../../utils/database/database.config";
import {SessionCreated} from "../../models/room.content.models";
import {CardCreateArg} from "../../models/cards.models";
import {JoinSessionSocket} from "../../models/formatSocket.models";
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
    console.log(sessionCreated)
    const received = await sessionsServices.create(sessionCreated);
    res.status(received.code).json(received);
});

SessionController.get('/', async (request, response) => {
    const room = request.query.room as string;
    const received = await sessionsServices.getSession(room);
    response.status(received.code).json(received);
});

SessionController.post('/activeForPlayer', async (request, response) => {
    const {token} = request.body;
    const received = await sessionsServices.activeForPlayer(token)
    response.status(received.code).json(received);
});

SessionController.post('/joinSession', async (req, res) => {
    const {
        room,token
    } = req.body;
    let sessionCreated:JoinSessionSocket = {
        room: room,
        token: token,
    }
    console.log(sessionCreated)
    const received = await sessionsServices.joinSession(sessionCreated);
    res.status(received.code).json(received);
});

SessionController.post('/joinTeam', async (req, res) => {
    const {
        room, lobbyPosition,teamPosition,cardPosition
    } = req.body;
    let data = {
        room: room,
        lobbyPosition: lobbyPosition,
        teamPosition: teamPosition,
        cardPosition: cardPosition
    }
    const received = await sessionsServices.joinTeam(data);
    res.status(received.code).json(received);
});

SessionController.post('/cardSelected', async (req, res) => {
    const {
        room, lobbyPosition,teamPosition,cardPosition
    } = req.body;
    const received = await sessionsServices
        .cardSelected(
            room, lobbyPosition,teamPosition,cardPosition
        );
    res.status(received.code).json(received);
});


export default SessionController;
