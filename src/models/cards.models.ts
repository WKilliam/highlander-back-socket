import {PlayerCards} from "./player.models";
import {Cells} from "./maps.models";
import {DecksDto} from "../dto/decks.dto";
import {EntityStatus} from "./room.content.models";


export enum action {
    "ATK",
    "DEF",
    "SPD",
    "LUK",
    "NONE"
}

export enum attack {
    "A" = "A"
}

export interface CardEntitySimplify {
    id: number;
    atk: number;
    def: number;
    spd: number;
    luk: number;
    rarity: string;
    imageSrc: string;
    effects: Array<Effects>;
    attacks: Array<Attack>;
}

export interface CardByEntityPlaying {
    player?: PlayerCards
    atk: number;
    def: number;
    spd: number;
    luk: number;
    rarity: string;
    status: EntityStatus;
    imageSrc: string;
    effects: Array<Effects>;
    capacities: Array<Attack>;
}

export interface CardsRestApi{
    id?: number,
    name : string,
    description : string,
    image : string,
    rarity : string,
    atk : number,
    def : number,
    spd : number,
    luk : number,
    effects :Array<number>
    capacities : Array<number>
    deckId?: number
}

export interface CardDocumentSetter {
    name: string,
    commonLife: number,
    commonMaxLife: number,
    commonAttack: number,
    commonDefense: number,
    commonLuck: number,
    commonSpeed: number,
    cellPosition: Cells,
}

export interface CardCreateArg {
    cards: Array<CardsRestApi>,
    deck: number
}

export interface CapacityRestApi {
    name :string,
    description :string,
    icon :string,
    action :string
}

export interface Effects {
    id?: number;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    action: string;
}

export interface Attack {
    id?: number;
    name: string;
    description: string;
    icon: string;
    action: string;
}
