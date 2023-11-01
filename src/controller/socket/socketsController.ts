import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {SocketJoinSession, SocketJoinTeamCard, SocketSelectPlaceTeam} from "../../models/sockets.models";
import {FormatModel, SocketFormatModel} from "../../models/format.model";
import {Utils} from "../../utils/utils";
import {JsonServices} from "../../services/jsonconceptor/json.services";


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
            io.to(`${socketEndPoints}-${data.roomjoin}`).emit(`${data.roomjoin}`, formatSocket);
        })

        function movePlayer(
            room:string, avatar:string,
            pseudo:string, teamTag:string, position:number,
        ){
            // place is free now we can move player
            const movePlayer = JsonServices.setPlayer(room, avatar,pseudo,teamTag,position)
            // if moveplayer Failed
            if(movePlayer.code < 200 && movePlayer.code > 299)
                io.to(`${socketEndPoints}-${room}`).emit(`${room}-${avatar}-error`, movePlayer);
            // if moveplayer success
            let formatSocket: SocketFormatModel = Utils.formatSocketMessage(
                `${socketEndPoints}-${room}`,
                movePlayer.data,
                `success : ${movePlayer.message}`,
                movePlayer.code, movePlayer.error
            )
            const parties :FormatModel = Utils.partiesDataSocket(room)
            let formatSocketParties: SocketFormatModel = Utils.formatSocketMessage(
                `${socketEndPoints}-${room}`,
                parties.data,
                `update : ${parties.message}`,
                parties.code, parties.error
            )
            if(parties.code >= 200 && parties.code < 299){
                io.to(`${socketEndPoints}-${room}`).emit(`update-${room}`, formatSocketParties);
            }
            io.to(`${socketEndPoints}-${room}`).emit(`${room}-${avatar}-success`, formatSocket);
        }

        socket.on('select-place-team', async (data: SocketSelectPlaceTeam) => {
            // check if player is already in team
            const checkIfPlayerIfInsideAnotherTeam = JsonServices.checkIfPlayerIfInsideAnotherTeam(data.room, data.avatar,data.pseudo)
            if(!(checkIfPlayerIfInsideAnotherTeam.code >= 200 && checkIfPlayerIfInsideAnotherTeam.code <= 299)){
                // player is in team
                // check if place is free
                const securityCheckPlayer = JsonServices.securityCheckPlayer(data.room, data.teamTag,data.position)
                if (!(securityCheckPlayer.code >= 200 && securityCheckPlayer.code <= 299)){
                    let formatSocket: SocketFormatModel = Utils.formatSocketMessage(
                        `${socketEndPoints}-${data.room}`,
                        securityCheckPlayer.data,
                        `error : ${securityCheckPlayer.error}`,
                        securityCheckPlayer.code, securityCheckPlayer.error
                    )
                    // is not free
                    io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-${data.avatar}-error`, formatSocket);
                }else{
                    // place is free now we can move player
                    movePlayer(data.room, data.avatar,data.pseudo,data.teamTag,data.position)
                    const deletePlayerAfterMove :FormatModel = JsonServices.restPlayerAfterMove(data.room, checkIfPlayerIfInsideAnotherTeam.data.teamTag, checkIfPlayerIfInsideAnotherTeam.data.position)
                    if(!(deletePlayerAfterMove.code >= 200 && deletePlayerAfterMove.code <= 299)){
                        const deleteFormatSocket: SocketFormatModel = Utils.formatSocketMessage(
                            `${socketEndPoints}-${data.room}`,
                            deletePlayerAfterMove.data,
                            `error : ${deletePlayerAfterMove.error}`,
                            deletePlayerAfterMove.code, deletePlayerAfterMove.error
                        )
                        io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-${data.avatar}-error`, deleteFormatSocket);
                    }
                }
            }else{
                // player is not in team
                movePlayer(data.room, data.avatar,data.pseudo,data.teamTag,data.position)
                const deletePlayerAfterMove :FormatModel = JsonServices.restPlayerAfterMove(data.room, checkIfPlayerIfInsideAnotherTeam.data.teamTag, checkIfPlayerIfInsideAnotherTeam.data.position)
                if(!(deletePlayerAfterMove.code >= 200 && deletePlayerAfterMove.code <= 299)){
                    const deleteFormatSocket: SocketFormatModel = Utils.formatSocketMessage(
                        `${socketEndPoints}-${data.room}`,
                        deletePlayerAfterMove.data,
                        `error : ${deletePlayerAfterMove.error}`,
                        deletePlayerAfterMove.code, deletePlayerAfterMove.error
                    )
                    io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-${data.avatar}-error`, deleteFormatSocket);
                }
            }
        })

        socket.on('select-card-team', async (data: {}) => {

        })

        socket.on('move-possibility', async (data: {}) => {

        })

        socket.on('move-to-possibility', async (data: {room:string}) => {


            io.to(`${socketEndPoints}-${data.room}`).emit(`${data.room}-move-player`, `move player to possibility`);
        })

        socket.on('next-turn', async (data: {}) => {

        })



        socket.on('disconnect', () => {
            console.log('a user disconnected!')
        })
    })
}
