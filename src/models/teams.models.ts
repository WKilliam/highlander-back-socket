import {PlayersModels, PlayersModelsMonster} from "./players.models";

export interface TeamsModels{
    one :TeamBodyModels
    two :TeamBodyModels
    three :TeamBodyModels
    four :TeamBodyModels
    five :TeamBodyModels
}

export interface TeamBodyModels{
    isAlive: boolean;
    name: string;
    players : Array<PlayersModels>
}

export interface MonstersModels{
    one :TeamsMonstersModels
    two :TeamsMonstersModels
    three :TeamsMonstersModels
    four :TeamsMonstersModels
    five :TeamsMonstersModels
}

export interface TeamsMonstersModels{
    isAlive: boolean;
    name: string;
    players : Array<PlayersModelsMonster>
}
