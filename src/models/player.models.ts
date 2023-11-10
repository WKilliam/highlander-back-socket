import {CardByEntityPlaying} from "./cards.models";

export interface PlayerCards {
    avatar: string;
    pseudo: string;
}

export interface PlayerLobby {
    score: number;
    avatar: string;
    pseudo: string;
    cards :Array<CardByEntityPlaying>;
}
