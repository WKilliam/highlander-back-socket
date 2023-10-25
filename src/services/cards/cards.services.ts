import {DataSource, In, Repository} from "typeorm";
import {CardsModelsRequest} from "../../models/cards.models";
import {CardsDto} from "../../dto/cards.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {FormatModel} from "../../models/format.model";
import {Utils} from "../../utils/utils";

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
                    createdAt: new Date().toLocaleDateString(),
                    atk: card.atk,
                    def: card.def,
                    spd: card.spd,
                    luk: card.luk,
                    effects: effects
                }
            );
            const creating =  await cardRepository.save(newCard);
            return Utils.formatResponse(201,'Created', creating);
        } catch (error: any) {
            return { error: error.message , code: 500 } as FormatModel;
        }
    }

    async getAllCards() {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const cardRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
            const cards = await cardRepository.find({
                select: ["id", "name", "description", "image", "rarity", "atk", "def", "spd", "luk"],
            });
            return Utils.formatResponse(200,'All cards', cards );
        } catch (error: any) {
            return { error: error.message , code: 500 } as FormatModel;
        }
    }


    async patchCard(card: CardsModelsRequest) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const cardRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
            const effectsRepository: Repository<EffectsDto> = dataSource.getRepository(EffectsDto);

            const effects = await effectsRepository.find({where: {id: In(card.effects)}});
            let CardPatch = cardRepository.update({id:card.id},{
                name: card.name,
                description: card.description,
                image: card.image,
                rarity: card.rarity,
                atk: card.atk,
                def: card.def,
                spd: card.spd,
                luk: card.luk,
                effects: effects
            })
            return Utils.formatResponse(200,'Updated card', CardPatch);
        }catch (error:any){
            return { error: error.message , code: 500 } as FormatModel;
        }
    }



}
