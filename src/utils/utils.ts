import {CellsConceptionModel} from "../models/cells.models";

export class Utils{

    static createGrid(): CellsConceptionModel[][] {
        const mapWidth: number = 970
        const mapHeight: number = 512
        const cellWidth = 32;
        const cellHeight = 32;

        const numCols = Math.floor(mapWidth / cellWidth);
        const numRows = Math.floor(mapHeight / cellHeight);

        const gridCellData: CellsConceptionModel[][] = [];
        let cellId = 1; // Initialize the cell ID to 1

        for (let row = 0; row < numRows; row++) {
            const rowArray: CellsConceptionModel[] = [];

            for (let col = 0; col < numCols; col++) {
                const cell: CellsConceptionModel = {
                    x: col * cellWidth + 5,
                    y: row * cellHeight + 5,
                    value: 1,
                };
                rowArray.push(cell);
                cellId++;
            }

            gridCellData.push(rowArray);
        }
        return gridCellData;
    }

    static createGameKeySession(testingVersion:boolean): string {
        let characters:string;
        if (testingVersion){
            characters = 'AB';
        }else{
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        }
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
