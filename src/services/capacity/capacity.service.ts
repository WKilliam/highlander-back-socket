import {DataSource, In, Repository} from "typeorm";
import {CapacityRestApi} from "../../models/cards.models";
import {CapacityDto} from "../../dto/capacity.dto";
import {Utils} from "../../utils/utils";
import {FormatRestApiModels} from "../../models/formatRestApi";

export class CapacityService {
    dataSourceConfig: Promise<DataSource>;
    private successCapacityCreated:string = 'Capacity Created';
    private successCapacityFound:string = 'Capacity Found';
    private failledCapacityNotFound: string = 'Capacity Not Found';
    private failledCapacityNotCreated: string = 'Capacity Not Created';




    private failledInternalServer:string = 'Internal Server Error';

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async create(capacity: CapacityRestApi) {
        try {
            const dataSource :DataSource = await this.dataSourceConfig;
            const effectsRepository:Repository<CapacityDto> = dataSource.getRepository(CapacityDto);
            const capacityEntity = effectsRepository.create(capacity);
            const capacitySaved = await effectsRepository.save(capacityEntity);
            if (capacitySaved) {
                return FormatRestApiModels.createFormatRestApi(201, this.successCapacityCreated, capacitySaved,'');
            }else{
                return FormatRestApiModels.createFormatRestApi(400, this.failledCapacityNotCreated, capacitySaved,'');
            }
        }catch (error:any){
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer, error, error.message);
        }
    }

    async getCapacityById(number: number) {
        try{
            const dataSource :DataSource = await this.dataSourceConfig;
            const effectsRepository:Repository<CapacityDto> = dataSource.getRepository(CapacityDto);
            const capacity = await effectsRepository.findOne({
                relations: ['cards'],
                where: {id: number}
            });
            if (capacity) {
                return FormatRestApiModels.createFormatRestApi(200, this.successCapacityFound, capacity,'');
            }else{
                return FormatRestApiModels.createFormatRestApi(404, this.failledCapacityNotFound, capacity,'');
            }
        }catch(error:any){
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer, error, error.message);
        }
    }
}
