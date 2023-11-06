import {DataSource, In, Repository} from "typeorm";
import {CapacityRestApi} from "../../models/cards.models";
import {CapacityDto} from "../../dto/capacity.dto";
import {Utils} from "../../utils/utils";

export class CapacityService {
    dataSourceConfig: Promise<DataSource>;

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
                return Utils.formatResponse(201, 'Capacity Created', capacitySaved);
            }else{
                return Utils.formatResponse(400, 'Capacity Not Created', capacitySaved);
            }
        }catch (error:any){
            return Utils.formatResponse(500, 'Internal Server Error', error, error.message);
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
                return Utils.formatResponse(200, 'Capacity Found', capacity);
            }else{
                return Utils.formatResponse(404, 'Capacity Not Found', capacity);
            }
        }catch(error:any){
            return Utils.formatResponse(500, 'Internal Server Error', error, error.message);
        }
    }
}
