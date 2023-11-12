import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {AppDataSource} from "../../utils/database/database.config";
import {
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

        socket.on('join-card',  async (data: JoinSessionTeamCard) => {
            const joinCard:FormatSocketModels = await socketService.cardSelected(data);
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, joinCard);
        })

        socket.on('start-game',  async (data: {room:string}) => {
            const joinCard:FormatSocketModels = await socketService.startGame(data.room);
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, joinCard);
        })

        socket.on('disconnect', () => {
            console.log('a user disconnected!')
        })
    })
}
