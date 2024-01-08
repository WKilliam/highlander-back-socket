export enum Can {
    NULL = "NULL",
    START_TURN = "START_TURN",
    SEND_DICE = "SEND_DICE",
    CHOOSE_MOVE = "CHOOSE_MOVE",
    MOVE = "MOVE",
    FINISH_TURN = "FINISH_TURN",
    START_FIGHT = "START_FIGHT",

    // APPLICATION_EFFECT_ALL_CARD = "APPLICATION_EFFECT_ALL_CARD",
    // IA_ONE_SEND_LUCKY_DICE = "IA_ONE_SEND_LUCKY_DICE",
    // IA_TWO_SEND_LUCKY_DICE = "IA_TWO_SEND_LUCKY_DICE",
    // PLAYER_ONE_SEND_LUCKY_DICE = "PLAYER_SEND_LUCKY_DICE",
    // PLAYER_TWO_SEND_LUCKY_DICE = "PLAYER_TWO_SEND_LUCKY_DICE",
    // IA_ONE_CHOOSE_ACTION = "IA_ONE_CHOOSE_ACTION",
    // IA_TWO_CHOOSE_ACTION = "IA_TWO_CHOOSE_ACTION",
    // PLAYER_ONE_CHOOSE_ACTION = "PLAYER_ONE_CHOOSE_ACTION",
    // PLAYER_TWO_CHOOSE_ACTION = "PLAYER_TWO_CHOOSE_ACTION",
    // RUN_TURN_FIGHT = "RUN_TURN_FIGHT",
    // CHECK_RESULT_FIGHT = "CHECK_RESULT_FIGHT",

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
