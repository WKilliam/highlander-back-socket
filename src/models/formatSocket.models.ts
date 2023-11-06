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
    avatar: string;
    pseudo: string;
}

export interface SelectTeam {
    room: string;
    avatar: string;
    pseudo: string;
}

export interface SelectCard {
    room: string,
    id: number
    avatar: string,
    pseudo: string,
    card : CardEntitySimplify
}
