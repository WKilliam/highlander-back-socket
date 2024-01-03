import {DataSource, Repository} from "typeorm";
import {EffectsDto} from "../../dto/effects.dto";
import {Utils} from "../../utils/utils";
import {Effects} from "../../models/cards.models";
import {FormatRestApiModels} from "../../models/formatRestApi";

export class EffectsServices {
    dataSourceConfig: Promise<DataSource>;
    private successEffectsCreated:string = 'Effects Created';
    private failledEffectsCreated:string = 'Effects Not Created';
    private failledEffectsNotFound:string = 'Effects Not Found';
    private failledInternalServer:string = 'Internal Server Error';
    private successEffectsFound:string = 'Effects Found';

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
                return FormatRestApiModels.createFormatRestApi(201, this.successEffectsCreated, effectsSaved,'');
            }else{
                return FormatRestApiModels.createFormatRestApi(400, this.failledEffectsCreated, effectsSaved,'');
            }
        }catch (error:any){
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer, error, error.message);
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
                return FormatRestApiModels.createFormatRestApi(200, this.successEffectsFound, effects,'');
            }else{
                return FormatRestApiModels.createFormatRestApi(404, this.failledEffectsNotFound, effects,'');
            }
        }catch(error:any){
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer, error, error.message);
        }
    }
}
