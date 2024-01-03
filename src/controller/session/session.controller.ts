import {Router} from "express";
import {SessionsServices} from "../../services/sessions/sessions.services";
import {AppDataSource} from "../../utils/database/database.config";
import {SessionCreated} from "../../models/room.content.models";
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
    console.log(room)
    const received = await sessionsServices.getSession(room);
    response.status(received.code).json(received);
});

// SessionController.post('/activeForPlayer', async (request, response) => {
//     const received :FormatRestApi = await sessionsServices.playerStatusSession({
//         token :request.body.token
//     })
//     response.status(received.code).json(received);
// });

// SessionController.post('/joinSession', async (request, res) => {
//     const received = await sessionsServices.playerStatusSession({
//         token :request.body.token,
//         room: request.body.room
//     })
//     res.status(received.code).json(received);
// });
//
// SessionController.post('/joinTeam', async (req, res) => {
//     const {
//         room, lobbyPosition,teamPosition,cardPosition
//     } = req.body;
//     let data = {
//         room: room,
//         lobbyPosition: lobbyPosition,
//         teamPosition: teamPosition,
//         cardPosition: cardPosition
//     }
//     const received = await sessionsServices.joinTeam(data);
//     res.status(received.code).json(received);
// });
//
// SessionController.post('/cardSelected', async (req, res) => {
//     const {
//         room,
//         lobbyPosition,
//         teamPosition,
//         cardPosition,
//         cardByPlayer,
//     } = req.body;
//     let joinCard:JoinSessionTeamCard = {
//         room: room,
//         lobbyPosition: lobbyPosition,
//         teamPosition: teamPosition,
//         cardPosition: cardPosition,
//         cardByPlayer: cardByPlayer,
//     }
//     const received:FormatRestApi = await sessionsServices.cardSelected(joinCard);
//     res.status(received.code).json(received);
// });
//
//
// SessionController.get('/startGame', async (request, response) => {
//     const room = request.query.room as string;
//     const received = await sessionsServices.creatList(room);
//     response.status(received.code).json(received);
// });


export default SessionController;
