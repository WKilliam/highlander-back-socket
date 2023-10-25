import {Rarity} from "../utils/enum/enum";
import {EffectsModelsRequest} from "./effects.models";

export interface CardsModelsRequest{
    id?: number
    name : string
    description : string
    image : string
    rarity : string
    atk : number
    def : number
    spd : number
    luk : number,
    effects : Array<number>
}

export interface CardsModels{
    id : number
    name : string
    description : string
    image : string
    rarity : Rarity
    atk : number
    def : number
    spd : number
    luk : number,
    effects : Array<EffectsModelsRequest>
}


