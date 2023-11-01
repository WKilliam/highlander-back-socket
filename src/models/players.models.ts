import {CardsModels} from "./cards.models";
import {CardsDto} from "../dto/cards.dto";

export interface PlayersLobbyModels{
    avatar: string,
    pseudo: string,
    cards: Array<CardsDto>,
}

export interface PlayersGameModels{
    avatar: string,
    pseudo: string,
    life: number,
    maxLife: number,
    state: string,
    cardsPosessed: Array<number>,
}

export interface PlayersLittleModels{
    avatar: string,
    pseudo: string,
    teamTag: string,
}
