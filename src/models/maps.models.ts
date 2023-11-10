import exp from "constants";

export interface Maps {
    id?: number;
    backgroundImg: string;
    cellsGrid: Array<Cells>;
    height: number;
    width: number;
    name: string;
}

export interface MapsSimplify {
    id?:number,
    backgroundImage: string;
    height: number;
    width: number;
    name: string;
}

export interface Cells {
    id?: number;
    x: number;
    y: number;
    value: number;
}

export interface CellsGrid {
    cellsGrid: Cells[][]
}


export interface GridLimit {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
}
