import {CardByEntityPlaying, CardEntitySimplify} from "./cards.models";
import {EntityStatus} from "./enums";

export interface PlayerCards {
    avatar: string;
    pseudo: string;
    status: EntityStatus
}

export interface PlayerLobby {
    score: number;
    avatar: string;
    pseudo: string;
    cards :Array<CardEntitySimplify>;
}


export class PlayerModels {
    static initPlayerLobby() :PlayerLobby{
        return {
            score: 0,
            avatar: '',
            pseudo: '',
            cards: []
        }
    }

    static initPlayerCards() :PlayerCards{
        return {
            avatar: '',
            pseudo: '',
            status: EntityStatus.NULL
        }
    }
}
