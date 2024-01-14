export enum Can {
    NULL = "NULL",
    START_TURN = "START_TURN",
    SEND_DICE = "SEND_DICE",
    CHOOSE_MOVE = "CHOOSE_MOVE",
    MOVE = "MOVE",
    FINISH_TURN = "FINISH_TURN",
    START_FIGHT = "START_FIGHT",
    ALL_ENTITY_SEND_DICE = "ALL_ENTITY_SEND_DICE",

}

export enum StatusGame {
    NULL = "NULL",
    LOBBY = "LOBBY",
    START = "START",
    GAME = "GAME",
    END = "END",
}


export enum EntityCategorie {
    NULL = 'NULL',
    HUMAIN ='HUMAIN',
    COMPUTER = 'COMPUTER'
}

export enum EntityStatus {
    NULL = "NULL",
    ALIVE = "ALIVE",
    DEAD = "DEAD",
    WIN = "WIN",
    LOSE = "LOSE",
    FIGTHING = "FIGTHING",
    DONJON = "DONJON",
    DONJON_FIGHTING = "DONJON_FIGHTING",
}


export enum action {
    NULL = "NULL",
    ATK = "ATK",
    DEF = "DEF",
    SPD = "SPD",
    LUK = "LUK",
}

export enum attack {
    NULL = "NULL",
    A = "A"
}


export enum RARITY {
    null = "null",
    common = "common",
    rare = "rare",
    epic = "epic",
    legendary = "legendary"
}

export enum TYPE {
    null = "null",
    monster = "monster",
}


export class EnumString {
    static getEnumString(enumValue: any, value: string): string {
        return enumValue[value].toString();
    }

    static convertStringToEnum(enumValue: any, value: string): any {
        return enumValue[value];
    }
}
