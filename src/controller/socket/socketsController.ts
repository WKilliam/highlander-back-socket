import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'

module.exports = (io: any) => {
    const socketService = new SocketService()
    const socketEndPoints: string = 'highlander-socket'

    io.on('connection', (socket: Socket) => {
        console.log(`${socket.id} connected!`)

        socket.on('message', (data: { message: string }) => {
            console.log('message', data);
            io.emit('message', data.message);
        })

        socket.on('join', (data: {
            joinnedRoom: string,
            oldRoom?: string
        }) => {
            if (data.oldRoom) {
                console.log(`${socket.id} joined room: ${data.joinnedRoom} and left room: ${data.oldRoom}`);
                socket.leave(data.oldRoom);
                socket.join(data.joinnedRoom);
                console.log(`${socket.id} joined room: ${data.joinnedRoom} and send message to : joined-room-${data.joinnedRoom}`);
                io.to(data.joinnedRoom).emit('send-alerte', `${socket.id} joined room: ${data.joinnedRoom}`);
            } else {
                console.log(`${socket.id} joined room: ${data.joinnedRoom}`)
                socket.join(data.joinnedRoom);
                console.log(`${socket.id} joined room: ${data.joinnedRoom} and send message to : joined-room-${data.joinnedRoom}`);
                io.to(data.joinnedRoom).emit('send-alerte', `${socket.id} joined room: ${data.joinnedRoom}`);
            }
        })

        socket.on('game-info', (data: { sessionskey: string }) => {
            console.log('game-info', data);
            io.emit(`game-info-${data.sessionskey}`, socketService.contentJsonInfo(data.sessionskey));
        })

        socket.on('messageFromClient', (data: { message: string, room: string }) => {
            console.log('Message from client:', data);
            io.to(data.room).emit('messageFromServer', data.message);
        })

        socket.on('disconnect', () => {
            console.log('a user disconnected!')
        })
    })
}
