import {CardByEntityPlaying, CardEntitySimplify} from "./cards.models";

export interface PlayerCards {
    avatar: string;
    pseudo: string;
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
            pseudo: ''
        }
    }
}
