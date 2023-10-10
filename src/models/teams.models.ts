import {PlayersModels} from "./players.models";

export interface TeamsModels{
    TeamOne :TeamBodyModels
    TeamTwo :TeamBodyModels
    TeamThree :TeamBodyModels
    TeamFour :TeamBodyModels
    TeamFive :TeamBodyModels
}

export interface TeamBodyModels{
    isAlive: boolean;
    players : Array<PlayersModels>
}
