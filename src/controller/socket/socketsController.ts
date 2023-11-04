import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {SocketJoinSession, SocketSelectPlaceTeam} from "../../models/sockets.models";
import {FormatModel, SocketFormatModel} from "../../models/format.model";
import {Utils} from "../../utils/utils";


module.exports = (io: any) => {
    let socketService = new SocketService()
    const socketEndPoints: string = 'highlander-socket'

    io.on('connection', (socket: Socket) => {
        console.log(`${socket.id} connected!`)

        socket.on('session-default', async (data: {}) => {
            socket.rooms.forEach(room => {
                socket.leave(room);
            });
            socket.join(`${socketEndPoints}-default`);
            console.log(`${socket.id} joined session: ${socketEndPoints}-default`)
            io.to(`${socketEndPoints}-default`).emit('default', `${socket.id} joined session: ${socketEndPoints}-default`);
        })

        socket.on('join-session', async (data: SocketJoinSession) => {
            socket.rooms.forEach(room => {
                socket.leave(room);
            });
            socket.join(`${socketEndPoints}-${data.room}`);
            console.log(`${socket.id} joined session: ${socketEndPoints}-${data.room}`)
            let parties: FormatModel = Utils.partiesDataSocket(data.room)
            let formatSocket: SocketFormatModel = Utils.formatSocketMessage(
                `${socketEndPoints}-${data.room}`,
                parties.data,
                `${socket.id} joined session: ${socketEndPoints}-${data.room} , complete message : ${parties.message}`,
                parties.code, parties.error)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, formatSocket);
        })


        socket.on('select-place-team', async (data: SocketSelectPlaceTeam) => {
            let value = socketService.selectPlaceTeam(data)
            let formatSocket: SocketFormatModel = Utils.formatSocketMessage(
                `${socketEndPoints}-${data.room}`,
                value.data,
                `${socket.id} joined session: ${socketEndPoints}-${data.room} , complete message : ${value.message}`,
                value.error, value.error)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, formatSocket);
        })

        socket.on('select-card-team', async (data: {
            room: string,
            avatar: string,
            pseudo: string,
            teamTag: string,
            position: number,
            cardId: number,
        }) => {

        })

        socket.on('move-possibility', async (data: {
            room: string,
            cellIdCurrentPosition: number,
            diceValue: number,
            pseudo: string,
        }) => {

        })

        socket.on('move-to-possibility', async (data: { room: string }) => {
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-move-player`, `move player to possibility`);
        })

        socket.on('next-turn', async (data: {}) => {

        })


        socket.on('disconnect', () => {
            console.log('a user disconnected!')
        })
    })
}
