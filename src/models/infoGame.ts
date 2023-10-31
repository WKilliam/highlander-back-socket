import {GameKeySession} from "./sessions.models";
import {PlayersGameModels, PlayersLittleModels, PlayersLobbyModels} from "./players.models";

export interface InfoGame{
    gameKeySession: GameKeySession
    freeplace: number;
    turnCount: number,
    lobby: Array<PlayersLobbyModels>;
    orderTurn: Array<string>
    allPlayers: Array<PlayersLittleModels>;
}
