import {Router} from "express";
import {AppDataSource} from "../../utils/database/database.config";
import {SocketService} from "../../services/socket/socket.service";
import {UserIdentitiesGame, UserSocketConnect} from "../../models/users.models";
import {FormatRestApiModels} from "../../models/formatRestApi";
import {DiceRolling} from "../../models/room.content.models";
const socketService: SocketService = new SocketService(AppDataSource);
const SocketController = Router();

SocketController.post(
    '/canJoinSession', async (
        request,
        response) => {

        let userSocketConnect : UserSocketConnect = request.body;
        console.log(userSocketConnect)
        let received = await socketService.canJoinSession(
            userSocketConnect.token,
            userSocketConnect.avatar,
            userSocketConnect.pseudo
        );
        response.status(received.code).json(received);
});

SocketController.post(
    '/joinSession', async (
        request,
        response) => {
        let userSocketConnect : UserSocketConnect = request.body;
        const cards = userSocketConnect.cards ?? []
        const score = userSocketConnect.score ?? 0
        if(cards.length === 0){
            const received = FormatRestApiModels.createFormatRestApi(400, 'Cards is empty', null, null)
            response.status(received.code).json(received);
        }else{
            let received = await socketService.joinSession(
                userSocketConnect.room,
                userSocketConnect.token,
                userSocketConnect.avatar,
                userSocketConnect.pseudo,
                score,
                cards
            );
            response.status(received.code).json(received);
        }
    });

SocketController.post(
    '/rolling', async (
        request,
        response) => {
        let diceRolling : DiceRolling = request.body;
        const received = socketService.diceRolling(diceRolling.luk,diceRolling.arrayLimit,diceRolling.min,diceRolling.max);
        response.status(received.code).json(received);
    });

SocketController.post(
    '/join-team', async (
        request,
        response) => {
        let userIdentitiesGame : UserIdentitiesGame = request.body;
        const received = await socketService.joinTeam(
            userIdentitiesGame.room,
            userIdentitiesGame.positionPlayerInLobby,
            userIdentitiesGame.teamSelectedPerPlayer,
            userIdentitiesGame.cardPositionInsideTeamCards
        );
        response.status(received.code).json(received);
    });

SocketController.post(
    '/join-team-card', async (
        request,
        response) => {
        let userIdentitiesGame : UserIdentitiesGame = request.body;
        const received = await socketService.joinTeamWithCard(
            userIdentitiesGame.room,
            userIdentitiesGame.positionPlayerInLobby,
            userIdentitiesGame.teamSelectedPerPlayer,
            userIdentitiesGame.cardPositionInsideTeamCards,
            userIdentitiesGame.cardSelectedForPlay ?? null
        );
        response.status(received.code).json(received);
    });

SocketController.post(
    '/check-turn', async (
        request,
        response) => {
        const {room} = request.body;
        const received = await socketService.whoIsPlayEntityType(room);
        response.status(received.code).json(received);
    });

SocketController.post(
    '/init-game', async (
        request,
        response) => {
        const {room} = request.body;
        const received = await socketService.initGame(room);
        response.status(received.code).json(received);
    });

SocketController.post(
    '/humain-action', async (
        request,
        response) => {
        const {room,action} = request.body;
        const received = await socketService
            .humainActionMoving(room,action.resume,action.evolving);
        response.status(received.code).json(received);
    });

SocketController.post(
    '/ping-maid-master-send', async (
        request,
        response) => {
        const {room} = request.body;
        const received = await socketService.pingMaidMasterSend(room)
        response.status(received.code).json(received);
    });

SocketController.post(
    '/ping-maid-master-reive', async (
        request,
        response) => {
        const {room,action} = request.body;
        const received = await socketService
            .humainActionMoving(room,action.resume,action.evolving);
        response.status(received.code).json(received);
    });

export default SocketController;
