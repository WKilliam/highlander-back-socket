import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {SocketJoinSession, SocketJoinTeamCard} from "../../models/sockets.models";
import {FormatModel, SocketFormatModel} from "../../models/format.model";
import {Utils} from "../../utils/utils";


module.exports = (io: any) => {
    let socketService = new SocketService()
    const socketEndPoints: string = 'highlander-socket'

    io.on('connection', (socket: Socket) => {
        console.log(`${socket.id} connected!`)

        socket.on('join-default', () => {
            socket.rooms.forEach(room => {
                if (room !== `${socketEndPoints}-default`) {
                    console.log(`${socket.id} left room: ${room}`);
                    socket.leave(room);
                }
            });
            socket.join(`${socketEndPoints}-default`);
            let formatSocket: SocketFormatModel = Utils.formatSocketMessage(
                `${socketEndPoints}-default`, null,
                `${socket.id} joined room: ${socketEndPoints}-default`,
                200, null)
            console.log(formatSocket.message)
            io.to(`${socketEndPoints}-default`).emit('app-connected', formatSocket);
        })

        socket.on('join-session', async (data: SocketJoinSession) => {
            socket.rooms.forEach(room => {
                socket.leave(room);
            });
            socket.join(`${socketEndPoints}-${data.roomjoin}`);
            let parties :FormatModel = Utils.partiesDataSocket(data.roomjoin)
            let formatSocket: SocketFormatModel = Utils.formatSocketMessage(
                `${socketEndPoints}-${data.roomjoin}`,
                parties.data,
                `${socket.id} joined session: ${socketEndPoints}-${data.roomjoin} , complete message : ${parties.message}`,
                parties.code, parties.error)
            console.log(formatSocket.message)
            io.to(`${socketEndPoints}-${data.roomjoin}`).emit(`app-connected-${data.roomjoin}`, formatSocket);
        })

        socket.on('join-team-card', async (data: SocketJoinTeamCard) => {
            const jointeamCard :FormatModel = socketService.joinTeam(data)
            let formatSocket: SocketFormatModel = Utils.formatSocketMessage(
                `${socketEndPoints}-${data.gameKey}`, jointeamCard.data,
                `join-team-card: ${data.gameKey}`,
                jointeamCard.code, jointeamCard.error)
            console.log(formatSocket.message)
            io.to(`${socketEndPoints}-${data.gameKey}`).emit(`app-connected-${data.gameKey}`, formatSocket);
        })

        socket.on('disconnect', () => {
            console.log('a user disconnected!')
        })
    })
}
