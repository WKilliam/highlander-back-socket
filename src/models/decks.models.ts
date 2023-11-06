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
    type: type,
    rarity: rarity,
    createdAt: string,
    count: number,
    cards: Array<CardsRestApi>
}

export interface DecksRestApi {
    name: string
    description: string
    image: string
    type: type,
    rarity: rarity,
    cards: Array<CardsRestApi>
}
