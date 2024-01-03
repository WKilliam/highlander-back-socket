import {PlayerCards} from "./player.models";
import {EntityStatus} from "./enums";

export interface CardEntitySimplify {
    id: number;
    atk: number;
    def: number;
    spd: number;
    luk: number;
    name: string;
    description: string;
    rarity: string;
    image: string;
    effects: Array<Effects>;
    capacities: Array<Attack>;
}

export interface CardByEntityPlaying {
    player: PlayerCards
    atk: number;
    def: number;
    spd: number;
    luk: number;
    name: string;
    description: string;
    rarity: string;
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

export class CardsModels {

    static initCardEntitySimplify(): CardEntitySimplify{
        return {
            id: 0,
            atk: 0,
            def: 0,
            spd: 0,
            luk: 0,
            name: '',
            description: '',
            rarity: '',
            image: '',
            effects: [],
            capacities: []
        }
    }

    static initCardByEntityPlaying(): CardByEntityPlaying{
        return {
            player: {
                pseudo: '',
                avatar: '',
            },
            atk: 0,
            def: 0,
            spd: 0,
            luk: 0,
            name: '',
            description: '',
            rarity: '',
            imageSrc: '',
            effects: [],
            capacities: []
        }
    }

    static initCardsRestApi(): CardsRestApi{
        return {
            id: 0,
            name: '',
            description: '',
            image: '',
            rarity: '',
            atk: 0,
            def: 0,
            spd: 0,
            luk: 0,
            effects: [],
            capacities: [],
            deckId: 0
        }
    }

    static initCardCreateArg(): CardCreateArg{
        return {
            cards: [],
            deck: 0
        }
    }

    static initCapacityRestApi(): CapacityRestApi{
        return {
            name: '',
            description: '',
            icon: '',
            action: ''
        }
    }

    static initEffects(): Effects{
        return {
            id: 0,
            name: '',
            description: '',
            icon: '',
            rarity: '',
            action: ''
        }
    }

    static initAttack(): Attack{
        return {
            id: 0,
            name: '',
            description: '',
            icon: '',
            action: ''
        }
    }

}
