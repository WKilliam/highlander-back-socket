import {CellsConceptionModel, Cellsmodel} from "../models/cells.models";
import {FormatModel} from "../models/format.model";
import {PlayersModels, PlayersModelsMonster} from "../models/players.models";
import {CardsModels} from "../models/cards.models";
import {Rarity, TypeEvent} from "./enum/enum";
import {EffectsModelsRequest} from "../models/effects.models";
import {MonstersModels, TeamBodyModels, TeamsModels, TeamsMonstersModels} from "../models/teams.models";
import {EventsCellModels} from "../models/events.models";

export class Utils {

    static createGrid(mapWidth: number,mapHeight: number): CellsConceptionModel[][] {
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

    static createPlayersModelsInit(): Array<PlayersModels> {
        let playersModelsArray: Array<PlayersModels> = [];
        for (let i = 0; i < 10; i++) {
            let playersModels: PlayersModels;
            playersModels = {
                id: 1,
                name: "",
                currentHp: 100,
                maxHp: 100,
                card: {
                    id: 0,
                    name: "",
                    description: "",
                    image: "",
                    rarity: Rarity.COMMUN,
                    atk: 0,
                    def: 0,
                    vit: 0,
                    luk: 0,
                    effects: []
                }
            }
            playersModelsArray.push(playersModels);
        }
        return playersModelsArray;
    }

    static createPlayersModelsMonsterInit(many: number): Array<PlayersModelsMonster> {
        let playersModelsArray: Array<PlayersModelsMonster> = [];
        for (let i = 0; i < many; i++) {
            let playersModels: PlayersModelsMonster;
            playersModels = {
                id: 1,
                name: "",
                currentHp: 100,
                maxHp: 100,
                card: {
                    id: 0,
                    name: "",
                    description: "",
                    image: "",
                    rarity: Rarity.COMMUN,
                    atk: 0,
                    def: 0,
                    vit: 0,
                    luk: 0,
                    effects: []
                }
            }
            playersModelsArray.push(playersModels);
        }
        return playersModelsArray;
    }

    static createTeamBodyModelsInit(players: Array<PlayersModels>): Array<TeamBodyModels> {
        let teamBodyModelsArray: Array<TeamBodyModels> = [];

        for (let i = 0; i < 5; i++) {
            let teamBodyModels: TeamBodyModels;
            teamBodyModels = {
                isAlive: true,
                avatar: "",
                players: players.slice(i * 2, (i * 2) + 2)
            }
            teamBodyModelsArray.push(teamBodyModels);
        }

        return teamBodyModelsArray;
    }

    static createTeamsMonstersModelsInit(monster: Array<PlayersModelsMonster>, many: number): Array<TeamsMonstersModels> {
        let teamBodyModelsArray: Array<TeamsMonstersModels> = [];
        for (let i = 0; i < many; i++) {
            let teamBodyModels: TeamsMonstersModels;
            teamBodyModels = {
                isAlive: true,
                name: "",
                players: monster.slice(i * 2, (i * 2) + 2)
            }
            teamBodyModelsArray.push(teamBodyModels);
        }
        return teamBodyModelsArray;
    }

    static createMonstersModelsInit(arrayTeamsMonstersModels: Array<TeamsMonstersModels>): MonstersModels {
        let monstersModels: MonstersModels;
        monstersModels = {
            one: arrayTeamsMonstersModels[0],
            two: arrayTeamsMonstersModels[1],
            three: arrayTeamsMonstersModels[2],
            four: arrayTeamsMonstersModels[3],
            five: arrayTeamsMonstersModels[4]
        }
        return monstersModels;
    }

    static createTeamsModelsInit(arrayTeamBodyModels: Array<TeamBodyModels>): TeamsModels {
        let teamsModels: TeamsModels;
        teamsModels = {
            one: arrayTeamBodyModels[0],
            two: arrayTeamBodyModels[1],
            three: arrayTeamBodyModels[2],
            four: arrayTeamBodyModels[3],
            five: arrayTeamBodyModels[4]
        }
        return teamsModels;
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


    static requestFormatCommon(response: any,format:FormatModel): any {
        if (format === undefined) {
            return response.status(500).json({message: "Erreur interne du serveur."})
        } else if (format.data !== null || format.data) {
            return response.status(format.code).json(format.data);
        } else {
            return response.status(format.code).json(format.error);
        }
    }









































}
