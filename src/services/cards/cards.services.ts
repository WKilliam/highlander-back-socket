import {DataSource, DeepPartial, In, Repository} from "typeorm";
import {CardsDto} from "../../dto/cards.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {Utils} from "../../utils/utils";
import {CardCreateArg, CardsRestApi} from "../../models/cards.models";
import {CapacityDto} from "../../dto/capacity.dto";
import {DecksDto} from "../../dto/decks.dto";
import {FormatRestApiModels} from "../../models/formatRestApi";

export class CardsServices {
    dataSourceConfig: Promise<DataSource>;
    private failledDeckNotFound: string = 'Deck Not Found';
    private succesCardCreated: string = 'Card Found';
    private failledInternalServer: string = 'Internal Server Error';
    private successCardCreated: string = 'Card Created Successfully';
    private failledCardNotFound: string = 'Card Not Found';
    private failledCardCreatedError: string = 'Card Created Error';

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
            if (!deck) return FormatRestApiModels.createFormatRestApi(404, this.failledDeckNotFound, null, null);
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
                if (!createdCard) return FormatRestApiModels.createFormatRestApi(500, this.failledCardCreatedError, newCard, null);
                arrayNewCard.push(createdCard);
            }
            return FormatRestApiModels.createFormatRestApi(200, this.successCardCreated, arrayNewCard, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer, null, error.message);
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
                return FormatRestApiModels.createFormatRestApi(200, this.succesCardCreated, card,'');
            }else{
                return FormatRestApiModels.createFormatRestApi(404, this.failledCardNotFound, card,'');
            }
        }catch(error:any){
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer, null, error.message);
        }
    }
}
