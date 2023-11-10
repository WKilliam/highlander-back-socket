import {DecksRestApi, DecksRestApiUser} from "./decks.models";
import {CardByEntityPlaying, CardsRestApi} from "./cards.models";

export interface UsersLogin {
    email: string;
    password: string;
}

export interface UserSubscription{
    pseudo:string
    password : string
    email : string
    avatar : string
    deckIds : Array<number>
    cardsIds :Array<number>
}

export interface UserFrontData {
    token: string;
    pseudo: string;
    avatar: string;
    bearcoins: number;
    decks: Array<DecksRestApiUser>;
    cards: Array<CardsRestApi>;
}


export interface TokenData {
    id: number;
    email: string;
    password: string;
}

