import {SessionModel} from "./sessions.models";
import {TeamsModels} from "./teams.models";
import {MapModels} from "./map.models";
import {PlayersLobbyModels} from "./players.models";

export interface PartiesModelsJson {
    map: MapModels
    sessions: SessionModel
    game: GameModels
    infoGame: PartiesInfoGameModels
}

export interface GameModels {
    lobby: Array<PlayersLobbyModels>;
    teams: TeamsModels
}

export interface PartiesInfoGameModels {
    turnCount: number;
    orderTurn: Array<string>;
}
