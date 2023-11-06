import {CardByEntityPlaying} from "./cards.models";
import {Cells, Maps} from "./maps.models";
import {PlayerLobby} from "./player.models";

export enum StatusGame {
    LOBBY = "LOBBY",
    START = "START",
    END = "END",
}

export enum EntityStatus {
    ALIVE = "ALIVE",
    DEAD = "DEAD",
    WIN = "WIN",
    LOSE = "LOSE",
    FIGTHING = "FIGTHING",
    DONJON = "DONJON",
    DONJON_FIGHTING = "DONJON_FIGHTING",
}

export interface SessionCreated {
    ownerId: number
    createdAt: string
    name: string,
    updatedAt: string,
    statusAccess: string,
    password: string,
    mapId: number,
    teamNames: Array<string>;
}

export interface SessionGame {
    sessionStatusGame: SessionStatusGame;
    game: Game;
    maps: Maps;
}

export interface SessionStatusGame {
    room: string;
    teamNames: Array<string>;
    status: StatusGame;
    turnCount: number;
    lobby:Array<PlayerLobby>
    entityTurn : Array<EntityPlaying>
}

export interface Game {
    teams: Array<EntityPlaying>
    monsters: Array<EntityPlaying>
}


export interface EntityPlaying {
    name : string;
    commonLife : number;
    commonMaxLife : number;
    commonAttack : number;
    commonDefense : number;
    commonLuck : number;
    commonSpeed : number;
    cellPosition : Cells
    entityStatus : EntityStatus
    cardsPlayer? : Array<CardByEntityPlaying>;
    cardsMonster? : Array<CardByEntityPlaying>;
}

