import {DataSource, Repository} from "typeorm";
import {CellsDto} from "../../dto/cells.dto";
import {Utils} from "../../utils/utils";
import {MapsDto} from "../../dto/maps.dto";
import {Cells} from "../../models/maps.models";
import {FormatRestApiModels} from "../../models/formatRestApi";

export class CellsServices {
    dataSourceConfig: Promise<DataSource>;
    private successcellCreated:string = 'Cells Created';

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async create(mapSaved: MapsDto) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const cellsRepository: Repository<CellsDto> = dataSource.getRepository(CellsDto);
            let fixedCellGrid:Cells[][] = Utils.createGrid(mapSaved.width, mapSaved.height);
            for (let i = 0; i < fixedCellGrid.length; i++) {
                const row = fixedCellGrid[i];
                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    // Create the cell entity
                    const newCell = new CellsDto();
                    newCell.x = cell.x;
                    newCell.y = cell.y;
                    newCell.value = cell.value;
                    newCell.map = mapSaved;
                    // Save the cell entity
                    await cellsRepository.save(newCell);
                }
            }
            return FormatRestApiModels.createFormatRestApi(201, this.successcellCreated, fixedCellGrid,'');
        } catch (error: any) {
            return FormatRestApiModels.createFormatRestApi(error.code, error.message, error.data,'');
        }
    }
}
