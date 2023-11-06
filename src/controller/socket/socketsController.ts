import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {Utils} from "../../utils/utils";
import {
    FormatSocketModels,
    JoinSessionSocket,
    SelectCard,
    SelectTeam
} from "../../models/formatSocket.models";
import {FormatRestApiModels} from "../../models/formatRestApi.models";


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

        socket.on('join-session', async (data: JoinSessionSocket) => {
            socket.rooms.forEach(room => {
                socket.leave(room);
            });
            socket.join(`${socketEndPoints}-${data.room}`);
            console.log(`${socket.id} joined session: ${socketEndPoints}-${data.room}`)
            let parties: FormatRestApiModels = Utils.partiesDataSocket(data.room)
            let formatSocket: FormatSocketModels = Utils.formatSocketMessage(
                `${socketEndPoints}-${data.room}`,
                parties.data,
                `${socket.id} joined session: ${socketEndPoints}-${data.room} , complete message : ${parties.message}`,
                parties.code, parties.error)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, formatSocket);
        })


        socket.on('select-place-team', async (data: SelectTeam) => {
            // let value = socketService.selectPlaceTeam(data)
            // let formatSocket: FormatSocketModels = Utils.formatSocketMessage(
            //     `${socketEndPoints}-${data.room}`,
            //     value.data,
            //     `${socket.id} joined session: ${socketEndPoints}-${data.room} , complete message : ${value.message}`,
            //     value.error, value.error)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, "formatSocket");
        })

        socket.on('select-card-team', async (data: SelectCard) => {
            // let value = socketService.selectCardPlaceTeam(data)
            // let formatSocket: FormatSocketModels = Utils.formatSocketMessage(
            //     `${socketEndPoints}-${data.room}`,
            //     value.data,
            //     `${socket.id} joined session: ${socketEndPoints}-${data.room} , complete message : ${value.message}`,
            //     value.error, value.error)
            // console.log(formatSocket)
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, "formatSocket");
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
