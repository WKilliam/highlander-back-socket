
import {FormatRestApiModels} from "../models/formatRestApi.models";
import {Cells, GridLimit, Maps} from "../models/maps.models";
import {FormatSocketModels} from "../models/formatSocket.models";
import {
    EntityPlaying,
    EntityStatus,
    Game,
    SessionGame,
    SessionStatusGame,
    StatusGame
} from "../models/room.content.models";
import {CardByEntityPlaying} from "../models/cards.models";
import {PlayerCards} from "../models/player.models";
import {MapsDto} from "../dto/maps.dto";
import {ClientDto} from "../dto/clients.dto";

export class Utils {

    static createGrid(mapWidth: number, mapHeight: number): Cells[][] {
        const cellWidth = 32;
        const cellHeight = 32;
        const numCols = Math.floor(mapWidth / cellWidth);
        const numRows = Math.floor(mapHeight / cellHeight);
        const gridCellData: Cells[][] = [];
        let cellId = 1;
        for (let row = 0; row < numRows; row++) {
            const rowArray: Cells[] = [];

            for (let col = 0; col < numCols; col++) {
                const cell: Cells = {
                    x: col * cellWidth,
                    y: row * cellHeight,
                    value: 1,
                };
                rowArray.push(cell);
                cellId++;
            }

            gridCellData.push(rowArray);
        }
        return gridCellData;
    }

    // convert list of cells to matrix
    convertListCellsToMaatix(listeCellules: Cells[]): Cells[][] {
        const mapWidth: number = 936;
        const mapHeight: number = 620;
        const cellWidth = 32;
        const cellHeight = 32;
        const numCols = Math.floor(mapWidth / cellWidth);
        const numRows = Math.floor(mapHeight / cellHeight);
        let gridCellData: Cells[][] = [];
        let cellId = 1;

        for (let row = 0; row < numRows; row++) {
            const rowArray: Cells[] = [];
            for (let col = 0; col < numCols; col++) {
                const existingCell = listeCellules.find(cell => cell.id === cellId);
                const cell: Cells = existingCell || {
                    id: cellId,
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

    // get limit of grid
    getGridIndices(cells: Cells[]): GridLimit {
        let gridCellData: Cells[][] = this.convertListCellsToMaatix(cells)
        const numRows = gridCellData.length;
        const numCols = gridCellData[0].length;
        const minX = 0;
        const maxX = numCols - 1;
        const minY = 0;
        const maxY = numRows - 1;
        console.log(`Limites de la matrice : minRow=${minX}, maxRow=${maxX}, minCol=${minY}, maxCol=${maxY}`);
        return {minX, maxX, minY, maxY};
    }


    // give posibility to move player
    findCellsAtDistance(gridCellData: Cells[][], startId: number, distance: number): Cells[] {
        const result: Cells[] = [];
        let startX: number | null = null;
        let startY: number | null = null;
        gridCellData.forEach((rowArray, rowIndex) => {
            rowArray.forEach((cell, colIndex) => {
                if (cell.id === startId) {
                    startX = rowIndex;
                    startY = colIndex;
                }
            });
        });

        if (startX === null || startY === null) {
            console.error(`Cellule de départ avec l'ID ${startId} non trouvée.`);
            return result;
        }
        const {minX, maxX, minY, maxY} = this.getGridIndices(result);
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const dx = Math.abs(x - startY);
                const dy = Math.abs(y - startX);
                const manhattanDistance = dx + dy;
                if (manhattanDistance === distance) {
                    result.push(gridCellData[y][x]);
                }
            }
        }
        console.log(`Cellules à une distance de ${distance} de la cellule de départ (ID: ${startId}) :`, result);
        return result;
    }


    static formatResponse(code: number, message?: string, data?: any, error?: any): FormatRestApiModels {
        let messageFormat: FormatRestApiModels;
        if (error) {
            messageFormat = {
                date: new Date().toISOString(),
                error: error,
                code: code,
                message: null
            }
            return messageFormat;
        } else {
            messageFormat = {
                date: new Date().toISOString(),
                data: data,
                code: code,
                message: message || null
            }
            return messageFormat;
        }
    }

    static formatSocketMessage(
        room: string,
        data: any,
        message: string,
        code: number,
        error: any
    ) {
        let formatSocket: FormatSocketModels = {
            date: new Date().toISOString(),
            room: room,
            data: data,
            message: message,
            code: code,
            error: error
        }
        return formatSocket
    }


    static initSessionGame(roomjoin: string, teamNames: Array<string>,mapsData:MapsDto) {
        let sessionStatusGame: SessionStatusGame = {
            room: roomjoin,
            status: StatusGame.LOBBY,
            turnCount: 0,
            lobby: [],
            entityTurn: [],
            teamNames: teamNames
        }
        let tab = this.initTeamEntity()
        let game: Game = {
            teams: tab.player,
            monsters: tab.monster
        }
        let cellgrid : Cells[] = mapsData.cells.map((cell) => {
            return {
                id: cell.id,
                x: cell.x,
                y: cell.y,
                value: cell.value,
            }
        })
        let maps: Maps = {
            backgroundImg: mapsData.backgroundImage,
            width: mapsData.width,
            height: mapsData.height,
            name: mapsData.name,
            cellsGrid: cellgrid
        }
        let sessionGame: SessionGame = {
            sessionStatusGame: sessionStatusGame,
            game: game,
            maps: maps
        }
        return sessionGame
    }

    static initTeamEntity() {
        let player: PlayerCards = {
            avatar: '',
            pseudo: '',
        }
        let cardsPlayer: CardByEntityPlaying = {
            id: -1,
            atk: 0,
            def: 0,
            spd: 0,
            luk: 0,
            rarity: 'commun',
            imageSrc: '',
            effects: [],
            attacks: [],
            player: player
        }
        let cardsMonster: CardByEntityPlaying = {
            id: -1,
            atk: -1,
            def: 1,
            spd: -1,
            luk: -1,
            rarity: 'commun',
            imageSrc: '',
            effects: [],
            attacks: []
        }
        let cells: Cells = {
            id: -1,
            x: -1,
            y: -1,
            value: -1
        }
        let arrayPlayer: Array<CardByEntityPlaying> = []
        let arrayMonster: Array<CardByEntityPlaying> = []
        arrayPlayer.push(cardsPlayer)
        arrayPlayer.push(cardsPlayer)
        arrayMonster.push(cardsMonster)
        arrayMonster.push(cardsMonster)
        let cardByEntityPlayingPlayer = {
            name: '',
            commonLife: -1,
            commonMaxLife: -1,
            commonAttack: -1,
            commonDefense: -1,
            commonLuck: -1,
            commonSpeed: -1,
            cellPosition: cells,
            entityStatus: EntityStatus.ALIVE,
            cardsPlayer: arrayPlayer,
        }
        let teamEntityMonster = {
            name: '',
            commonLife: -1,
            commonMaxLife: -1,
            commonAttack: -1,
            commonDefense: -1,
            commonLuck: -1,
            commonSpeed: -1,
            cellPosition: cells,
            entityStatus: EntityStatus.ALIVE,
            cardsPlayer: arrayMonster,
        }
        let arrayTeamEntityMonster: Array<EntityPlaying> = []
        let arrayTeamEntityPlayer: Array<EntityPlaying> = []
        arrayTeamEntityPlayer.push(cardByEntityPlayingPlayer)
        arrayTeamEntityPlayer.push(cardByEntityPlayingPlayer)
        arrayTeamEntityPlayer.push(cardByEntityPlayingPlayer)
        arrayTeamEntityPlayer.push(cardByEntityPlayingPlayer)
        arrayTeamEntityMonster.push(teamEntityMonster)
        arrayTeamEntityMonster.push(teamEntityMonster)
        return {player: arrayTeamEntityPlayer, monster: arrayTeamEntityMonster}
    }
}
