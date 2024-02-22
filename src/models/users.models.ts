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
}

export interface UserIdentitiesGame {
    room: string;
    positionPlayerInLobby: number;
    teamSelected: number;
    cardPositionInTeam: number;
    cardSelected?:number
}

export interface UserCanJoin {
    token: string;
    pseudo: string;
    avatar: string;
    room: string;
}

export interface UserGamePlay {
    room: string;
    action: EntityActionMoving;
}

export interface UserBotMasterSession {
    room: string
    user: string
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
            pseudo: ''
        }
    }

    static initUserIdentitiesGame() :UserIdentitiesGame{
        return {
            room: '',
            positionPlayerInLobby: 0,
            teamSelected: 0,
            cardPositionInTeam: 0
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

    static initUserCanJoin() :UserCanJoin{
        return {
            token: '',
            pseudo: '',
            avatar: '',
            room: ''
        }
    }

    static initUserBotMasterSession() :UserBotMasterSession{
        return {
            room: '',
            user: '',
            action: ActionGameModels.initEntityActionMoving()
        }
    }
}
