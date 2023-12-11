import {CardByEntityPlaying} from "./cards.models";
import {Cells, Maps} from "./maps.models";
import {PlayerLobby} from "./player.models";
import {CurrentTurnAction} from "./formatSocket.models";

export enum StatusGame {
    LOBBY = "LOBBY",
    START = "START",
    GAME = "GAME",
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
    createdAt: string
    name: string,
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
    turnCount: number
    lobby:Array<PlayerLobby>
    entityTurn : Array<TurnListEntity>,
    currentTurnEntity: CurrentTurnAction
}

export interface Game {
    teams: Array<EntityPlaying>
    monsters: Array<EntityPlaying>
    fightings: Array<Array<TurnListEntity>>
}

export interface EntityPlaying {
    name: string;
    commonLife: number;
    commonMaxLife: number;
    commonAttack: number;
    commonDefense: number;
    commonLuck: number;
    commonSpeed: number;
    cellPosition: Cells
    entityStatus: EntityStatus
    cardsPlayer?: Array<CardByEntityPlaying>;
    cardsMonster?: Array<CardByEntityPlaying>;
}

export enum EntityCategorie {
    HUMAIN ='HUMAIN',
    COMPUTER = 'COMPUTER'
}

export interface TurnListEntity {
    team?: string
    pseudo: string
    teamIndex: number
    cardIndex: number
    typeEntity: EntityCategorie
    luk: number,
    cellPosition?: Cells
}

