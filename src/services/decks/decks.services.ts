import {DataSource, DeepPartial, In, Repository} from "typeorm";
import {DecksDto} from "../../dto/decks.dto";
import {CardsDto} from "../../dto/cards.dto";
import {Utils} from "../../utils/utils";
import {Decks, DecksRestApi} from "../../models/decks.models";
import {CellsDto} from "../../dto/cells.dto";
import {CapacityDto} from "../../dto/capacity.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {CardsServices} from "../cards/cards.services";
import {CardCreateArg, CardsRestApi} from "../../models/cards.models";
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
            let cardCreate: CardCreateArg = {
                deck: createdeck.id,
                cards: deck.cards
            }
            const cards = await this.cardService.create(cardCreate);
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

    async getDeckById(number: number) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const decksRepository: Repository<DecksDto> = dataSource.getRepository(DecksDto);
            const decks = await decksRepository.findOne({
                select: ["id", "name", "description", "image", "rarity", "type", "createdAt", "updatedAt", "count"],
                relations: [
                    "cards",
                    "cards.effects", // Charger la relation "effects" de "cards"
                    "cards.capacities", // Charger la relation "capacities" de "cards"
                ],
                where: {id: number},
            });
            if (decks) {
                return Utils.formatResponse(200, 'Deck Found', decks);
            } else {
                return Utils.formatResponse(404, 'Deck Not Found', decks);
            }
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', error, error.message);
        }
    }
}
