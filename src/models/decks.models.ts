import {CardsRestApi} from "./cards.models";

export enum rarity {
    common = "common",
    rare = "rare",
    epic = "epic",
    legendary = "legendary"
}

export enum type {
    monster = "monster",

}

export interface Decks {
    name: string
    description: string
    image: string
    type: type | string,
    rarity: rarity | string,
    createdAt: string,
    count: number,
    cards: Array<CardsRestApi>
}

export interface DecksRestApi {
    name: string
    description: string
    image: string
    type: type | string,
    rarity: rarity | string,
    cards: Array<CardsRestApi>
}

export interface DecksRestApiUser {
    name: string
    description: string
    image: string
    type: type | string,
    rarity: rarity | string,
}
