import {DataSource, DeepPartial, In, Repository} from "typeorm";
import {CardsDto} from "../../dto/cards.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {Utils} from "../../utils/utils";
import {CardCreateArg, CardsRestApi} from "../../models/cards.models";
import {CapacityDto} from "../../dto/capacity.dto";
import {DecksDto} from "../../dto/decks.dto";

export class CardsServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }


    async create(cardsCreate:CardCreateArg) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const cardsDtoRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
            const decksDtoRepository: Repository<DecksDto> = dataSource.getRepository(DecksDto);
            const effectsDtoRepository: Repository<EffectsDto> = dataSource.getRepository(EffectsDto);
            const capacitiesDtoRepository: Repository<CapacityDto> = dataSource.getRepository(CapacityDto);
            let arrayNewCard: CardsDto[] = [];
            const deck = await decksDtoRepository.findOne({where: {id: cardsCreate.deck}}) as DecksDto;
            if (!deck) return Utils.formatResponse(404, 'Deck not found', null, null);
            for (let i = 0; i < cardsCreate.cards.length; i++) {
                const effects = await effectsDtoRepository.findBy({id: In(cardsCreate.cards[i].effects)})
                const capacities = await capacitiesDtoRepository.findBy({id: In(cardsCreate.cards[i].capacities)})
                const newCard: CardsDto = cardsDtoRepository.create({
                    name: cardsCreate.cards[i].name,
                    description: cardsCreate.cards[i].description,
                    image: cardsCreate.cards[i].image,
                    rarity: cardsCreate.cards[i].rarity,
                    atk: cardsCreate.cards[i].atk,
                    def: cardsCreate.cards[i].def,
                    spd: cardsCreate.cards[i].spd,
                    luk: cardsCreate.cards[i].luk,
                    createdAt: new Date().toISOString(),
                    deck: deck,
                    effects: effects,
                    capacities: capacities
                })
                const createdCard: CardsDto = await cardsDtoRepository.save(newCard);
                if (!createdCard) return Utils.formatResponse(500, 'Card created Error', newCard, null);
                arrayNewCard.push(createdCard);
            }
            return Utils.formatResponse(200, 'Card created successfully', arrayNewCard, null);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal server error', null, error.message);
        }
    }

    async getCardById(number: number) {
        try{
            const dataSource :DataSource = await this.dataSourceConfig;
            const cardsRepository:Repository<CardsDto> = dataSource.getRepository(CardsDto);

            const card = await cardsRepository.findOne({
                select: [
                    "id",
                    "name",
                    "description",
                    "image",
                    "rarity",
                    "atk",
                    "def",
                    "spd",
                    "luk",
                    "createdAt",
                    "deck",
                    "effects",
                    "capacities"
                ],
                relations :[
                    "deck",
                    "effects",
                    "capacities"
                ],
                where: {id: number},
            });
            if (card) {
                return Utils.formatResponse(200, 'Card Found', card);
            }else{
                return Utils.formatResponse(404, 'Card Not Found', card);
            }
        }catch(error:any){
            return Utils.formatResponse(500, 'Internal Server Error', error, error.message);
        }
    }
}
