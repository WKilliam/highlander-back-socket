import {CardEntitySimplify} from "./cards.models";
import {Cells} from "./maps.models";
import {TurnListEntity} from "./room.content.models";
import {Can} from "./enums";

export interface FormatSocketModels{
    date: string;
    room: string;
    data?: any;
    message: string;
    code: number;
    error: any;
}

export interface JoinSessionSocket {
    room: string;
    token: string;
}

export interface PlayerStatusSession {
    room?: string | null;
    token: string;
}

export interface JoinSessionTeam {
    room: string;
    lobbyPosition: number;
    teamPosition: number;
    cardPosition: number;
}

export interface JoinSessionTeamCard {
    room: string;
    lobbyPosition: number;
    teamPosition: number;
    cardPosition: number;
    cardByPlayer:number
}

export interface CurrentTurnAction {
    turnEntity: TurnListEntity;
    dice: number,
    moves: Cells[],
    move: Cells,
    currentAction:string
}
