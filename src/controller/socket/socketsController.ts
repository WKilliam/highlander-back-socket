import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {AppDataSource} from "../../utils/database/database.config";
import {
    CurrentTurnAction,
    FormatSocketModels,
    JoinSessionSocket,
    JoinSessionTeam,
    JoinSessionTeamCard
} from "../../models/formatSocket.models";


module.exports = (io: any) => {

    const socketService = new SocketService(AppDataSource)
    const socketEndPoints: string = 'highlander-socket'

    io.on('connection', (socket: Socket) => {
        console.log(`${socket.id} connected!`)

        socket.on('join', async (data: JoinSessionSocket) => {
            socket.rooms.forEach(room => {
                socket.leave(room);
            });
            socket.join(`${socketEndPoints}-${data.room}`);
            console.log(`${socket.id} joined session: ${socketEndPoints}-${data.room}`)
            if (data.room !== 'default') {
                let socketJoin: FormatSocketModels = await socketService.joinSession(data);
                io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, socketJoin);
            } else {
                io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, `${socket.id} joined session: ${socketEndPoints}-${data.room}`);
            }
        })

        socket.on('join-team', async (data: JoinSessionTeam) => {
            const joinTeam: FormatSocketModels = await socketService.joinTeam(data);
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, joinTeam);
        })

        socket.on('join-card', async (data: JoinSessionTeamCard) => {
            const joinCard: FormatSocketModels = await socketService.cardSelected(data);
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, joinCard);
        })

        /**
         * Boucle de jeu
         */

        socket.on('createTurnList', async (data: {room:string}) => {
            const createTurnList: FormatSocketModels = await socketService.createTurnList(data.room);
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, createTurnList);
        })

        socket.on('whoIsTurn', async (data: {room:string}) => {
            const whoIsTurn: FormatSocketModels = await socketService.whoIsTurn(data.room)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-turn`, whoIsTurn);
        })

        socket.on('startTurn', async (data: {action:CurrentTurnAction,room:string}) => {
            const startTurn: FormatSocketModels = await socketService.startTurn(data);
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-turn`, startTurn);
        })

        socket.on('sendDice', async (data: {action:CurrentTurnAction,room:string}) => {
            const sendDice: FormatSocketModels = await socketService.sendDice(data)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-turn`, sendDice);
        })

        socket.on('chooseMove', async (data: {action:CurrentTurnAction,room:string}) => {
            const chooseMove: FormatSocketModels = await socketService.chooseMove(data)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-turn`, chooseMove);
        })

        socket.on('move', async (data: {action:CurrentTurnAction,room:string}) => {
            const move: FormatSocketModels = await socketService.move(data)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-turn`, move);
        })

        socket.on('endMove', async (data: {action:CurrentTurnAction,room:string}) => {
            const endMove: FormatSocketModels = await socketService.endMove(data)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-turn`, endMove);
        })

        socket.on('endTurn', async (data: {action:CurrentTurnAction,room:string}) => {
            const endTurn: FormatSocketModels = await socketService.endTurn(data)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-turn`, endTurn);
        })

        socket.on('disconnect', () => {
            console.log('a user disconnected!')
        })
    })
}
