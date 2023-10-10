import {DataSource, In, Repository} from "typeorm";
import {CardsModelsRequest} from "../../models/cards.models";
import {CardsDto} from "../../dto/cards.dto";
import {EffectsDto} from "../../dto/effects.dto";

export class CardsServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createCard(card: CardsModelsRequest) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const cardRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
            const effectsRepository: Repository<EffectsDto> = dataSource.getRepository(EffectsDto);
            const effects = await effectsRepository.find({where: {id: In(card.effects)}});
            const newCard = cardRepository.create(
                {
                    name: card.name,
                    description: card.description,
                    image: card.image,
                    rarity: card.rarity,
                    atk: card.atk,
                    def: card.def,
                    vit: card.vit,
                    luk: card.luk,
                    effects: effects
                }
            );
            return await cardRepository.save(newCard);
        } catch (error: any) {
            return error
        }
    }

}
