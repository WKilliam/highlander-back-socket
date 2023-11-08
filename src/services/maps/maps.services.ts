import {DataSource, Repository} from "typeorm";
import {MapsDto} from "../../dto/maps.dto";
import {CellsServices} from "../cellulles/cells.services";
import {Utils} from "../../utils/utils";
import {Maps, MapsSimplify} from "../../models/maps.models";
import {FormatRestApiModels} from "../../models/formatRestApi.models";

export class MapsServices {
    dataSourceConfig: Promise<DataSource>;
    cellsServices: CellsServices;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.cellsServices = new CellsServices(dataSourceConfig);
    }

    async create(map: MapsSimplify) {
        try {
            const dataSource :DataSource = await this.dataSourceConfig;
            const mapsRepository:Repository<MapsDto> = dataSource.getRepository(MapsDto);
            const mapEntity = mapsRepository.create(map);
            const mapSaved = await mapsRepository.save(mapEntity);
            if (mapSaved) {
                const cellsByMap: FormatRestApiModels = await this.cellsServices.create(mapSaved);
                if (!(cellsByMap.code >= 200 && cellsByMap.code < 300)) {
                    return Utils.formatResponse(
                        cellsByMap.code, 'Cells Not Create', cellsByMap.data ,cellsByMap.error);
                }else{
                    return Utils.formatResponse(201, 'Map Created', mapSaved);
                }
            }else{
                return Utils.formatResponse(400, 'Map Not Created', mapSaved);
            }
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', error.data);
        }
    }

    async getMapsById(id: number) {
        try {
            const dataSource :DataSource = await this.dataSourceConfig;
            const mapsRepository:Repository<MapsDto> = dataSource.getRepository(MapsDto);
            const map= await mapsRepository.findOne({
                relations: ['cells'],
                where: {id: id}
            });
            if(map){
                return Utils.formatResponse(200, 'Map Found', map);
            }else{
                return Utils.formatResponse(404, 'Map Not Found', map);
            }
        }catch (error:any){
            return Utils.formatResponse(500, 'Internal Server Error', error.data);
        }
    }
}
