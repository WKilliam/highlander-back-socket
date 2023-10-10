import {CellsConceptionModel} from "./cells.models";

export interface MapModels {
    backgroundImg: string;
    width: number;
    height: number;
    name: string;
    cellsGrid: CellsConceptionModel[]
}

export interface MapModelsRequest {
    backgroundImage: string;
    width: number;
    height: number;
    name: string;
}


