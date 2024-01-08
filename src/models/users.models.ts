import {DecksRestApi, DecksRestApiUser} from "./decks.models";
import {CardByEntityPlaying, CardEntitySimplify, CardsRestApi} from "./cards.models";
import {EntityActionMoving} from "./actions.game.models";

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
    cards: Array<CardEntitySimplify>;
}

export interface UserSocketConnect{
    room: string;
    token: string;
    pseudo: string;
    avatar: string;
    score?:number;
    cards?:Array<CardEntitySimplify>;
}

export interface UserIdentitiesGame {
    room: string;
    positionPlayerInLobby: number;
    teamSelectedPerPlayer: number;
    cardPositionInsideTeamCards: number;
    cardSelectedForPlay: number
}


export interface UserGamePlay {
    room: string;
    action: EntityActionMoving;
}

export class UserModels {

    static initUserSubscription() :UserSubscription{
        return {
            pseudo: '',
            password: '',
            email: '',
            avatar: '',
            deckIds: [],
            cardsIds: []
        }
    }

    static initUserFrontData() :UserFrontData{
        return {
            token: '',
            pseudo: '',
            avatar: '',
            bearcoins: 0,
            decks: [],
            cards: []
        }
    }
}
