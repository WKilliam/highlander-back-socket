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
        console.log(`%c ${socket.id} connected!`,'color: blue; font-size: 20px;')

        socket.on('join', async (data: JoinSessionSocket) => {
            socket.rooms.forEach(room => {
                socket.leave(room);
            });
            socket.join(`${socketEndPoints}-${data.room}`);
            console.log(`%c ${socket.id} joined session: ${socketEndPoints}-${data.room}`,'color: blue; font-size: 20px;')
            if (data.room !== 'default') {
                let socketJoin= await socketService.joinSession(data);
                io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, socketJoin);
            } else {
                io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, `${socket.id} joined session: ${socketEndPoints}-${data.room}`);
            }
        })

        function roomConnect() {
            let rooms: Array<string> = [];
            socket.rooms.forEach((room) => {
                rooms.push(room);
            });
            return rooms;
        }

        function joinDefaultRoom(data: string) {
            socket.rooms.forEach((room) => {
                socket.leave(room);
            });
            socket.join(`highlander-socket-default`);
            io.to(`${socketEndPoints}-default`).emit(`room-${data}`, `default`);
        }

        socket.on(`room`, async (data: string) => {
            let rooms: Array<string> = roomConnect();
            if (rooms.length > 0) {
                const roomParts: string[] = rooms[0].split('-');
                console.log("roomParts", roomParts)
                if (roomParts.length === 3) {
                    const lastPart: string = roomParts[2];
                    console.log("lastPart", lastPart)
                    if (lastPart === 'default') {
                        console.log("Valid room:", rooms[0]);
                        joinDefaultRoom(data);
                    }else if (lastPart.length === 5){
                        console.log("Valid room:", rooms[0]);
                        socket.rooms.forEach((room) => {
                            if(room !== rooms[0]){
                                socket.leave(room);
                            }else{
                                console.log("Check room:", rooms[0])
                                socket.join(rooms[0]);
                            }
                        });
                        io.to(`${rooms[0]}`).emit(`room-${data}`, lastPart);
                    }else{
                        console.log("Invalid room. Joining default room. Inside 3eme else");
                        joinDefaultRoom(data);
                    }
                }else{
                    console.log("Invalid room. Joining default room. Inside Second else");
                    joinDefaultRoom(data);
                }
            }else{
                console.log("Invalid room. Joining default room. Outside first else");
                joinDefaultRoom(data);
            }
        });

        socket.on('join-team', async (data: JoinSessionTeam) => {
            const joinTeam = await socketService.joinTeam(data);
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, joinTeam);
        })

        socket.on('join-card', async (data: JoinSessionTeamCard) => {
            const joinCard = await socketService.cardSelected(data);
            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, joinCard);
        })

        /**
         * Boucle de jeu
         */

        socket.on('createTurnList', async (data: {room:string}) => {
            console.log(data.room)
            const createTurnList = await socketService.createTurnList(data.room);
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
