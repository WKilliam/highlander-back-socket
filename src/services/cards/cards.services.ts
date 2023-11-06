import {DataSource, DeepPartial, In, Repository} from "typeorm";
import {CardsDto} from "../../dto/cards.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {Utils} from "../../utils/utils";
import {CardsRestApi} from "../../models/cards.models";
import {CapacityDto} from "../../dto/capacity.dto";
import {DecksDto} from "../../dto/decks.dto";

export class CardsServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }


    async create(card: CardsRestApi) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const cardsDtoRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
            const capacityDtoRepository: Repository<CapacityDto> = dataSource.getRepository(CapacityDto);
            const effectsDtoRepository: Repository<EffectsDto> = dataSource.getRepository(EffectsDto);
            const decksDtoRepository: Repository<DecksDto> = dataSource.getRepository(DecksDto);
            const effects = await effectsDtoRepository.findBy({ id: In(card.effects) })
            const capacity = await capacityDtoRepository.findBy({ id: In(card.capacities) })
            const deck = await decksDtoRepository.findOne({ where: { id: card.deckId } }) as DecksDto;

            if (!deck) return Utils.formatResponse(404, 'Deck not found', null, null);

            // Créez la carte sans sauvegarder pour l'instant
            const cardCreated = cardsDtoRepository.create({
                name: card.name,
                description: card.description,
                image: card.image,
                rarity: card.rarity,
                createdAt: new Date().toISOString(),
                atk: card.atk,
                def: card.def,
                spd: card.spd,
                luk: card.luk,
                deck: deck,
            });


            const newCard = await cardsDtoRepository.save(cardCreated);
            newCard.effects = effects;
            newCard.capacities = capacity;
            await cardsDtoRepository.save(newCard);
            return Utils.formatResponse(201, 'Card created successfully', newCard, null);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal server error', null, error.message);
        }
    }

    async getCapacityById(number: number) {
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
                return Utils.formatResponse(200, 'Capacity Found', card);
            }else{
                return Utils.formatResponse(404, 'Capacity Not Found', card);
            }
        }catch(error:any){
            return Utils.formatResponse(500, 'Internal Server Error', error, error.message);
        }
    }
}
