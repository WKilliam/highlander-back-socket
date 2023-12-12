import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {AppDataSource} from "../../utils/database/database.config";
import {
    CurrentTurnAction,
    JoinSessionTeam,
    JoinSessionTeamCard, PlayerStatusSession
} from "../../models/formatSocket.models";
import {FormatRestApiModels} from "../../models/formatRestApi.models";

interface LockState {
    isLocked: boolean;
}

module.exports = (io: any) => {

    const socketService = new SocketService(AppDataSource)
    const socketEndPoints: string = 'highlander-socket'


    io.on('connection', (socket: Socket) => {
            console.log(`%c ${socket.id} connected!`, 'color: blue; font-size: 20px;')

            socket.on('join', async (data: PlayerStatusSession) => {
                socket.rooms.forEach(room => {
                    socket.leave(room);
                });
                if (data.room !== 'default' || data.room !== null) {
                    socket.join(`${socketEndPoints}-${data.room}`);
                    console.log(`%c ${socket.id} joined session: ${socketEndPoints}-${data.room}`, 'color: blue; font-size: 20px;')
                    let socketJoin = await socketService.joinSession(data);
                    io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, socketJoin);
                } else {
                    socket.join(`${socketEndPoints}-default`);
                    console.log(`%c ${socket.id} joined session: ${socketEndPoints}-${data.room}`, 'color: blue; font-size: 20px;')
                    io.to(`${socketEndPoints}-default`).emit(`${data.room}`, `${socket.id} joined session: ${socketEndPoints}-${data.room}`);
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
                if (data !== null) {
                    socket.rooms.forEach(room => {
                        socket.leave(room);
                    });
                    socket.join(`${socketEndPoints}-${data}`);
                } else {
                    console.log("Invalid room. Joining default room. Inside 1er else");
                }
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
                        } else if (lastPart.length === 5) {
                            console.log("Valid room:", rooms[0]);
                            socket.rooms.forEach((room) => {
                                if (room !== rooms[0]) {
                                    socket.leave(room);
                                } else {
                                    console.log("Check room:", rooms[0])
                                    socket.join(rooms[0]);
                                }
                            });
                            io.to(`${rooms[0]}`).emit(`room-${data}`, lastPart);
                        } else {
                            console.log("Invalid room. Joining default room. Inside 3eme else");
                            joinDefaultRoom(data);
                        }
                    } else {
                        console.log("Invalid room. Joining default room. Inside Second else");
                        joinDefaultRoom(data);
                    }
                } else {
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

            socket.on('createTurnList', async (data: { room: string }) => {
                const createTurnList = await socketService.createTurnList(data.room);
                io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}`, createTurnList);
            })

            let queueRoom: Array<string> = [];

            function objFormat(socket:FormatRestApiModels){
                const action: CurrentTurnAction = socket.data.game.sessionStatusGame.currentTurnEntity
                console.log('socket.data', action)
                return action
            }

            socket.on('botTurn', async (data: { room: string, action: CurrentTurnAction }) => {
                const room = data.room;
                const botAction = data.action;
                if (!queueRoom.includes(room)) {
                    queueRoom.push(room);
                    const next = await socketService.botAction(room, botAction)
                    if(next.code < 200 || next.code > 299) {
                        console.log('error next.code', next)
                    }
                    io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next)
                    const sendDice = objFormat(next)
                    const next0 = await socketService.botAction(room, sendDice)
                    if(next0.code < 200 || next0.code > 299) {
                        console.log('error next0.code', next0)
                    }
                    io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next0)
                    const chooseMove = objFormat(next0)
                    const next1 = await socketService.botAction(room, chooseMove)
                    if(next1.code < 200 || next1.code > 299) {
                        console.log('error next1.code', next1)
                    }
                    io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next1)
                    const move = objFormat(next1)
                    const next2 = await socketService.botAction(room, move)
                    if(next2.code < 200 || next2.code > 299) {
                        console.log('error next2.code', next2)
                    }
                    io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next2)
                    const endMove = objFormat(next2)
                    const next3 = await socketService.botAction(room, endMove)
                    if(next3.code < 200 || next3.code > 299) {
                        console.log('error next3.code', next3)
                    }
                    io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next3)
                    const endTurn = objFormat(next3)
                    const next4 = await socketService.botAction(room, endTurn)
                    if(next4.code < 200 || next4.code > 299) {
                        console.log('error next4.code', next4)
                    }
                    io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next4)
                }
            });

            socket.on('botLeaveQueue', async (data: { room: string }) => {
                const room = data.room;
                if (queueRoom.includes(room)) {
                    queueRoom.splice(queueRoom.indexOf(room), 1);
                } else {
                    console.log('error room not in queue')
                }
            })

            socket.on('humainTurn', async (data: { room: string, action: CurrentTurnAction }) => {
                const room = data.room;
                const humainAction = data.action;
                switch (humainAction.currentAction) {
                    case 'WHO_IS_TURN':
                        const next = await socketService.humainAction(room, humainAction)
                        io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next)
                        break;
                    case 'SEND_DICE':
                        const next0 = await socketService.humainAction(room, humainAction)
                        io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next0)
                        break;
                    case 'CHOOSE_MOVE':
                        const next1 = await socketService.humainAction(room, humainAction)
                        io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next1)
                        break;
                    case 'MOVE':
                        const next2 = await socketService.humainAction(room, humainAction)
                        io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next2)
                        break;
                    case 'END_MOVE':
                        const next3 = await socketService.humainAction(room, humainAction)
                        io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next3)
                        break;
                    case 'END_TURN':
                        const next4 = await socketService.humainAction(room, humainAction)
                        io.to(`${socketEndPoints}-${room}`).emit(`${room}-turn`, next4)
                        break;
                }
            })

            socket.on('disconnect', () => {
                console.log('a user disconnected!')
            })
        }
    )
}
