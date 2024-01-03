import {CardsRestApi} from "./cards.models";
import {RARITY, TYPE} from "./enums";

export interface Decks {
    name: string
    description: string
    image: string
    type: TYPE
    rarity: RARITY
    createdAt: string,
    count: number,
    cards: Array<CardsRestApi>
}

export interface DecksRestApi {
    name: string
    description: string
    image: string
    type: TYPE
    rarity: RARITY
    cards: Array<CardsRestApi>
}

export interface DecksRestApiUser {
    name: string
    description: string
    image: string
    type: TYPE
    rarity: RARITY
}

export class DeckModels {

    static initDecks(){
        return {
            name: '',
            description: '',
            image: '',
            type: TYPE.null,
            rarity: RARITY.null,
            createdAt: '',
            count: 0,
            cards: []
        }
    }

    static initDecksRestApi(){
        return {
            name: '',
            description: '',
            image: '',
            type: TYPE.null,
            rarity: RARITY.null,
            cards: []
        }
    }

    static initDecksRestApiUser(){
        return {
            name: '',
            description: '',
            image: '',
            type: TYPE.null,
            rarity: RARITY.null,
        }
    }
}
