import {DataSource, Repository} from "typeorm";
import {CellsDto} from "../../dto/cells.dto";
import {Utils} from "../../utils/utils";
import {FormatModel} from "../../models/format.model";

export class CellsServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createCells(mapId: number) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const cellsRepository: Repository<CellsDto> = dataSource.getRepository(CellsDto);
            let cellsGrid = Utils.createGrid()
            for (const row of cellsGrid) {
                for (const cell of row) {
                    const cellDto = new CellsDto();
                    cellDto.map = {id: mapId} as any;
                    cellDto.x = cell.x;
                    cellDto.y = cell.y;
                    cellDto.value = cell.value;
                    cellsRepository.create(cellDto);
                    await cellsRepository.save(cellDto);
                }
            }
            const foundCell = await cellsRepository.find(
                {
                    select: {
                        id: true,
                        x: true,
                        y: true,
                        value: true,
                    },
                    where: {
                        id: mapId,
                    }
                })
            return Utils.formatResponse(201,'Created Cells', foundCell);
        } catch (error: any) {
            return { error: error.message , code: 500 } as FormatModel;
        }
    }

}
