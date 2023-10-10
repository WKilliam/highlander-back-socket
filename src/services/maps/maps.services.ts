import {DataSource, Repository} from "typeorm";
import {MapsDto} from "../../dto/maps.dto";
import {GenericMapModel} from "../../models/generic.map.model";
import {CellsDto} from "../../dto/cells.dto";

export class MapsServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async getMapById(id: number) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const mapRepository: Repository<MapsDto> = dataSource.getRepository(MapsDto);
            const cellsRepository: Repository<CellsDto> = dataSource.getRepository(CellsDto);
            let map: GenericMapModel;
            let data: MapsDto | null = await mapRepository.findOne({
                select: {
                    id: true,
                    backgroundImage: true,
                    width: true,
                    height: true,
                },
                where: {
                    id: id
                }
            })
            if(data) {
                let cells: Array<CellsDto> = await cellsRepository.find({
                    select: {
                        id: true,
                        x: true,
                        y: true,
                        value: true,
                    },
                    where: {
                        id: data?.id
                    }
                })
                map = {
                    backgroundImage: data.backgroundImage,
                    width: data.width,
                    height: data.height,
                    cells: cells
                }
                return map;
            }else{
                throw new Error('Map not found')
            }
        } catch (error: any) {
            throw new Error(error)
        }
    }
}
