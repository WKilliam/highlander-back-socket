import {SocketService} from "../../services/socket/socket.service";
import {Socket} from 'socket.io'
import {AppDataSource} from "../../utils/database/database.config";
import {UserGamePlay, UserIdentitiesGame, UserSocketConnect} from "../../models/users.models";
import {DiceRolling, PartieInitChrono, Parties, RoomContentModels} from "../../models/room.content.models";
import {CardsModels} from "../../models/cards.models";
import {Utils} from "../../utils/utils";
import {SessionDto} from "../../dto/session.dto";
import {Can, EntityCategorie} from "../../models/enums";
import {PlayerCardsEntity} from "../../models/cards.player.entity.models";
import {Cells} from "../../models/maps.models";

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

            function joinRoom(room: string) {
                socket.rooms.forEach(room => {
                    socket.leave(room);
                });
                socket.join(`${socketEndPoints}-${room}`);
                console.log(`%c ${socket.id} joined session: ${socketEndPoints}-${room}`, 'color: blue; font-size: 20px;')
            }

            /**
             * can-join session
             * @path can-join  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-can-join **** output ***
             */
            socket.on('can-join', async (data: UserSocketConnect) => {
                const room = data.room
                const token = data.token
                const avatar = data.avatar
                const pseudo = data.pseudo
                const canJoin = await socketService.canJoinSession(token, avatar, pseudo)
                messageSocket(room, '-can-join', canJoin)
            })

            /**
             * Join session
             * @path join  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-join **** output ***
             */
            socket.on('join', async (data: UserSocketConnect) => {
                const room = data.room
                const token = data.token
                const avatar = data.avatar
                const pseudo = data.pseudo
                const score = data.score ?? 0
                const cards = data.cards ?? []
                if (cards.length === 0) {
                    joinRoom(`-default`);
                    messageSocket(room, '-join', {
                        code: 500,
                        message: 'Error Internal Server',
                        data: null,
                        error: 'cards is empty'
                    })
                } else {
                    if (room !== 'default') {
                        joinRoom(room);
                        messageSocket(room, '-join', {code: 200, message: 'Success', data: null, error: null})
                    } else {
                        const join = await socketService.joinSession(room, token, avatar, pseudo, score, cards)
                        messageSocket(room, '-join', join)
                    }
                }
            })

            /**
             * rolling dice
             * @path rolling  **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-rolling **** output ***
             */
            socket.on('rolling', async (data: DiceRolling) => {
                const room = data.room
                const luck = data.luk
                const arrayLimit = data.arrayLimit
                const min = data.min
                const max = data.max
                const rolling = socketService.diceRolling(luck, arrayLimit, min, max)
                messageSocket(data.room, '-rolling', rolling)
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
                const teamSelectedPerPlayer = data.teamSelectedPerPlayer
                const cardPositionInsideTeamCards = data.cardPositionInsideTeamCards
                const joinTeam = await socketService.joinTeam(
                    room,
                    positionPlayerInLobby,
                    teamSelectedPerPlayer,
                    cardPositionInsideTeamCards)
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
                const teamSelectedPerPlayer = data.teamSelectedPerPlayer
                const cardPositionInsideTeamCards = data.cardPositionInsideTeamCards
                const cardSelectedForPlay = data.cardSelectedForPlay
                const joinTeam = await socketService.joinTeamWithCard(
                    room,
                    positionPlayerInLobby,
                    teamSelectedPerPlayer,
                    cardPositionInsideTeamCards,
                    cardSelectedForPlay)
                messageSocket(data.room, '-join-team', joinTeam)
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
                messageSocket(data.room, '-join-team', joinTeam)
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
             * humain-turn
             * @path humain-turn **** input ***
             * @room highlander-socket-{{room}}
             * @path {{room}}-game
             * */
            socket.on('humain-turn', async (data: UserGamePlay) => {
                // const room = data.room
                // const teamIndex: number = data.action.teamIndex
                // const cardIndex: number = data.action.cardIndex
                // const typeEntity: EntityCategorie = data.action.typeEntity
                // const playerCardsEntity: PlayerCardsEntity = data.action.playerCardsEntity
                // const dice: number | null = data.action.dice ?? null
                // const indexInsideArray: number | null = data.action.indexInsideArray ?? null
                // const movesCans: Array<Cells> | null = data.action.movesCans ?? null
                // const moveTo: Cells  | null = data.action.moveTo ?? null
                // const currentCan: Can = data.action.currentCan
                // const humainTurn = await socketService.humainActionMoving(
                //     room,
                //     teamIndex,
                //     cardIndex,
                //     dice,
                //     movesCans,
                //     moveTo,
                //     currentCan)
                // messageSocket(room, '-game', humainTurn)
            })


            socket.on('disconnect', () => {
                console.log('a user disconnected!')
            })
        }
    )
}
