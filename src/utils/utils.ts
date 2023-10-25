import {CellsConceptionModel, Cellsmodel} from "../models/cells.models";
import {FormatModel} from "../models/format.model";
import {PlayersGameModels, PlayersLobbyModels} from "../models/players.models";
import {TypeEvent} from "./enum/enum";
import {EventsCellModels} from "../models/events.models";
import {GameModels, PartiesModelsJson} from "../models/parties.models";
import {MapModels} from "../models/map.models";
import {SessionModel, StatusAccess, StatusGame} from "../models/sessions.models";
import {CardsModelsRequest} from "../models/cards.models";
import {TeamBodyModels, TeamsModels} from "../models/teams.models";

export class Utils {

    static createGrid(mapWidth: number, mapHeight: number): CellsConceptionModel[][] {
        const cellWidth = 32;
        const cellHeight = 32;
        const numCols = Math.floor(mapWidth / cellWidth);
        const numRows = Math.floor(mapHeight / cellHeight);
        const gridCellData: CellsConceptionModel[][] = [];
        let cellId = 1;
        for (let row = 0; row < numRows; row++) {
            const rowArray: CellsConceptionModel[] = [];

            for (let col = 0; col < numCols; col++) {
                const cell: CellsConceptionModel = {
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

    static createGameKeySession(testingVersion: boolean): string {
        let characters: string;
        if (testingVersion) {
            characters = 'AB';
        } else {
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        }
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }


    static formatResponse(code: number, message?: string, data?: any, error?: any): FormatModel {
        let messageFormat: FormatModel;
        if (error) {
            messageFormat = {
                error: error,
                code: code,
                message: message
            }
            return messageFormat;
        } else {
            messageFormat = {
                data: data,
                code: code,
                message: message
            }
            return messageFormat;
        }
    }

    static createEventsCellModelsInit(
        cellsmodel: Cellsmodel, messages: string, typeEvent: TypeEvent
    ): EventsCellModels {
        let eventsCellModels: EventsCellModels;
        eventsCellModels = {
            cells: {
                id: cellsmodel.id,
                x: cellsmodel.x,
                y: cellsmodel.y,
                value: cellsmodel.value,
            },
            message: messages,
            typeEvent: typeEvent,
        }
        return eventsCellModels;
    }

    static requestFormatCommon(response: any, format: FormatModel): any {
        if (format === undefined) {
            return response.status(500).json({message: "Erreur interne du serveur."})
        } else if (format.data !== null || format.data) {
            return response.status(format.code).json(format.data);
        } else {
            return response.status(format.code).json(format.error);
        }
    }

    static initialiserCardsModelsRequest(): CardsModelsRequest {
        return {
            id: undefined, // Vous pouvez laisser cette propriété non définie pour un nouvel objet
            name: '',
            description: '',
            image: '',
            rarity: '',
            atk: 0,
            def: 0,
            spd: 0,
            luk: 0,
            effects: []
        };
    }

    static initialiserPlayersGameModels(): PlayersGameModels {
        return {
            avatar: '',
            pseudo: '',
            life: 0,
            maxLife: 0,
            cardsPosessed: []
        };
    }

    static initialiserTeamBodyModels(): TeamBodyModels {
        return {
            freeplace: 0,
            teamName: '',
            commonLife: 0,
            commonMaxLife: 0,
            commonAttack: 0,
            commonDefense: 0,
            commonLuck: 0,
            commonSpeed: 0,
            isAlive: false,
            isReady: false,
            playerOne: this.initialiserPlayersGameModels(),
            playerTwo: this.initialiserPlayersGameModels(),
            cardOne: this.initialiserCardsModelsRequest(),
            cardTwo: this.initialiserCardsModelsRequest()
        };
    }

    static initialiserTeamsModels(): TeamsModels {
        return {
            teamOne: this.initialiserTeamBodyModels(),
            teamTwo: this.initialiserTeamBodyModels(),
            teamThree: this.initialiserTeamBodyModels(),
            teamFour: this.initialiserTeamBodyModels()
        };
    }

    static initialiserGameModels(): GameModels {
        return {
            lobby: [],
            teams: this.initialiserTeamsModels(),
            monsters: this.initialiserTeamsModels()
        };
    }
}
