import {Column} from "typeorm";
import {CellsDto} from "../dto/cells.dto";

export interface GenericMapModel{

    backgroundImage: Buffer

    width: number;

    height: number;

    cells: Array<CellsDto>;
}
