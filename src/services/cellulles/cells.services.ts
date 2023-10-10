import {DataSource, Repository} from "typeorm";
import {CellsDto} from "../../dto/cells.dto";
import {Utils} from "../../utils/utils";

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
            return await cellsRepository.find(
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
        } catch (error: any) {
            return error
        }
    }

}
