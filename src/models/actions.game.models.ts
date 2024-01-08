import {Cells} from "./maps.models";
import {Attack} from "./cards.models";
import {Can, EntityCategorie} from "./enums";
import {CardPlayerEntityModels, PlayerCardsEntity} from "./cards.player.entity.models";

export interface EntityActionMoving {
    teamIndex: number
    cardIndex: number
    typeEntity: EntityCategorie,
    playerCardsEntity: PlayerCardsEntity,
    dice?: number,
    indexInsideArray?: number,
    movesCans?: Array<Cells>,
    moveTo?: Cells,
    currentCan: Can
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
            currentCan: Can.NULL,
            teamIndex: -1,
            cardIndex: -1,
            typeEntity: EntityCategorie.NULL,
            playerCardsEntity: CardPlayerEntityModels.initPlayerCardsEntity(true,'Name',[])
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
}
