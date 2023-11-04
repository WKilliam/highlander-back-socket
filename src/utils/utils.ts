import {CellsConceptionModel, Cellsmodel} from "../models/cells.models";
import {FormatModel, SocketFormatModel} from "../models/format.model";
import {PlayersGameModels, PlayersLittleModels, PlayersLobbyModels} from "../models/players.models";
import {TypeEvent} from "./enum/enum";
import {EventsCellModels} from "../models/events.models";
import {GameModels, PartiesFullBodyModels} from "../models/parties.models";
import {MapModels} from "../models/map.models";
import {GameKeySession, SessionModel, StatusAccess, StatusGame} from "../models/sessions.models";
import {CardsModelsRequest} from "../models/cards.models";
import {TeamBodyModels, TeamsModels} from "../models/teams.models";
import {InfoGame} from "../models/infoGame";
import {CardsDto} from "../dto/cards.dto";
import {JsonconceptorService} from "../services/jsonconceptor/jsonconceptor.service";

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

    static initCellsmodel() : Cellsmodel {
        return {
            id: 0,
            x: 0,
            y: 0,
            value: 0,
        }
    }

    static initialiserCardsModelsRequest(): CardsModelsRequest {
        return {
            id: undefined, // Vous pouvez laisser cette propriété non définie pour un nouvel objet
            name: '',
            description: '',
            image: 'https://cdn.discordapp.com/attachments/1060501071056879618/1168479278174830602/kyrasw_the_frame_of_a_back_tarot_card_game_rpg_in_png_format_or_379c9eb1-9bea-4ea4-bd56-c5629407e849.png?ex=6551ea21&is=653f7521&hm=6c6f2206917ece648f45a5e47c078b653280858dfed24979dedf207d22795991&',
            rarity: 'common',
            atk: 0,
            def: 0,
            spd: 0,
            luk: 0,
            effects: []
        };
    }

    static initialiserPlayersGameModels(
        avatar?:string,
        pseudo?:string,
        life?:number,
        maxLife?:number,
        cardsPosessed?:Array<number>,
        key?:string,
    ): PlayersGameModels {
        return {
            avatar: avatar || '',
            pseudo: pseudo || '',
            life: life || 0,
            maxLife: maxLife || 0,
            state: '',
            cardsPosessed: cardsPosessed || []
        };
    }

    static initialiserTeamBodyModels(teamTag:string,keyTag?:string): TeamBodyModels {
        return {
            freeplace: 0,
            teamName: teamTag,
            commonLife: 0,
            commonMaxLife: 0,
            commonAttack: 0,
            commonDefense: 0,
            commonLuck: 0,
            commonSpeed: 0,
            keyTag: keyTag || "",
            cellPosition: this.initCellsmodel(),
            isAlive: false,
            isReady: false,
            playerOne: this.initialiserPlayersGameModels(),
            playerTwo: this.initialiserPlayersGameModels(),
            cardOne: this.initialiserCardsModelsRequest(),
            cardTwo: this.initialiserCardsModelsRequest()
        };
    }

    static initialiserTeamsModels(teamOne:string,teamTwo:string,teamThree:string,teamFour:string): TeamsModels {
        return {
            teamOne: this.initialiserTeamBodyModels(teamOne,`teamOne`),
            teamTwo: this.initialiserTeamBodyModels(teamTwo,`teamTwo`),
            teamThree: this.initialiserTeamBodyModels(teamThree,`teamThree`),
            teamFour: this.initialiserTeamBodyModels(teamFour,`teamFour`),
        };
    }

    static initialiserGameModels(teamOne:string,teamTwo:string,teamThree:string,teamFour:string): GameModels {
        return {
            teams: this.initialiserTeamsModels(teamOne,teamTwo,teamThree,teamFour),
            monsters: this.initialiserTeamsModels('','','',''),
        };
    }

    static initInfoGameModels(
        gameKeySession:string,
        avatar:string,
        pseudo:string,
        ): InfoGame {
        let gameKey :GameKeySession = {
            key: gameKeySession,
            statusGame: StatusGame.ON,
        }
        let allPlayers: Array<PlayersLittleModels> = []
        allPlayers.push(this.initLittlePlayerModels(avatar,pseudo))
        return {
            turnCount: 0,
            playerTurn: 7,
            orderTurn: [],
            lobby: [],
            gameKeySession: gameKey,
            allPlayers: allPlayers,
        }
    }

    static initLittlePlayerModels(avatar:string, pseudo:string): PlayersLittleModels {
        return {
            avatar: avatar,
            pseudo: pseudo,
            teamTag: "",
        }
    }

    static arrayConvertId(cards:Array<any>){
        return cards.flatMap(item => item.id);
    }


    static formatSocketMessage(
        room:string ,
        data:any,
        message: string,
        code: number,
        error: any
    ) {
        let formatSocket: SocketFormatModel = {
            date: new Date().toISOString(),
            room: room,
            data: data,
            message: message,
            code: code,
            error: error
        }
        return formatSocket
    }

    static partiesDataSocket(roomjoin:string){
        try {
            let received :FormatModel = JsonconceptorService.readJsonFile(`${roomjoin}/parties.json`)
            if(!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(500, 'Internal Server Error', null, received.error);
            let partiesFullBodyModels: PartiesFullBodyModels = JSON.parse(received.data);
            return Utils.formatResponse(200, 'data body', partiesFullBodyModels);
        }catch (error){
            return Utils.formatResponse(500, 'Internal Server Error', null, error);
        }
    }



}
