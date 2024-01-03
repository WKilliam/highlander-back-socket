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
import {FormatRestApi, FormatRestApiModels} from "../../models/formatRestApi";

export class DecksServices {
    dataSourceConfig: Promise<DataSource>;
    cardService: CardsServices;
    private failledInternalServer:string = 'Internal Server Error';
    private successDeckCreated:string = 'Deck Created';
    private successDeckFound:string = 'Deck Found';
    private failledDeckCreatedError:string = 'Deck Created Error';
    private successDeckNotFound: string = 'Deck Not Found';

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
            if (!createdeck) return FormatRestApiModels.createFormatRestApi(500, this.failledDeckCreatedError, newDeck, null);
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
            return FormatRestApiModels.createFormatRestApi(200, this.successDeckCreated, deckCompleted, null);
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer, error, error.message);
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
                return FormatRestApiModels.createFormatRestApi(200, this.successDeckFound, decks,'');
            } else {
                return FormatRestApiModels.createFormatRestApi(404, this.successDeckNotFound, decks,'');
            }
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer, error, error.message);
        }
    }
}
