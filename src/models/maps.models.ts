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

export class  MapsModels {
    static initMaps() : Maps {
        return {
            id: 0,
            backgroundImg: '',
            cellsGrid: [],
            height: 0,
            width: 0,
            name: ''
        }
    }

    static initCells() : Cells{
        return {
            id: 0,
            x: 0,
            y: 0,
            value: 0
        }
    }

    static initCellsGrid() : CellsGrid {
        return {
            cellsGrid: []
        }
    }

    static initGridLimit(): GridLimit{
        return {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0
        }
    }

    static initMapsSimplify(): MapsSimplify{
        return {
            id: 0,
            backgroundImage: '',
            height: 0,
            width: 0,
            name: ''
        }
    }
}
