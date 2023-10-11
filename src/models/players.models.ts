import {CardsModels} from "./cards.models";

export interface PlayersModels{
    id : number
    name : string
    currentHp : number,
    maxHp : number,
    card:CardsModels
}

export interface PlayersModelsMonster{
    id : number
    name : string
    currentHp : number,
    maxHp : number,
    card:CardsModels
}
