import {GameKeySession, SessionModel} from "./sessions.models";
import {TeamsModels} from "./teams.models";
import {MapModels} from "./map.models";
import {PlayersLobbyModels} from "./players.models";

export interface PartiesModelsJson {
    map: MapModels
    gameKeySession: GameKeySession
    game: GameModels
    infoGame: PartiesInfoGameModels
}

export interface GameModels {
    lobby: Array<PlayersLobbyModels>;
    teams: TeamsModels,
    monsters:TeamsModels,
}

export interface PartiesInfoGameModels {
    turnCount: number;
    orderTurn: Array<string>;
}
