import {Cells, MapsModels} from "./maps.models";
import {CardByEntityPlaying, CardsModels} from "./cards.models";
import {EntityStatus} from "./enums";

export interface PlayerCardsEntity {
    name: string;
    commonLife: number;
    commonMaxLife: number;
    commonAttack: number;
    commonDefense: number;
    commonLuck: number;
    commonSpeed: number;
    cellPosition: Cells
    entityStatus: EntityStatus
    cardsPlayer?: Array<CardByEntityPlaying>;
    cardsMonster?: Array<CardByEntityPlaying>;
}

export class CardPlayerEntityModels{
    static initPlayerCardsEntity(isHumain:boolean,stringTeamName:string) :PlayerCardsEntity{
        let tabcards:Array<CardByEntityPlaying> = []
        tabcards.push(CardsModels.initCardByEntityPlaying())
        tabcards.push(CardsModels.initCardByEntityPlaying())
        if(isHumain){
            return {
                name: stringTeamName,
                commonLife: 0,
                commonMaxLife: 0,
                commonAttack: 0,
                commonDefense: 0,
                commonLuck: 0,
                commonSpeed: 0,
                cellPosition: MapsModels.initCells(),
                entityStatus: EntityStatus.NULL,
                cardsPlayer: tabcards,
            }
        }else{
            return {
                name: '',
                commonLife: 0,
                commonMaxLife: 0,
                commonAttack: 0,
                commonDefense: 0,
                commonLuck: 0,
                commonSpeed: 0,
                cellPosition: MapsModels.initCells(),
                entityStatus: EntityStatus.NULL,
                cardsMonster: tabcards,
            }
        }
    }
}
