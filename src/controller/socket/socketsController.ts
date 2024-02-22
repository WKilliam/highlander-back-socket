import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {AppDataSource} from "../../utils/database/database.config";
import {
    UserBotMasterSession,
    UserCanJoin,
    UserGamePlay,
    UserIdentitiesGame,
    UserSocketConnect
} from "../../models/users.models";
import {DiceRolling, Parties, RoomBotAction, RoomContentModels, RoomQueue} from "../../models/room.content.models";
import {Utils} from "../../utils/utils";
import {SessionModels} from "../../models/session.models";
import {FormatRestApi, FormatRestApiModels} from "../../models/formatRestApi";
import {SessionDto} from "../../dto/session.dto";
import {Cells} from "../../models/maps.models";

module.exports = (io: any) => {

    const socketService = new SocketService(AppDataSource)
    const socketEndPoints: string = 'highlander-socket'
    let partieInitChrono: Map<string, Parties> = new Map<string, Parties>()
    let partieRoomQueue: Map<string, RoomQueue> = new Map<string, RoomQueue>()
    let partieRoomBotAction: Map<string, RoomBotAction> = new Map<string, RoomBotAction>()
    let lastCallTimes = new Map<string, number>();


    io.on('connection', (socket: Socket) => {
            console.log(`%c ${socket.id} connected!`, 'color: blue; font-size: 20px;');

            function messageSocket(room: string, path: string, data: any) {
                io.to(`${socketEndPoints}-${room}`).emit(`${room}${path}`, data);
                io.emit(`test${path}`, data);
            }

            function joinRoom(room: string, client: String, whereCallingMethode: string) {
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


            function initPartie(room: string) {
                let parties = RoomContentModels.initParties()
                partieInitChrono.set(room, parties)
            }

            /**
             * Join session
             * @path join-default  **** input ***
             * @room highlander-socket-{{room}}
             * @path default **** output ***
             */
            socket.on('default-join', async (data: UserSocketConnect) => {
                const pseudo = data.pseudo
                joinRoom(`${pseudo}`, pseudo, 'default-join')
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
                console.log('join-room', data)
                const join = await socketService.joinRoom(room, token)
                joinRoom(room, pseudo, 'join-room')
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
                    joinRoom(room, pseudo, 'join-session')
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
                } else {
                    const joinTeam = await socketService.joinTeamWithCard(
                        room,
                        positionPlayerInLobby,
                        teamSelectedPerPlayer,
                        cardPositionInsideTeamCards,
                        cardSelected)
                    messageSocket(data.room, '-join-team-card', joinTeam)
                }
            })

            function initChronoStartGame(room: string) {
                // No timer exists for this room, create a new one
                let parties = partieInitChrono.get(room) ?? RoomContentModels.initParties()
                parties.parties.timer = setInterval(async () => {
                    let value = parties.parties.initAfterStart--;
                    if (value > 0) {
                        console.log('timer', parties.parties.initAfterStart)
                        messageSocket(room, '-init-chrono-start', parties.parties.initAfterStart)
                    } else {
                        clearInterval(partieInitChrono.get(room)?.parties.timer)
                        const session = await socketService.getSession(room)
                        messageSocket(room, '-init-chrono-start', {session:session,start:true})
                    }
                }, 1000);
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

            function initChronoInGame(room: string) {
                // No timer exists for this room, create a new one
                let parties = partieInitChrono.get(room) ?? RoomContentModels.initParties()
                clearInterval(partieInitChrono.get(room)?.parties.timer)
                parties.parties.timer = setInterval(async () => {
                    let value = parties.parties.initInGame--;
                    if (value > 0) {
                        console.log(`time for room ${room}`, parties.parties.initInGame)
                        messageSocket(room, '-init-chrono-start-game', parties.parties.initInGame)
                    } else {
                        clearInterval(partieInitChrono.get(room)?.parties.timer)
                        partieRoomQueue.set(room, RoomContentModels.initRoomQueue())
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
            socket.on('chrono-game', async (data: { room: string, user: string }) => {
                const room = data.room
                const user = data.user
                // get queue process for room
                const partieQueue = partieRoomQueue.get(room)
                if (partieQueue === undefined) {
                    let roomQueue = RoomContentModels.initRoomQueue()
                    roomQueue.queue = true
                    roomQueue.user = user
                    partieRoomQueue.set(room, roomQueue)
                    initChronoInGame(room)
                } else {
                    if (!partieQueue.queue) {
                        let roomQueue = RoomContentModels.initRoomQueue()
                        roomQueue.queue = true
                        roomQueue.user = user
                        partieRoomQueue.set(room, roomQueue)
                        initChronoInGame(room)
                    } else {
                        console.log('chrono-game queue is not empty', partieQueue)
                    }
                }
            })

            function resetAndStartTimer(room: string) {
                // Arrêtez le timer existant s'il y en a un
                const existingParties = partieInitChrono.get(room);
                if (existingParties && existingParties.parties.timer) {
                    clearInterval(existingParties.parties.timer);
                }

                // Réinitialisez ou créez les parties pour la salle
                let parties = existingParties ?? RoomContentModels.initParties();
                partieInitChrono.set(room, parties); // Assurez-vous que l'objet parties est à jour dans partieInitChrono

                // Démarrez le timer
                initChronoInGame(room);
            }

            /**
             * chrono game
             * @path reset-timer-for-player-join-session  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-init-chrono-start  || {{room}}-game **** output ***
             **/
            socket.on('reset-timer-next-turn', async (data: { room: string, user: string }) => {
                const room = data.room;
                const user = data.user;
                const now = Date.now();
                const lastCallTime = lastCallTimes.get(user) || 0;
                const cooldownPeriod = 10000; // 10 secondes

                // Check if the user has called resetAndStartTimer recently
                if (now - lastCallTime < cooldownPeriod) {
                    console.log(`User ${user} a déjà appelé resetAndStartTimer récemment. Ignorer l'appel.`);
                    return;
                }

                // Update the last call time
                lastCallTimes.set(user, now);

                // Execute the function resetAndStartTimer
                resetAndStartTimer(room);
            })

            /**
             * check-turn
             * @path check-turn  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-game
             * */
            socket.on('check-turn', async (data: { room: string }) => {
                const room = data.room
                console.log(data.room)
                const play = await socketService.whoIsPlayEntityType(room)
                messageSocket(room, '-game', play)
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

            /**
             * humain-action
             * @path humain-action **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-game-humain
             * */
            socket.on('humain-action', async (data: UserGamePlay) => {
                const room = data.room
                const resume = data.action.resume
                const evolving = data.action.evolving
                const play = await socketService.actionMoving(room, resume, evolving)
                messageSocket(room, '-game-humain', play)
            })

            /**
             * bot-turn
             * @path humain-turn **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-game
             * */
            socket.on('bot-action', async (data: UserBotMasterSession) => {
                const room = data.room
                const user = data.user
                const resume = data.action.resume
                const evolving = data.action.evolving
                const partieBotAction = partieRoomBotAction.get(room)
                if (partieBotAction === undefined) {
                    let roomBotAction = RoomContentModels.initRoomBotAction()
                    roomBotAction.queue = true
                    roomBotAction.user = data.user
                    partieRoomBotAction.set(room, roomBotAction)
                    const play = await socketService.actionMoving(room, resume, evolving)
                    messageSocket(room, '-game-bot', play)
                } else {
                    if (partieBotAction.user === user) {
                        const play = await socketService.actionMoving(room, resume, evolving)
                        messageSocket(room, '-game-bot', play)
                    } else {
                        console.log('bot-action queue is starting by master', partieBotAction)
                    }
                }
            })

            socket.on('bot-selection-move', (data : {cells:Array<Cells>,room:string}) => {
                const array = data.cells
                const room = data.room
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]]; // Échange éléments
                }
                messageSocket(room, '-bot-move', array[0])
            })


            socket.on('disconnect', () => {
                console.log('a user disconnected!')
            })
        }
    )
}
