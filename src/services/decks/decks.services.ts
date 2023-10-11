import {DataSource, In, Repository} from "typeorm";
import {DecksModelsRequest} from "../../models/decks.models";
import {DecksDto} from "../../dto/decks.dto";
import {CardsDto} from "../../dto/cards.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {Utils} from "../../utils/utils";
import {FormatModel} from "../../models/format.model";

export class DecksServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createDeck(decks: DecksModelsRequest) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const decksRepository: Repository<DecksDto> = dataSource.getRepository(DecksDto);
            const cardRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
            const cards = await cardRepository.find({where: {id: In(decks.cards)}});
            const newDeck = decksRepository.create({
                name: decks.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                description: decks.description,
                image: decks.image,
                type: decks.type,
                rarity: decks.rarity,
                count: decks.count,
                cards: cards,
            });
            const deckCreated = await decksRepository.save(newDeck);
            return Utils.formatResponse(201,'Created Effects', deckCreated);
        } catch (error: any) {
            return { error: error.message , code: 500 } as FormatModel;
        }
    }

}
