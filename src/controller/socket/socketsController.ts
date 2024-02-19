import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {AppDataSource} from "../../utils/database/database.config";
import {UserCanJoin, UserGamePlay, UserIdentitiesGame, UserSocketConnect} from "../../models/users.models";
import {DiceRolling, Parties, RoomContentModels} from "../../models/room.content.models";
import {Utils} from "../../utils/utils";
import {SessionModels} from "../../models/session.models";
import {FormatRestApi, FormatRestApiModels} from "../../models/formatRestApi";
import {SessionDto} from "../../dto/session.dto";

module.exports = (io: any) => {

    const socketService = new SocketService(AppDataSource)
    const socketEndPoints: string = 'highlander-socket'
    let partieInitChrono: Map<string, Parties> = new Map<string, Parties>()


    io.on('connection', (socket: Socket) => {
            console.log(`%c ${socket.id} connected!`, 'color: blue; font-size: 20px;');

            function messageSocket(room: string, path: string, data: any) {
                io.to(`${socketEndPoints}-${room}`).emit(`${room}${path}`, data);
                io.emit(`test${path}`, data);
            }

            function joinRoom(room: string,client:String,whereCallingMethode:string) {
                let rooms = Object.keys(socket.rooms);
                socket.rooms.forEach(room => {
                    socket.leave(room);
                });
                socket.join(`${socketEndPoints}-${room}`);
                socket.rooms.forEach(room => {
                    rooms.push(room);
                })
                console.log(`%c ${socket.id} (${client}) (${whereCallingMethode}) joined session: ${socketEndPoints}-${room} , rooms: ${rooms}`)
            }

            /**
             * Join session
             * @path join-default  **** input ***
             * @room highlander-socket-{{room}}
             * @path default **** output ***
             */
            socket.on('default-join', async (data: UserSocketConnect) => {
                const pseudo = data.pseudo
                joinRoom(`${pseudo}`,pseudo,'default-join')
                const defaultJoin = await socketService.canJoinSession(data.token)
                messageSocket(`${pseudo}`, '-join', defaultJoin)
            })

            /**
             * Join session
             * @path join  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-join **** output ***
             */
            socket.on('join-room', async (data: UserSocketConnect) => {
                const room = data.room
                const pseudo = data.pseudo
                const token = data.token
                const join = await socketService.joinRoom(room,token)
                joinRoom(room,pseudo,'join-room')
                messageSocket(room, '-join', join)
            })

            /**
             * Join session
             * @path join  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-join **** output ***
             */
            socket.on('join-session', async (data: UserSocketConnect) => {
                const room = data.room
                const token = data.token
                const pseudo = data.pseudo
                const join = await socketService.joinSession(room, token)
                if (join.code === 200) {
                    joinRoom(room,pseudo,'join-session')
                    messageSocket(room, '-join', join)
                }
            })

            /**
             * Join team
             * @path rolling  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-join-team **** output ***
             */
            socket.on('join-team', async (data: UserIdentitiesGame) => {
                const room = data.room
                const positionPlayerInLobby = data.positionPlayerInLobby
                const teamSelectedPerPlayer = data.teamSelected
                const cardPositionInsideTeamCards = data.cardPositionInTeam
                const joinTeam = await socketService.joinTeamWithCard(
                    room,
                    positionPlayerInLobby,
                    teamSelectedPerPlayer,
                    cardPositionInsideTeamCards,
                    -1)
                messageSocket(data.room, '-join-team', joinTeam)
            })

            /**
             * Join team card
             * @path rolling  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-join-team **** output ***
             */
            socket.on('join-team-card', async (data: UserIdentitiesGame) => {
                const room = data.room
                const positionPlayerInLobby = data.positionPlayerInLobby
                const teamSelectedPerPlayer = data.teamSelected
                const cardPositionInsideTeamCards = data.cardPositionInTeam
                const cardSelected = data.cardSelected ?? -1
                if (cardSelected === -1) {
                    messageSocket(data.room, '-join-team-card', FormatRestApiModels.createFormatRestApi(400, 'Card is empty', null, null))
                }else{
                    const joinTeam = await socketService.joinTeamWithCard(
                        room,
                        positionPlayerInLobby,
                        teamSelectedPerPlayer,
                        cardPositionInsideTeamCards,
                        cardSelected)
                    messageSocket(data.room, '-join-team-card', joinTeam)
                }
            })


            /**
             * rolling dice
             * @path rolling  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-rolling **** output ***
             */
            socket.on('rolling-dice', async (data: DiceRolling) => {
                const room = data.room
                const luck = data.luk
                const arrayLimit = data.arrayLimit
                const min = data.min
                const max = data.max
                const rolling = socketService.diceRolling(luck, arrayLimit, min, max)
                messageSocket(data.room, '-rolling', rolling)
            })


            function initChronoStartGame(room: string) {
                // No timer exists for this room, create a new one
                let parties = partieInitChrono.get(room) ?? RoomContentModels.initParties()
                parties.parties.timer = setInterval(() => {
                    let value = parties.parties.initAfterStart--;
                    if (value > 0) {
                        console.log('timer', parties.parties.initAfterStart)
                        messageSocket(room, '-init-chrono-start', parties.parties.initAfterStart)
                    } else {
                        clearInterval(partieInitChrono.get(room)?.parties.timer)
                        messageSocket(room, '-init-chrono-start', true)
                    }
                }, 1000);
            }

            function initPartie(room: string) {
                let parties = RoomContentModels.initParties()
                partieInitChrono.set(room, parties)
            }

            /**
             * Init Game
             * @path init-game  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-join-team **** output ***
             */
            socket.on('init-game', async (data: { room: string }) => {
                const room = data.room
                console.log(data.room)
                const joinTeam = await socketService.initGame(room)
                messageSocket(data.room, '-start-game', joinTeam)
                initPartie(room)
                initChronoStartGame(room)
            })

            /**
             * reset timer for player join session
             * @path reset-timer-for-player-join-session  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-init-chrono-start **** output ***
             */
            socket.on('reset-timer-for-player-join-session', async (data: { room: string }) => {
                const room = data.room
                console.log(room)
                let parties = partieInitChrono.get(room) ?? null
                if (parties !== null) {
                    const count = await socketService.countReturn(data.room)
                    if (count.data < 2) {
                        parties.parties.initAfterStart = parties.parties.initAfterStart + 10
                        partieInitChrono.set(room, parties)
                    }
                }
            })

            function initChronoInGame(room: string) {
                // No timer exists for this room, create a new one
                let parties = partieInitChrono.get(room) ?? RoomContentModels.initParties()
                clearInterval(partieInitChrono.get(room)?.parties.timer)
                parties.parties.timer = setInterval(async () => {
                    let value = parties.parties.initInGame--;
                    if (value > 0) {
                        console.log('timer', parties.parties.initInGame)
                        messageSocket(room, '-init-chrono-start', parties.parties.initInGame)
                    } else {
                        clearInterval(partieInitChrono.get(room)?.parties.timer)
                        const next = await socketService.whoIsPlayEntityType(room)
                        messageSocket(room, '-game', next)
                    }
                }, 1000);
            }

            /**
             * chrono game
             * @path reset-timer-for-player-join-session  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-init-chrono-start  || {{room}}-game **** output ***
             **/
            socket.on('chrono-game', async (data: { room: string }) => {
                const room = data.room
                initChronoInGame(room)
            })

            /**
             * check-turn
             * @path check-turn  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-game
             * */
            socket.on('check-turn', async (data: { room: string }) => {
                const room = data.room
                const play = await socketService.whoIsPlayEntityType(room)
                messageSocket(room, '-game', play)
            })

            /**
             * humain-action
             * @path humain-action **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-game
             * */
            socket.on('humain-action', async (data: UserGamePlay) => {
                const room = data.room
                const resume = data.action.resume
                const evolving = data.action.evolving
                const play = await socketService.humainActionMoving(room, resume, evolving)
                messageSocket(room, '-game', play)
            })

            /**
             * bot-turn
             * @path humain-turn **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-game
             * */
            socket.on('bot-turn', async (data: UserGamePlay) => {
                const room = data.room
                // const play = await socketService.humainTurn(room, data)
                // messageSocket(room, '-game', play)
            })


            socket.on('disconnect', () => {
                console.log('a user disconnected!')
            })
        }
    )
}
