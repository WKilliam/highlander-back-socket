import {Cells} from "./maps.models";
import {Attack, CardByEntityPlaying, CardsModels} from "./cards.models";
import {Can, EntityCategorie, EntityStatus} from "./enums";
import {CardPlayerEntityModels, PlayerCardsEntity} from "./cards.player.entity.models";

export interface EntityResume {
    teamIndex: number
    cardIndex: number,
    entityStatus: EntityStatus,
    currentCellsId: number,
    typeEntity: EntityCategorie | string,
    indexInsideArray: number,
    speed: number,
    cardPlaying: CardByEntityPlaying,
}

export interface EntityEvolving {
    dice: number | null,
    movesCansIds: Array<Cells> | null,
    moveToId: number | null,
    currentCan: Can
}

export interface EntityActionMoving {
    resume: EntityResume,
    evolving: EntityEvolving,
}

export interface EntityActionFight {
    teamIndex: number
    cardIndex: number
    typeEntity: EntityCategorie,
    playerCardsEntity: PlayerCardsEntity,
    effectApplicatedTeam: Array<number>
    capacityUsingsByCard: Array<Attack>
    orderCapacityUsingsByCard: Array<number>
    targetEnemyPositionByCapacityPosition: Array<number>
    successCriticalForCapacityUsingsByCard: Array<number>
    dice?: number,
    currentCan?: Can,
}


export class ActionGameModels {

    initEntityActionMoving(): EntityActionMoving {
        return {
            resume: this.initEntityResume(),
            evolving: this.initEntityEvolving(),
        }
    }

    initEntityActionFight(): EntityActionFight {
        return {
            teamIndex: -1,
            cardIndex: -1,
            typeEntity: EntityCategorie.NULL,
            playerCardsEntity: CardPlayerEntityModels.initPlayerCardsEntity(true,'Name',[]),
            effectApplicatedTeam: [],
            capacityUsingsByCard: [],
            orderCapacityUsingsByCard: [],
            targetEnemyPositionByCapacityPosition: [],
            successCriticalForCapacityUsingsByCard: []
        }
    }

    initEntityResume(): EntityResume {
        return {
            teamIndex: -1,
            cardIndex: -1,
            entityStatus: EntityStatus.NULL,
            currentCellsId: -1,
            typeEntity: EntityCategorie.NULL,
            indexInsideArray: -1,
            speed: -1,
            cardPlaying: CardsModels.initCardByEntityPlaying(),
        }
    }

    initEntityEvolving(): EntityEvolving {
        return {
            dice: -1,
            movesCansIds: [],
            moveToId: -1,
            currentCan: Can.NULL
        }
    }
}
