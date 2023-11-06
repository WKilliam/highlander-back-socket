import {DataSource, DeepPartial, In, Repository} from "typeorm";
import {DecksDto} from "../../dto/decks.dto";
import {CardsDto} from "../../dto/cards.dto";
import {Utils} from "../../utils/utils";
import {Decks, DecksRestApi} from "../../models/decks.models";
import {CellsDto} from "../../dto/cells.dto";
import {CapacityDto} from "../../dto/capacity.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {CardsServices} from "../cards/cards.services";
import {CardsRestApi} from "../../models/cards.models";
import {FormatRestApiModels} from "../../models/formatRestApi.models";

export class DecksServices {
    dataSourceConfig: Promise<DataSource>;
    cardService: CardsServices;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.cardService = new CardsServices(dataSourceConfig);
    }


    async create(deck: DecksRestApi) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const decksDtoRepository: Repository<DecksDto> = dataSource.getRepository(DecksDto);
            const cardsDtoRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
            const capacityDtoRepository: Repository<CapacityDto> = dataSource.getRepository(CapacityDto);
            const effectsDtoRepository: Repository<EffectsDto> = dataSource.getRepository(EffectsDto);
            const newDeck: DecksDto = decksDtoRepository.create({
                name: deck.name,
                description: deck.description,
                image: deck.image,
                rarity: deck.rarity,
                type: deck.type,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                count: deck.cards.length
            })
            const createdeck: DecksDto = await decksDtoRepository.save(newDeck);
            if (!createdeck) return Utils.formatResponse(500, 'Deck created Error', newDeck, null);
            for (let i = 0; i < deck.cards.length; i++) {
                let cardEffect = deck.cards[i].effects;
                let cardCapacity = deck.cards[i].capacities;
                const createCard: FormatRestApiModels = await this.cardService.create({
                    name: deck.cards[i].name,
                    description: deck.cards[i].description,
                    image: deck.cards[i].image,
                    rarity: deck.cards[i].rarity,
                    atk: deck.cards[i].atk,
                    def: deck.cards[i].def,
                    spd: deck.cards[i].spd,
                    luk: deck.cards[i].luk,
                    deckId: createdeck.id,
                    effects: cardEffect,
                    capacities: cardCapacity,
                })
                if (createCard.code !== 201) return Utils.formatResponse(createCard.code, 'Error Internal Server Create Card', null, createCard.error);
            }
            const deckCompleted = await decksDtoRepository.findOne({
                select: ['id', 'name', 'description', 'image', 'rarity', 'type', 'createdAt', 'updatedAt', 'count'],
                relations: [
                    'cards',
                    'cards.effects',
                    'cards.capacities',
                ],
                where: {id: newDeck.id},
            });
            return Utils.formatResponse(200, 'Deck created successfully', deckCompleted, null);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Error Internal Server', null, error.message);
        }
    }

    async getCapacityById(number: number) {
        try{
            const dataSource :DataSource = await this.dataSourceConfig;
            const decksRepository:Repository<DecksDto> = dataSource.getRepository(DecksDto);
            const decks = await decksRepository.findOne({
                select: ["id", "name", "description", "image", "rarity", "type", "createdAt", "updatedAt", "count"],
                relations: [
                    "cards",
                    "cards.effects", // Charger la relation "effects" de "cards"
                    "cards.capacities", // Charger la relation "capacities" de "cards"
                ],
                where: { id: number },
            });
            if (decks) {
                return Utils.formatResponse(200, 'Capacity Found', decks);
            }else{
                return Utils.formatResponse(404, 'Capacity Not Found', decks);
            }
        }catch(error:any){
            return Utils.formatResponse(500, 'Internal Server Error', error, error.message);
        }
    }
}
