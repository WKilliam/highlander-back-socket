import {CardsModels, CardsModelsRequest} from "./cards.models";
import {PlayersGameModels} from "./players.models";

export interface TeamsModels {
    teamOne: TeamBodyModels;
    teamTwo: TeamBodyModels;
    teamThree: TeamBodyModels;
    teamFour: TeamBodyModels;
}

export interface TeamBodyModels {
    freeplace: number;
    teamName: string;
    commonLife: number;
    commonMaxLife: number;
    commonAttack: number;
    commonDefense: number;
    commonLuck: number;
    commonSpeed: number;
    isAlive: boolean;
    isReady: boolean;
    playerOne: PlayersGameModels;
    playerTwo: PlayersGameModels;
    cardOne: CardsModelsRequest;
    cardTwo: CardsModelsRequest;
}
