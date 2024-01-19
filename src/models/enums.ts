export enum Can {
    NULL = "NULL",
    START_TURN = "START_TURN",
    SEND_DICE = "SEND_DICE",
    CHOOSE_MOVE = "CHOOSE_MOVE",
    MOVE = "MOVE",
    FINISH_TURN = "FINISH_TURN",
    START_FIGHT = "START_FIGHT",

    API_CHALLENGERS_SEND_DICE = "CHALLENGERS_SEND_DICE", // All challengers send dice for determine bonus chance or not ( luk impact result )
    API_RETURN_RESULT_DICE = "RETURN_RESULT_DICE", // Return result dice for all challenger determine bonus chance or not ( luk impact result )
    API_CREATE_TURN = "CREATE_TURN", // Create turn for all challenger
    API_APPLY_EFFECTS = "APPLY_EFFECTS", // Apply effects for all challenger
    START_TURN_FIGHT = "START_TURN_FIGHT", // Start turn for all challenger
    RESULT_TURN_FIGHT = "RESULT_TURN_FIGHT", // Result turn for all challenger
    END_TURN_FIGHT = "END_TURN_FIGHT", // End turn for all challenger
    END_FIGHT = "END_FIGHT", // End fight for all challenger
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
