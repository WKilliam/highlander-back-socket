import {Cells, Maps, MapsModels} from "./maps.models";
import {PlayerLobby} from "./player.models";
import {CardByEntityPlaying} from "./cards.models";
import {CardPlayerEntityModels, PlayerCardsEntity} from "./cards.player.entity.models";
import {StatusGame} from "./enums";
import {EntityActionFight, EntityActionMoving} from "./actions.game.models";

export interface SessionGame {
    sessionStatusGame: SessionStatusGame;
    game: Game;
    maps: Maps;
}

export interface SessionStatusGame {
    room: string;
    teamNames: Array<string>;
    status: StatusGame;
    turnCount: number
    lobby:Array<PlayerLobby>
    entityTurn : Array<EntityActionMoving>,
    currentEntityActionMovingPosition: number
}

export interface Game {
    teams: Array<PlayerCardsEntity>
    monsters: Array<PlayerCardsEntity>
    fightings: Array<Map<string,EntityActionFight>>
}

export class SessionModels {
    static initSessionGame(): SessionGame{
        return {
            sessionStatusGame: SessionModels.initSessionStatusGame(),
            game: SessionModels.initGame(['Alpha','Beta','Gamma','Delta']),
            maps: MapsModels.initMaps()
        }
    }

    static initGame(ArrayStringTeam:Array<string>): Game{
        const teamTabDefault:Array<PlayerCardsEntity> = []
        teamTabDefault.push(CardPlayerEntityModels.initPlayerCardsEntity(true,ArrayStringTeam[0]))
        teamTabDefault.push(CardPlayerEntityModels.initPlayerCardsEntity(true,ArrayStringTeam[1]))
        teamTabDefault.push(CardPlayerEntityModels.initPlayerCardsEntity(true,ArrayStringTeam[2]))
        teamTabDefault.push(CardPlayerEntityModels.initPlayerCardsEntity(true,ArrayStringTeam[3]))
        return {
            teams: teamTabDefault,
            monsters: [],
            fightings: []
        }
    }

    static initSessionStatusGame(): SessionStatusGame{
        return {
            room: '',
            teamNames: [],
            status: StatusGame.NULL,
            turnCount: 0,
            lobby:[],
            entityTurn : [],
            currentEntityActionMovingPosition: 0
        }
    }

    static createSessionStatusGame(key:string,teams:Array<string>): SessionStatusGame{
        return {
            room: key,
            teamNames: teams,
            status: StatusGame.LOBBY,
            turnCount: 0,
            lobby:[],
            entityTurn : [],
            currentEntityActionMovingPosition: -1
        }

    }
}


