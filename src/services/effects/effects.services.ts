import {DataSource, Repository} from "typeorm";
import {EffectsDto} from "../../dto/effects.dto";
import {Utils} from "../../utils/utils";
import {Effects} from "../../models/cards.models";

export class EffectsServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async create(effects: Effects) {
        try {
            const dataSource :DataSource = await this.dataSourceConfig;
            const effectsRepository:Repository<EffectsDto> = dataSource.getRepository(EffectsDto);
            const effectsEntity = effectsRepository.create(effects);
            const effectsSaved = await effectsRepository.save(effectsEntity);
            if (effectsSaved) {
                return Utils.formatResponse(201, 'Effects Created', effectsSaved);
            }else{
                return Utils.formatResponse(400, 'Effects Not Created', effectsSaved);
            }
        }catch (error:any){
            return Utils.formatResponse(500, 'Internal Server Error', error, error.message);
        }
    }

    async getEffectsById(number: number) {
        try{
            const dataSource :DataSource = await this.dataSourceConfig;
            const effectsRepository:Repository<EffectsDto> = dataSource.getRepository(EffectsDto);
            const effects = await effectsRepository.findOne({
                relations: ['cards'],
                where: {id: number}
            });
            if (effects) {
                return Utils.formatResponse(200, 'Effects Found', effects);
            }else{
                return Utils.formatResponse(404, 'Effects Not Found', effects);
            }
        }catch(error:any){
            return Utils.formatResponse(500, 'Internal Server Error', error, error.message);
        }
    }
}
