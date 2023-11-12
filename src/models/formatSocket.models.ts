import {CardEntitySimplify} from "./cards.models";

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
