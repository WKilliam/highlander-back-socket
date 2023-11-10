import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {AppDataSource} from "../../utils/database/database.config";
import {FormatSocketModels, JoinSessionSocket, JoinSessionTeam} from "../../models/formatSocket.models";


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
            if(data.room !== 'default'){
                let socketJoin:FormatSocketModels = await socketService.joinSession(data);
                io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, socketJoin);
            }else{
                io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, `${socket.id} joined session: ${socketEndPoints}-${data.room}`);
            }
        })

        socket.on('join-team',  async (data: JoinSessionTeam) => {
            const joinTeam:FormatSocketModels = await socketService.joinTeam(data);
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, joinTeam);
        })

        // socket.on('session-default', async (data: {}) => {
        //     socket.rooms.forEach(room => {
        //         socket.leave(room);
        //     });
        //     socket.join(`${socketEndPoints}-default`);
        //     console.log(`${socket.id} joined session: ${socketEndPoints}-default`)
        //     io.to(`${socketEndPoints}-default`).emit('default', `${socket.id} joined session: ${socketEndPoints}-default`);
        // })
        //
        // socket.on('joinSession', async (data: JoinSessionSocket) => {
        //     socket.rooms.forEach(room => {
        //         socket.leave(room);
        //     });
        //     socket.join(`${socketEndPoints}-${data.room}`);
        //     let socketJoin:FormatSocketModels = await socketService.joinSession(data);
        //     console.log(`${socket.id} joined session: ${socketEndPoints}-${data.room}`)
        //     io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, socketJoin);
        // })
        //
        //
        // socket.on('joinTeam', async (data: JoinSessionTeam) => {
        //     let socketJoinTeam:FormatSocketModels = await socketService.joinTeam(data);
        //     io.to(`${socketEndPoints}-${data.room}`).emit('${data.room}', socketJoinTeam);
        // })
        //
        // socket.on('cardSelected', async (data: JoinSessionTeam) => {
        //     let socketJoinCard :FormatSocketModels = await socketService.cardSelected(data);
        //     io.to(`${socketEndPoints}-${data.room}`).emit('${data.room}', socketJoinCard);
        // })
        //
        // socket.on('move-possibility', async (data: {
        //     room: string,
        //     cellIdCurrentPosition: number,
        //     diceValue: number,
        //     pseudo: string,
        // }) => {
        //
        // })
        //
        // socket.on('move-to-possibility', async (data: { room: string }) => {
        //     io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-move-player`, `move player to possibility`);
        // })
        //
        // socket.on('next-turn', async (data: {}) => {
        //
        // })
        //
        //
        socket.on('disconnect', () => {
            console.log('a user disconnected!')
        })
    })
}
