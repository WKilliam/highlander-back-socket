import {Cells, MapsModels} from "./maps.models";
import {CardByEntityPlaying, CardsModels} from "./cards.models";
import {EntityCategorie, EntityStatus} from "./enums";

export interface PlayerCardsEntity {
    name: string;
    commonLife: number;
    commonMaxLife: number;
    commonAttack: number;
    commonDefense: number;
    commonLuck: number;
    commonSpeed: number;
    cellPosition: Cells
    typeEntity: EntityCategorie
    entityStatus: EntityStatus
    cardsInfo?: Array<CardByEntityPlaying>;
}

export class CardPlayerEntityModels{
    static initPlayerCardsEntity(isHumain:boolean,stringTeamName:string,cards:Array<CardByEntityPlaying>) :PlayerCardsEntity{
        let tabcards:Array<CardByEntityPlaying> = []
        if(isHumain){
            tabcards.push(CardsModels.initCardByEntityPlaying())
            tabcards.push(CardsModels.initCardByEntityPlaying())
            return {
                name: stringTeamName,
                commonLife: -1,
                commonMaxLife: -1,
                commonAttack: -1,
                commonDefense: -1,
                commonLuck: -1,
                commonSpeed: -1,
                typeEntity: EntityCategorie.HUMAIN,
                cellPosition: MapsModels.initCells(),
                entityStatus: EntityStatus.NULL,
                cardsInfo: tabcards,
            }
        }else{
            return {
                name: stringTeamName,
                commonLife: 200,
                commonMaxLife: 200,
                commonAttack: cards[0].atk + cards[1].atk,
                commonDefense: cards[0].def + cards[1].def,
                commonLuck: cards[0].luk + cards[1].luk,
                commonSpeed: cards[0].spd + cards[1].spd,
                typeEntity: EntityCategorie.COMPUTER,
                cellPosition: MapsModels.initCells(),
                entityStatus: EntityStatus.ALIVE,
                cardsInfo: cards,
            }
        }
    }
}
