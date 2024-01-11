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
                cardsInfo: cards.length === 0 ? tabcards : cards,
            }
        }else{
            return {
                name: stringTeamName,
                commonLife: -1,
                commonMaxLife: -1,
                commonAttack: -1,
                commonDefense: -1,
                commonLuck: -1,
                commonSpeed: -1,
                typeEntity: EntityCategorie.COMPUTER,
                cellPosition: MapsModels.initCells(),
                cardsInfo: cards,
            }
        }
    }
}
