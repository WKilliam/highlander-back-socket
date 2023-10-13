import {DataSource, Repository} from "typeorm";
import {MapsDto} from "../../dto/maps.dto";
import {CellsDto} from "../../dto/cells.dto";
import {MapModels, MapModelsRequest} from "../../models/map.models";
import {CellsServices} from "../cellulles/cells.services";
import {Utils} from "../../utils/utils";
import {FormatModel} from "../../models/format.model";

export class MapsServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createMap(mapRequest: MapModelsRequest) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const mapRepository: Repository<MapsDto> = dataSource.getRepository(MapsDto);

            const creating = mapRepository.create({
                backgroundImage: mapRequest.backgroundImage,
                width: mapRequest.width,
                height: mapRequest.height,
                name: mapRequest.name
            })
            let mapInit = await mapRepository.save(creating)
            await new CellsServices(this.dataSourceConfig).createCells(mapInit.id,mapInit.width,mapInit.height)
            return Utils.formatResponse(201,'Created', mapInit);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    async getMapCompleted(mapId: number) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const mapRepository: Repository<MapsDto> = dataSource.getRepository(MapsDto);
            const map = await mapRepository.findOneOrFail({
                where: { id: mapId },
                relations: ['cells'],
                select: ["id", "backgroundImage", "width", "height", "name"],
            });

            // Récupérez les cellules de la carte en excluant la référence à `map`
            const cells = map.cells.map(cell => ({
                id: cell.id,
                x: cell.x,
                y: cell.y,
                value: cell.value,
            }));

            // Créez l'objet MapModels
            const mapModel: MapModels = {
                backgroundImg: map.backgroundImage,
                width: map.width,
                height: map.height,
                name: map.name,
                cellsGrid: cells,
            };

            return Utils.formatResponse(
                201,
                'Created Map',
                mapModel);
        } catch (error: any) {
            return { error: error.message , code: 500 } as FormatModel;
        }
    }

    async getMapInfo() {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const mapRepository: Repository<MapsDto> = dataSource.getRepository(MapsDto);
            const map = await mapRepository.find({
                select: ["id", "backgroundImage", "name"],
            })
            return Utils.formatResponse(200,'Data found', map);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }
}
