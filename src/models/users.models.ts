import {DecksRestApi, DecksRestApiUser} from "./decks.models";
import {CardByEntityPlaying, CardEntitySimplify, CardsRestApi} from "./cards.models";
import {ActionGameModels, EntityActionMoving} from "./actions.game.models";

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

export interface MasterMaidData {
    lobbyPosition: number;
    valid: boolean;
    countCheckError: number;
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

    static initUserSocketConnect() :UserSocketConnect{
        return {
            room: '',
            token: '',
            pseudo: '',
            avatar: '',
            score: 0,
            cards: []
        }
    }

    static initUserIdentitiesGame() :UserIdentitiesGame{
        return {
            room: '',
            positionPlayerInLobby: 0,
            teamSelectedPerPlayer: 0,
            cardPositionInsideTeamCards: 0,
            cardSelectedForPlay: 0
        }
    }

    static initUserGamePlay() :UserGamePlay{
        return {
            room: '',
            action: ActionGameModels.initEntityActionMoving()
        }
    }

    static initMasterMaidData() :MasterMaidData{
        return {
            lobbyPosition: -1,
            valid: false,
            countCheckError: 0
        }
    }
}
