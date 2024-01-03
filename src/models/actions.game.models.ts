import {Cells} from "./maps.models";
import {Attack, CardByEntityPlaying} from "./cards.models";
import {Can, EntityCategorie} from "./enums";
import {CardPlayerEntityModels, PlayerCardsEntity} from "./cards.player.entity.models";

export interface EntityActionMoving {
    teamIndex: number
    cardIndex: number
    typeEntity: EntityCategorie,
    playerCardsEntity: PlayerCardsEntity,
    cellPosition?: Cells,
    dice?: number,
    indexInsideArray?: number,
    movesCans?: Cells[],
    moveTo?: Cells,
    currentCan?: Can
}

export interface EntityActionFight {
    teamIndex: number
    cardIndex: number
    typeEntity: EntityCategorie,
    playerCardsEntity: PlayerCardsEntity,
    dice?: number,
    currentCan?: Can,
    effectApplicatedTeam: Array<number>
    capacityUsingsByCard: Array<Attack>
    orderCapacityUsingsByCard: Array<number>
    targetEnemyPositionByCapacityPosition: Array<number>
    successCriticalForCapacityUsingsByCard: Array<number>
}


export class ActionGameModels {

    initEntityActionMoving(): EntityActionMoving {
        return {
            teamIndex: -1,
            cardIndex: -1,
            typeEntity: EntityCategorie.NULL,
            playerCardsEntity: CardPlayerEntityModels.initPlayerCardsEntity()
        }
    }

    initEntityActionFight(): EntityActionFight {
        return {
            teamIndex: -1,
            cardIndex: -1,
            typeEntity: EntityCategorie.NULL,
            playerCardsEntity: CardPlayerEntityModels.initPlayerCardsEntity(),
            effectApplicatedTeam: [],
            capacityUsingsByCard: [],
            orderCapacityUsingsByCard: [],
            targetEnemyPositionByCapacityPosition: [],
            successCriticalForCapacityUsingsByCard: []
        }
    }
}
