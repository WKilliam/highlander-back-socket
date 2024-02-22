import {TokenManager} from "../utils/tokennezer/jsonwebtoken";
import {UserFrontData, UserModels} from "./users.models";

export interface SessionCreated {
    createdAt: string
    name: string,
    password: string,
    mapId: number,
    teamNames: Array<string>;
    token: string
}

export interface DiceRolling {
    room: string,
    luk: number, // max 20 min -20
    arrayLimit:Array<number>,
    min:number,
    max:number
}

export interface PartieInitChrono {
    room: string,
    timer:any
    initAfterStart: number,
    initInGame: number
}

export interface PartieFightChrono {
    room: string,
    fightAfterStart: number,
    fightInGame: number
}

export interface Parties {
    parties : PartieInitChrono
    partiesFight : PartieFightChrono
}

export interface RoomQueue {
    queue: boolean,
    user : string
}

export interface RoomBotAction {
    queue: boolean,
    user : string
}



export class RoomContentModels {
    static initSessionCreated(): SessionCreated {
        return {
            createdAt: '',
            name: '',
            password: '',
            mapId: 0,
            teamNames: [],
            token: ''
        }
    }

    static initDiceRolling(): DiceRolling {
        return {
            room: '',
            luk: 0,
            arrayLimit:[],
            min:0,
            max:0
        }
    }

    static initPartieInitChrono(): PartieInitChrono {
        return {
            room: '',
            timer: null,
            initAfterStart: 15,
            initInGame: 50
        }
    }

    static initPartieFightChrono(): PartieFightChrono {
        return {
            room: '',
            fightAfterStart: 15,
            fightInGame: 30
        }
    }

    static initParties(): Parties {
        return {
            parties: RoomContentModels.initPartieInitChrono(),
            partiesFight: RoomContentModels.initPartieFightChrono()
        }
    }

    static initRoomQueue(): RoomQueue {
        return {
            queue: false,
            user: ''
        }
    }

    static initRoomBotAction(): RoomBotAction {
        return {
            queue: false,
            user: '',
        }
    }

}
