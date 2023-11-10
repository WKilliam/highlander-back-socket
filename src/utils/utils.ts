import {FormatRestApiModels} from "../models/formatRestApi.models";
import {Cells, GridLimit} from "../models/maps.models";
import {FormatSocketModels} from "../models/formatSocket.models";
import {EntityPlaying, EntityStatus} from "../models/room.content.models";
import {PlayerLobby} from "../models/player.models";
import {CardByEntityPlaying} from "../models/cards.models";

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

    static initTeamEntityPlaying(teamName: Array<string>) :Array<EntityPlaying> {
        let teamEntityPlaying: Array<EntityPlaying> = [];
        for (let i = 0; i < teamName.length; i++) {
            teamEntityPlaying.push({
                name: teamName[i],
                commonLife: 0,
                commonMaxLife: 0,
                commonAttack: 0,
                commonDefense: 0,
                commonLuck: 0,
                commonSpeed: 0,
                cellPosition: {
                    id: -1,
                    x: -1,
                    y: -1,
                    value: -1
                },
                entityStatus: EntityStatus.ALIVE,
                cardsPlayer: [
                    {
                        player: {
                            avatar: '',
                            pseudo: '',
                        },
                        atk: 0,
                        def: 0,
                        spd: 0,
                        luk: 0,
                        rarity: '',
                        status: EntityStatus.ALIVE,
                        imageSrc: '',
                        effects: [],
                        capacities: [],
                    },
                    {
                        player: {
                            avatar: '',
                            pseudo: '',
                        },
                        atk: 0,
                        def: 0,
                        spd: 0,
                        luk: 0,
                        rarity: '',
                        status: EntityStatus.ALIVE,
                        imageSrc: '',
                        effects: [],
                        capacities: [],
                    }
                ],
            });
        }
        return teamEntityPlaying;
    }

    static initTeamEntityPlayingWithCards(session: Array<EntityPlaying>, lobby: Array<PlayerLobby>, lobbyPosition: number, teamPosition: number, cardPosition: number) {
        const user = lobby[lobbyPosition];
        // Mettre à jour la position dans la session actuelle
        const cards = session[teamPosition]?.cardsPlayer as Array<CardByEntityPlaying>;
        if (cards && cards.length < 3 && cardPosition >= 0 && cardPosition < cards.length) {
            const card = cards[cardPosition];
            if (
                user.pseudo !== card?.player?.pseudo &&
                user.avatar !== card?.player?.avatar &&
                card?.player?.pseudo === '' &&
                card?.player?.avatar === ''
            ) {
                card.player = {
                    avatar: user.avatar,
                    pseudo: user.pseudo,
                };
                card.atk = 0;
                card.def = 0;
                card.spd = 0;
                card.luk = 0;
                card.rarity = 'common';
                card.status = EntityStatus.ALIVE;
                card.imageSrc = '';
                card.effects = [];
                card.capacities = [];

                // Vérifier si le joueur est dans une autre session et le supprimer le cas échéant
                for (let i = 0; i < session.length; i++) {
                    if (i !== teamPosition) {
                        const otherSession = session[i];
                        const userIndexInOtherSession = otherSession.cardsPlayer?.findIndex(card => card.player?.pseudo === user.pseudo);

                        if (userIndexInOtherSession !== undefined && userIndexInOtherSession !== -1) {
                            otherSession.cardsPlayer?.splice(userIndexInOtherSession, 1);
                        }
                    }
                }
            } else {
                return Utils.formatResponse(409, 'Place not available', null, 'Place not available');
            }
        } else {
            return Utils.formatResponse(204, 'Place available', null, 'Place available');
        }
        return Utils.formatResponse(200, 'Success', session, null);
    }

}
