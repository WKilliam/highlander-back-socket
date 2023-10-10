import {Rarity} from "../utils/enum/enum";

export interface CardsModelsRequest{
    name : string
    description : string
    image : string
    rarity : string
    atk : number
    def : number
    vit : number
    luk : number,
    effects : Array<number>
}


