import {GameKeySession, SessionModel} from "./sessions.models";
import {TeamsModels} from "./teams.models";
import {MapModels} from "./map.models";
import {PlayersGameModels, PlayersLobbyModels} from "./players.models";
import {InfoGame} from "./infoGame";

export interface PartiesFullBodyModels {
    map: MapModels
    game: GameModels
    infoGame: InfoGame
}

export interface GameModels {
    teams: TeamsModels,
    monsters:TeamsModels,
}


export enum StatePlayer {
    LOBBY = "LOBBY",
    GAME = "GAME",
    FIGTH = "FIGTH",
    DONJON = "DONJON",
    DONJON_FIGTH = "DONJON_FIGTH",
    WIN = "WIN",
    LOSE = "LOSE",
}
