import {SessionsServices} from "../sessions/sessions.services";
import {AppDataSource} from "../../utils/database/database.config";
import {SocketJoinSession, SocketJoinTeamCard, SocketSelectPlaceTeam} from "../../models/sockets.models";
import {JsonconceptorService} from "../jsonconceptor/jsonconceptor.service";
import {Utils} from "../../utils/utils";
import {Cellsmodel} from "../../models/cells.models";
import {JsonServices} from "../jsonconceptor/json.services";
import {FormatModel, SocketFormatModel} from "../../models/format.model";
import {PartiesFullBodyModels} from "../../models/parties.models";

export class SocketService {

    // convert list of cells to matrix
    convertListCellsToMaatix(listeCellules: Cellsmodel[]): Cellsmodel[][] {
        const mapWidth: number = 936;
        const mapHeight: number = 620;
        const cellWidth = 32;
        const cellHeight = 32;
        const numCols = Math.floor(mapWidth / cellWidth);
        const numRows = Math.floor(mapHeight / cellHeight);
        let gridCellData: Cellsmodel[][] = [];
        let cellId = 1;

        for (let row = 0; row < numRows; row++) {
            const rowArray: Cellsmodel[] = [];
            for (let col = 0; col < numCols; col++) {
                const existingCell = listeCellules.find(cell => cell.id === cellId);
                const cell: Cellsmodel = existingCell || {
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
    getGridIndices(cells: Cellsmodel[]): { minX: number, maxX: number, minY: number, maxY: number } {
        let gridCellData: Cellsmodel[][] = this.convertListCellsToMaatix(cells)
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
    findCellsAtDistance(gridCellData: Cellsmodel[][], startId: number, distance: number): Cellsmodel[] {
        const result: Cellsmodel[] = [];
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


    selectPlaceTeam(socketSelectPlaceTeam: SocketSelectPlaceTeam) {
        let render: boolean = true
        let formatModel: FormatModel;
        let formatSocket: SocketFormatModel
        // check if player is already in team
        const checkIfPlayerIfInsideAnotherTeam = JsonServices.checkIfPlayerIfInsideAnotherTeam(
            socketSelectPlaceTeam.room,
            socketSelectPlaceTeam.avatar,
            socketSelectPlaceTeam.pseudo)
        if (!(checkIfPlayerIfInsideAnotherTeam.code >= 200 && checkIfPlayerIfInsideAnotherTeam.code <= 299)) {
            // player is in team
            // check if place is free
            let securityCheckPlayer = JsonServices.securityCheckPlayer(socketSelectPlaceTeam.room, socketSelectPlaceTeam.teamTag, socketSelectPlaceTeam.position)
            if (!(securityCheckPlayer.code >= 200 && securityCheckPlayer.code <= 299)) {
                // place is not free
                formatModel = Utils.formatResponse(securityCheckPlayer.code, `${securityCheckPlayer.message} - Position selected is not empty`, securityCheckPlayer.data, securityCheckPlayer.error)
                formatSocket = Utils.formatSocketMessage(
                    `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                    formatModel.data,
                    `${formatModel.error}`,
                    formatModel.code,
                    formatModel.error
                )
                render = false
            } else {
                // place is free now we can move player
                let moveplayer = JsonServices.setPlayer(
                    socketSelectPlaceTeam.room,
                    socketSelectPlaceTeam.avatar,
                    socketSelectPlaceTeam.pseudo,
                    socketSelectPlaceTeam.teamTag,
                    socketSelectPlaceTeam.position
                )
                // if moveplayer Failed
                if (!(moveplayer.code >= 200 && moveplayer.code <= 299)) {
                    formatModel = Utils.formatResponse(moveplayer.code, `${securityCheckPlayer.message} - ${moveplayer.message} - Move Failled`, null, moveplayer.error)
                    formatSocket = Utils.formatSocketMessage(
                        `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                        formatModel.data,
                        `${formatModel.error}`,
                        formatModel.code,
                        formatModel.error
                    )
                    render = false
                } else {
                    // if moveplayer success
                    // delete player from old position
                    let deletePlayerPosition = JsonServices.restPlayerAfterMove(socketSelectPlaceTeam.room, socketSelectPlaceTeam.teamTag, socketSelectPlaceTeam.position)
                    if (!(deletePlayerPosition.code >= 200 && deletePlayerPosition.code <= 299)) {
                        // if deletePlayerPosition Failed
                        formatModel = Utils.formatResponse(deletePlayerPosition.code, `${securityCheckPlayer.message} - ${moveplayer.message} - Delete Before Move Failled`, null, moveplayer.error)
                        formatSocket = Utils.formatSocketMessage(
                            `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                            formatModel.data,
                            `${formatModel.error}`,
                            formatModel.code,
                            formatModel.error
                        )
                        render = false
                    } else {
                        // if deletePlayerPosition success
                        formatModel = Utils.formatResponse(
                            moveplayer.code,
                            `${securityCheckPlayer.message} - ${moveplayer.message} - Move Success`,
                            moveplayer.data,
                            moveplayer.error
                        )
                        formatSocket = Utils.formatSocketMessage(
                            `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                            formatModel.data,
                            `${formatModel.error}`,
                            formatModel.code,
                            formatModel.error
                        )
                        render = true
                    }
                }
            }
        } else {
            // place is free now we can move player
            let moveplayer = JsonServices.setPlayer(
                socketSelectPlaceTeam.room,
                socketSelectPlaceTeam.avatar,
                socketSelectPlaceTeam.pseudo,
                socketSelectPlaceTeam.teamTag,
                socketSelectPlaceTeam.position
            )
            // if moveplayer Failed
            if (!(moveplayer.code >= 200 && moveplayer.code <= 299)) {
                formatModel = Utils.formatResponse(moveplayer.code, `${moveplayer.message} - Move Failled`, null, moveplayer.error)
                formatSocket = Utils.formatSocketMessage(
                    `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                    formatModel.data,
                    `${formatModel.error}`,
                    formatModel.code,
                    formatModel.error
                )
                render = false
            } else {
                // if moveplayer success
                formatModel = Utils.formatResponse(
                    moveplayer.code,
                    `${moveplayer.message} - Move Success`,
                    moveplayer.data,
                    moveplayer.error
                )
                formatSocket = Utils.formatSocketMessage(
                    `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                    formatModel.data,
                    `${formatModel.error}`,
                    formatModel.code,
                    formatModel.error
                )
                render = true
            }
        }

        let partie: FormatModel = Utils.partiesDataSocket(`${socketSelectPlaceTeam.room}`)
        // if readJsonFile Failed
        if (!(partie.code >= 200 && partie.code <= 299)) {
            // if readJsonFile Failed
            formatModel = Utils.formatResponse(partie.code, `${partie.message} - Move Failled`, null, partie.error)
            formatSocket = Utils.formatSocketMessage(
                `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                formatModel.data,
                `${formatModel.error}`,
                formatModel.code,
                formatModel.error
            )
            render = false
        } else {
            // if readJsonFile success
            formatModel = Utils.formatResponse(partie.code, `${partie.message} - Move Success`, partie.data, partie.error)
            formatSocket = Utils.formatSocketMessage(
                `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                formatModel.data,
                `${formatModel.error}`,
                formatModel.code,
                formatModel.error
            )
        }

        if (render) {
             return Utils.formatSocketMessage(
                 `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                 formatSocket.data,
                 `${formatSocket.error}`,
                 200,
                 formatSocket.error
             )
        }else{
            return Utils.formatSocketMessage(
                `${socketSelectPlaceTeam}-${socketSelectPlaceTeam.room}`,
                formatSocket.data,
                `${formatSocket.error}`,
                500,
                formatSocket.error
            )
        }
    }
}
