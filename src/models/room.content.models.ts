
export interface SessionCreated {
    createdAt: string
    name: string,
    password: string,
    mapId: number,
    teamNames: Array<string>;
}

export interface DiceRolling {
    room: string,
    luk: number, // max 20 min -20
    arrayLimit:Array<number>,
    min:number,
    max:number
}



export class RoomContentModels {
    static initSessionCreated(): SessionCreated {
        return {
            createdAt: '',
            name: '',
            password: '',
            mapId: 0,
            teamNames: []
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
}
