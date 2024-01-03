import {DataSource, Repository} from "typeorm";
import {MapsDto} from "../../dto/maps.dto";
import {CellsServices} from "../cellulles/cells.services";
import {Utils} from "../../utils/utils";
import {Maps, MapsSimplify} from "../../models/maps.models";
import {FormatRestApi, FormatRestApiModels} from "../../models/formatRestApi";

export class MapsServices {
    dataSourceConfig: Promise<DataSource>;
    cellsServices: CellsServices;
    private successmapCreated:string = 'Map Created';
    private successcellCreated:string = 'Cells Created';
    private successMapFound:string = 'Map Found';
    private failledMapCreated:string = 'Map Not Created';
    private failledMapNotFound:string = 'Map Not Found';
    private failledInternalServer:string = 'Internal Server Error';

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
                const cellsByMap: FormatRestApi = await this.cellsServices.create(mapSaved);
                if (Utils.codeErrorChecking(cellsByMap.code)) {
                    return FormatRestApiModels.createFormatRestApi(cellsByMap.code, this.successcellCreated, cellsByMap.data, cellsByMap.error);
                }else{
                    return FormatRestApiModels.createFormatRestApi(201, this.successmapCreated, mapSaved,'');
                }
            }else{
                return FormatRestApiModels.createFormatRestApi(400, this.failledMapCreated, mapSaved,`${this.failledMapCreated} inside create map`);
            }
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer,null, error.data);
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
                return FormatRestApiModels.createFormatRestApi(200, this.successMapFound, map,'');
            }else{
                return FormatRestApiModels.createFormatRestApi(404, this.failledMapNotFound, map,'');
            }
        }catch (error:any){
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer,null, error.data);
        }
    }

    async getAllMaps() {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const mapsRepository: Repository<MapsDto> = dataSource.getRepository(MapsDto);
            const maps = await mapsRepository.find({
                relations: ['cells'],
            });
            if (maps) {
                let  mapsSimplify= maps.map((map: MapsDto) => {
                    return {
                        id: map.id,
                        backgroundImage: map.backgroundImage,
                        height: map.height,
                        width: map.width,
                        name: map.name,
                        cellsGrid : map.cells.map((cell) => {
                            return {
                                id: cell.id,
                                x: cell.x,
                                y: cell.y,
                                value: cell.value,
                            }
                        })
                    }
                })
                return FormatRestApiModels.createFormatRestApi(200, this.successMapFound, mapsSimplify,'');
            } else {
                return FormatRestApiModels.createFormatRestApi(404, this.failledMapNotFound, maps,'');
            }
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(500, this.failledInternalServer,null, error.data);
        }
    }
}
