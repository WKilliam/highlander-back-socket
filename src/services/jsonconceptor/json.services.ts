import {FormatModel} from "../../models/format.model";
import {JsonconceptorService} from "./jsonconceptor.service";
import {Utils} from "../../utils/utils";
import {PlayersGameModels, PlayersLittleModels, PlayersLobbyModels} from "../../models/players.models";
import {GameModels, StatePlayer} from "../../models/parties.models";
import {TeamBodyModels} from "../../models/teams.models";
import {CardsDto} from "../../dto/cards.dto";
import {Cellsmodel} from "../../models/cells.models";

export class JsonServices {

    static getKeyJson(keySession: string, keyData: string) {
        try {
            const received: FormatModel = JsonconceptorService.getJsonFile(`${keySession}/parties.json`, keyData)
            return Utils.formatResponse(received.code, received.message, received.data, received.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static checkSessionOnJson(sessionKey: string) {
        try {
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.gameKeySession.statusGame')
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            return Utils.formatResponse(received.code, received.message, received.data, received.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static addPlayerAllPlayer(sessionKey: string, avatar: string, pseudo: string) {
        try {
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.allPlayers')
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            let value: Array<PlayersLittleModels> = received.data
            if ((value.length + 1) > 7) return Utils.formatResponse(404, 'Not Place Found', 'Place not found')
            value.push(Utils.initLittlePlayerModels(avatar, pseudo))
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, 'infoGame.allPlayers', value)
            if (!(update.code >= 200 && update.code <= 299)) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    /**
     * Player Security, Check, Set and Get
     */

    static securityCheckPlayer(sessionKey: string, teamTag: string, position: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`${teamTag}-${position}`)
            if (!text) return Utils.formatResponse(404, 'Not Team Found', 'Team not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, text)
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            if (received.data.pseudo !== "") return Utils.formatResponse(404, 'Team full', 'Team full')
            return Utils.formatResponse(200, 'Team Place Open', 'Team Place Open')
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static securityCheckCardTeam(sessionKey: string, teamTag: string, cardsTag: string, position: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`${teamTag}-${cardsTag}-${position}`)
            if (!text) return Utils.formatResponse(404, 'Card not Found', 'Card not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, text)
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            if (received.data.name !== "") return Utils.formatResponse(404, 'Card full', 'Card full')
            return Utils.formatResponse(200, 'Card Place Open', 'Card Place Open')
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static checkIfPlayerIfNotInsideTag(sessionKey: string, avatar: string, pseudo: string){
        try{
            const received = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.allPlayers')
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            let value: Array<PlayersLittleModels> = received.data
            let playerInTag = value[0].teamTag
            if(playerInTag === "") return Utils.formatResponse(200, 'Player not Inside Tag', 'Player not Inside Tag')
            return Utils.formatResponse(404, 'Player Inside Tag', {teamTag: playerInTag})
        }catch (error:any){
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static setAllPlayers(sessionKey: string, avatar: string, pseudo: string, teamTag: string, position: number) {
        try {
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.allPlayers')
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            if ((received.data.length + 1) > 7) return Utils.formatResponse(404, 'Not Place Found', 'Place not found')
            let value: Array<PlayersLittleModels> = received.data
            let playerExisted = value.filter((item: PlayersLittleModels) => {
                if (item.pseudo === pseudo && item.avatar === avatar) {
                    return item
                }
            })
            if (playerExisted.length > 0) return Utils.formatResponse(404, 'Player Already Exist', 'Player Already Exist')
            value.push(Utils.initLittlePlayerModels(avatar, pseudo))
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, 'infoGame.allPlayers', value)
            if (!(update.code >= 200 && update.code <= 299)) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static checkIfPlayerIfInsideAnotherTeam(sessionKey: string, avatar: string, pseudo: string) {
        try {
            const teamOne = `${this.mapBody().get("teamOne")}`
            if (!teamOne) return Utils.formatResponse(404, 'Team ONE not Found', 'Team ONE not found')
            const receivedTeamOne: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, teamOne)
            if (!(receivedTeamOne.code >= 200 && receivedTeamOne.code <= 299)) return Utils.formatResponse(receivedTeamOne.code, receivedTeamOne.message, receivedTeamOne.data, receivedTeamOne.error)
            const teamTwo = `${this.mapBody().get("teamTwo")}`
            if (!teamTwo) return Utils.formatResponse(404, 'Team TWO not Found', 'Team TWO not found')
            const receivedTeamTwo: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, teamTwo)
            if (!(receivedTeamTwo.code >= 200 && receivedTeamTwo.code <= 299)) return Utils.formatResponse(receivedTeamTwo.code, receivedTeamTwo.message, receivedTeamTwo.data, receivedTeamTwo.error)
            const teamThree = `${this.mapBody().get("teamThree")}`
            if (!teamThree) return Utils.formatResponse(404, 'Team THREE not Found', 'Team THREE not found')
            const receivedTeamThree: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, teamThree)
            if (!(receivedTeamThree.code >= 200 && receivedTeamThree.code <= 299)) return Utils.formatResponse(receivedTeamThree.code, receivedTeamThree.message, receivedTeamThree.data, receivedTeamThree.error)
            const teamFour = `${this.mapBody().get("teamFour")}`
            if (!teamFour) return Utils.formatResponse(404, 'Team FOUR not Found', 'Team FOUR not found')
            const receivedTeamFour: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, teamFour)
            if (!(receivedTeamFour.code >= 200 && receivedTeamFour.code <= 299)) return Utils.formatResponse(receivedTeamFour.code, receivedTeamFour.message, receivedTeamFour.data, receivedTeamFour.error)
            let tabTeam: Array<TeamBodyModels> = []
            tabTeam.push(receivedTeamOne.data)
            tabTeam.push(receivedTeamTwo.data)
            tabTeam.push(receivedTeamThree.data)
            tabTeam.push(receivedTeamFour.data)

            for (let i = 0; i < tabTeam.length; i++) {
                if (tabTeam[i].playerOne.pseudo === pseudo && tabTeam[i].playerOne.avatar === avatar) {
                    return Utils.formatResponse(404, `Player Inside Team ${tabTeam[i].teamName} on playerOne`, {
                        teamTag: tabTeam[i].keyTag,
                        position: 1
                    })
                } else if (tabTeam[i].playerTwo.pseudo === pseudo && tabTeam[i].playerTwo.avatar === avatar) {
                    return Utils.formatResponse(404, `Player Inside Team ${tabTeam[i].teamName} on playerTwo`, {
                        teamTag: tabTeam[i].keyTag,
                        position: 2
                    })
                }
            }
            return Utils.formatResponse(200, 'Player not Inside Team', 'Player not Inside Team')
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static setPlayer(sessionKey: string, avatar: string, pseudo: string, teamTag: string, position: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`${teamTag}-${position}`)
            if (!text) return Utils.formatResponse(404, 'Not Team Found', 'Team not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, text)
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            let playerPlace: PlayersGameModels = received.data
            if (playerPlace.pseudo !== "") return Utils.formatResponse(404, 'Team full', 'Team full')
            const checkIfPlayerIfInsideAnotherTeam: FormatModel = this.checkIfPlayerIfInsideAnotherTeam(sessionKey, avatar, pseudo)
            playerPlace.pseudo = pseudo
            playerPlace.avatar = avatar
            playerPlace.life = 100
            playerPlace.maxLife = 100
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, text, playerPlace)
            if (!(update.code >= 200 && update.code <= 299)) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    private static mapBody() {
        let map: Map<string, string> = new Map();
        map.set("infoGame", "infoGame")

        map.set("teamOne", "game.teams.teamOne")
        map.set("teamTwo", "game.teams.teamTwo")
        map.set("teamThree", "game.teams.teamThree")
        map.set("teamFour", "game.teams.teamFour")

        map.set("monster-teamOne", "game.monsters.teamOne")
        map.set("monster-teamTwo", "game.monsters.teamTwo")
        map.set("monster-teamThree", "game.monsters.teamThree")
        map.set("monster-teamFour", "game.monsters.teamFour")

        map.set("cell-teamOne", "game.teams.teamOne.cellPosition")
        map.set("cell-teamTwo", "game.teams.teamTwo.cellPosition")
        map.set("cell-teamThree", "game.teams.teamThree.cellPosition")
        map.set("cell-teamFour", "game.teams.teamFour.cellPosition")

        map.set("teamOne-1", "game.teams.teamOne.playerOne")
        map.set("teamOne-2", "game.teams.teamOne.playerTwo")
        map.set("teamTwo-1", "game.teams.teamTwo.playerOne")
        map.set("teamTwo-2", "game.teams.teamTwo.playerTwo")
        map.set("teamThree-1", "game.teams.teamThree.playerOne")
        map.set("teamThree-2", "game.teams.teamThree.playerTwo")
        map.set("teamFour-1", "game.teams.teamFour.playerOne")
        map.set("teamFour-2", "game.teams.teamFour.playerTwo")

        map.set("teamOne-cardOne-1", "game.teams.teamOne.cardOne")
        map.set("teamOne-cardTwo-2", "game.teams.teamOne.cardTwo")
        map.set("teamTwo-cardOne-1", "game.teams.teamTwo.cardOne")
        map.set("teamTwo-cardTwo-2", "game.teams.teamTwo.cardTwo")
        map.set("teamThree-cardOne-1", "game.teams.teamThree.cardOne")
        map.set("teamThree-cardTwo-2", "game.teams.teamThree.cardTwo")
        map.set("teamFour-cardOne-1", "game.teams.teamFour.cardOne")
        map.set("teamFour-cardTwo-2", "game.teams.teamFour.cardTwo")

        map.set("monster-teamOne-1", "game.monsters.teamOne.playerOne")
        map.set("monster-teamOne-2", "game.monsters.teamOne.playerTwo")
        map.set("monster-teamTwo-1", "game.monsters.teamTwo.playerOne")
        map.set("monster-teamTwo-2", "game.monsters.teamTwo.playerTwo")
        map.set("monster-teamThree-1", "game.monsters.teamThree.playerOne")
        map.set("monster-teamThree-2", "game.monsters.teamThree.playerTwo")
        map.set("monster-teamFour-1", "game.monsters.teamFour.playerOne")
        map.set("monster-teamFour-2", "game.monsters.teamFour.playerTwo")

        map.set("monster-teamOne-cardOne-1", "game.monsters.teamOne.cardOne")
        map.set("monster-teamOne-cardTwo-2", "game.monsters.teamOne.cardTwo")
        map.set("monster-teamTwo-cardOne-1", "game.monsters.teamTwo.cardOne")
        map.set("monster-teamTwo-cardTwo-2", "game.monsters.teamTwo.cardTwo")
        map.set("monster-teamThree-cardOne-1", "game.monsters.teamThree.cardOne")
        map.set("monster-teamThree-cardTwo-2", "game.monsters.teamThree.cardTwo")
        map.set("monster-teamFour-cardOne-1", "game.monsters.teamFour.cardOne")
        map.set("monster-teamFour-cardTwo-2", "game.monsters.teamFour.cardTwo")
        return map
    }

    static restPlayerAfterMove(sessionKey: string, teamTag: string, position: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const textPlayer = position === 1 ? map.get(`${teamTag}`) : map.get(`${teamTag}`)
            if (!textPlayer) return Utils.formatResponse(404, 'Not Team Found', 'Team not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, textPlayer)
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            position === 1 ? received.data.playerOne = Utils.initialiserPlayersGameModels() : received.data.playerTwo = Utils.initialiserPlayersGameModels()
            position === 1 ? received.data.cardOne = Utils.initialiserCardsModelsRequest(): received.data.cardTwo = Utils.initialiserCardsModelsRequest()
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, textPlayer, received.data)
            if (!(update.code >= 200 && update.code <= 299)) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    /*****/


    static setCardTeam(sessionKey: string, avatar: string, pseudo: string, teamTag: string, cardsTag: string, position: number, cardsId: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`${teamTag}-${cardsTag}-${position}`)
            if (!text) return Utils.formatResponse(404, 'Card not Found', 'Card not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, text)
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            let cardPlace: CardsDto = received.data
            if (cardPlace.name !== "") return Utils.formatResponse(404, 'Card full', 'Card full')
            const lobby: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.lobby')
            if (!(lobby.code >= 200 && lobby.code <= 299)) return Utils.formatResponse(lobby.code, lobby.message, lobby.data, lobby.error)
            let value: Array<PlayersLobbyModels> = lobby.data
            let cards = value[0].cards
            let check: FormatModel = this.securityCheckCardTeam(sessionKey, teamTag, cardsTag, position)
            if (!(check.code >= 200 && check.code <= 299)) return Utils.formatResponse(check.code, check.message, check.data, check.error)
            let card = cards.filter((item: CardsDto) => {
                if (item.id === cardsId) {
                    return item
                }
            })
            if (card.length === 0) return Utils.formatResponse(404, 'Card not Found', 'Card not found')
            cardPlace = card[0]
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, text, cardPlace)
            if (!(update.code >= 200 && update.code <= 299)) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static setCellPlayer(sessionKey: string, teamTag: string, position: number, cellPosition: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`cell-${teamTag}`)
            if (!text) return Utils.formatResponse(404, 'Cell By Team not Found', 'Cell By Team not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, text)
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            let cell: Cellsmodel = received.data
            const receivedMap: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'map.cellsGrid')
            if (!(receivedMap.code >= 200 && receivedMap.code <= 299)) return Utils.formatResponse(receivedMap.code, receivedMap.message, receivedMap.data, receivedMap.error)
            let cells: Array<Cellsmodel> = receivedMap.data
            let cellPlace = cells.filter((item: Cellsmodel) => {
                if (item.id === cellPosition) {
                    return item
                }
            })
            if (cellPlace.length === 0) return Utils.formatResponse(404, 'Cell not Found', 'Cell not found')
            cell = cellPlace[0]
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, text, cell)
            if (!(update.code >= 200 && update.code <= 299)) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static setStatePlayer(sessionKey: string, teamTag: string, position: number, state: string) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`${teamTag}-${position}`)
            if (!text) return Utils.formatResponse(404, 'Not Team Found', 'Team not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, text)
            switch (state) {
                case "LOBBY":
                    received.data.state = StatePlayer.LOBBY
                    break
                case "GAME":
                    received.data.state = StatePlayer.GAME
                    break
                case "FIGTH":
                    received.data.state = StatePlayer.FIGTH
                    break
                case "DONJON":
                    received.data.state = StatePlayer.DONJON
                    break
                case "DONJON_FIGTH":
                    received.data.state = StatePlayer.DONJON_FIGTH
                    break
                case "WIN":
                    received.data.state = StatePlayer.WIN
                    break
                case "LOSE":
                    received.data.state = StatePlayer.LOSE
                    break
                default:
                    return Utils.formatResponse(404, 'Not State Found', 'State not found')
            }
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, text, received.data)
            if (!(update.code >= 200 && update.code <= 299)) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static setValueCalculate(sessionKey: string, tag: string, path: string, value: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`${tag}`)
            if (!text) return Utils.formatResponse(404, 'Not Team Found', 'Team not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, text)
            if (!(received.code >= 200 && received.code <= 299)) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            // Divisez le chemin en segments
            const pathSegments = path.split('.')
            // Naviguez dans l'objet pour mettre à jour la propriété "life"
            let currentObject = received.data;
            for (const segment of pathSegments.slice(0, -1)) {
                if (!(segment in currentObject)) {
                    currentObject[segment] = {};
                }
                currentObject = currentObject[segment];
            }
            const lastSegment = pathSegments[pathSegments.length - 1];
            currentObject[lastSegment] = value;
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, text, received.data)
            if (!(update.code >= 200 && update.code <= 299)) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(received.code, received.message, received.data, received.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static createListTurn(sessionKey: string) {
        try {
            const map: Map<string, string> = this.mapBody()
            const teamOne = `${this.mapBody().get("teamOne")}`
            if (!teamOne) return Utils.formatResponse(404, 'Team ONE not Found', 'Team ONE not found')
            const teamTwo = `${this.mapBody().get("teamTwo")}`
            if (!teamTwo) return Utils.formatResponse(404, 'Team TWO not Found', 'Team TWO not found')
            const teamThree = `${this.mapBody().get("teamThree")}`
            if (!teamThree) return Utils.formatResponse(404, 'Team THREE not Found', 'Team THREE not found')
            const teamFour = `${this.mapBody().get("teamFour")}`
            if (!teamFour) return Utils.formatResponse(404, 'Team FOUR not Found', 'Team FOUR not found')
            const monsterTeamOne = `${this.mapBody().get("monster-teamOne")}`
            if (!monsterTeamOne) return Utils.formatResponse(404, 'Monster Team ONE not Found', 'Monster Team ONE not found')
            const monsterTeamTwo = `${this.mapBody().get("monster-teamTwo")}`
            if (!monsterTeamTwo) return Utils.formatResponse(404, 'Monster Team TWO not Found', 'Monster Team TWO not found')
            const monsterTeamThree = `${this.mapBody().get("monster-teamThree")}`
            if (!monsterTeamThree) return Utils.formatResponse(404, 'Monster Team THREE not Found', 'Monster Team THREE not found')
            const monsterTeamFour = `${this.mapBody().get("monster-teamFour")}`
            if (!monsterTeamFour) return Utils.formatResponse(404, 'Monster Team FOUR not Found', 'Monster Team FOUR not found')
            const receivedTeamOne: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, teamOne)
            if (!(receivedTeamOne.code >= 200 && receivedTeamOne.code <= 300)) return Utils.formatResponse(receivedTeamOne.code, receivedTeamOne.message, receivedTeamOne.data, receivedTeamOne.error)
            const receivedTeamTwo: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, teamTwo)
            if (!(receivedTeamTwo.code >= 200 && receivedTeamTwo.code <= 300)) return Utils.formatResponse(receivedTeamTwo.code, receivedTeamTwo.message, receivedTeamTwo.data, receivedTeamTwo.error)
            const receivedTeamThree: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, teamThree)
            if (!(receivedTeamThree.code >= 200 && receivedTeamThree.code <= 300)) return Utils.formatResponse(receivedTeamThree.code, receivedTeamThree.message, receivedTeamThree.data, receivedTeamThree.error)
            const receivedTeamFour: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, teamFour)
            if (!(receivedTeamFour.code >= 200 && receivedTeamFour.code <= 300)) return Utils.formatResponse(receivedTeamFour.code, receivedTeamFour.message, receivedTeamFour.data, receivedTeamFour.error)
            const receivedMonsterTeamOne: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, monsterTeamOne)
            if (!(receivedMonsterTeamOne.code >= 200 && receivedMonsterTeamOne.code <= 300)) return Utils.formatResponse(receivedMonsterTeamOne.code, receivedMonsterTeamOne.message, receivedMonsterTeamOne.data, receivedMonsterTeamOne.error)
            const receivedMonsterTeamTwo: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, monsterTeamTwo)
            if (!(receivedMonsterTeamTwo.code >= 200 && receivedMonsterTeamTwo.code <= 300)) return Utils.formatResponse(receivedMonsterTeamTwo.code, receivedMonsterTeamTwo.message, receivedMonsterTeamTwo.data, receivedMonsterTeamTwo.error)
            const receivedMonsterTeamThree: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, monsterTeamThree)
            if (!(receivedMonsterTeamThree.code >= 200 && receivedMonsterTeamThree.code <= 300)) return Utils.formatResponse(receivedMonsterTeamThree.code, receivedMonsterTeamThree.message, receivedMonsterTeamThree.data, receivedMonsterTeamThree.error)
            const receivedMonsterTeamFour: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, monsterTeamFour)
            if (!(receivedMonsterTeamFour.code >= 200 && receivedMonsterTeamFour.code <= 300)) return Utils.formatResponse(receivedMonsterTeamFour.code, receivedMonsterTeamFour.message, receivedMonsterTeamFour.data, receivedMonsterTeamFour.error)
            let listTeam: Array<TeamBodyModels> = []
            listTeam.push(receivedTeamOne.data)
            listTeam.push(receivedTeamTwo.data)
            listTeam.push(receivedTeamThree.data)
            listTeam.push(receivedTeamFour.data)
            listTeam.push(receivedMonsterTeamOne.data)
            listTeam.push(receivedMonsterTeamTwo.data)
            listTeam.push(receivedMonsterTeamThree.data)
            listTeam.push(receivedMonsterTeamFour.data)
            let listPlayerTurn: Array<PlayersGameModels> = []
            const filteredTeams = listTeam.filter(team => {
                return (team.commonLife !== 0 ||
                    team.commonMaxLife !== 0 ||
                    team.commonAttack !== 0 ||
                    team.commonDefense !== 0 ||
                    team.commonLuck !== 0 ||
                    team.commonSpeed !== 0 ||
                    !team.isAlive
                );
            });
            let orderList = filteredTeams.sort((a, b) => {
                return b.commonSpeed - a.commonSpeed;
            });
            orderList.forEach((team: TeamBodyModels) => {
                listPlayerTurn.push(team.playerOne)
                listPlayerTurn.push(team.playerTwo)
            })
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, 'infoGame.orderTurn', listPlayerTurn)
            return Utils.formatResponse(200, 'List Player Turn', update);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    private static nextPlayer(joueurs: PlayersGameModels[], playerTurn: number): number {
        if (joueurs.length === 0 && joueurs.length < 4) return -2 // End Game
        let currentTurnPlayer = joueurs.indexOf(joueurs[playerTurn]);
        let nextPlayer = currentTurnPlayer + 1;
        for (let i = nextPlayer; i < joueurs.length; i++) {
            if (joueurs[i].state !== StatePlayer.LOBBY && joueurs[i].state !== StatePlayer.LOSE) {
                return joueurs.indexOf(joueurs[i]); // Next Player
            }
        }
        return -1 // Next Turn
    }

    static nextTurnPlayer(sessionKey: string) {
        try {
            console.log("test")
            const receivedOrderTurn: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.orderTurn')
            if (!(receivedOrderTurn.code >= 200 && receivedOrderTurn.code <= 300)) return Utils.formatResponse(receivedOrderTurn.code, receivedOrderTurn.message, receivedOrderTurn.data, receivedOrderTurn.error)
            const playerTurn: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.playerTurn')
            if (!(playerTurn.code >= 200 && playerTurn.code <= 300)) return Utils.formatResponse(playerTurn.code, playerTurn.message, playerTurn.data, playerTurn.error)
            let turnCount: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.turnCount')
            if (!(turnCount.code >= 200 && turnCount.code <= 300)) return Utils.formatResponse(turnCount.code, turnCount.message, turnCount.data, turnCount.error)
            let joueursIndex: number = this.nextPlayer(receivedOrderTurn.data, playerTurn.data)
            console.log(joueursIndex)
            if (joueursIndex === -1) {
                return Utils.formatResponse(200, 'Next Turn', true);
            } else if (joueursIndex === -2) {
                return Utils.formatResponse(200, 'End Game', false);
            }
            playerTurn.data = joueursIndex
            const updatePlayerTurn: FormatModel = this.setValueCalculate(sessionKey, 'infoGame', 'playerTurn', playerTurn.data)
            console.log(updatePlayerTurn)
            if (!(updatePlayerTurn.code >= 200 && updatePlayerTurn.code <= 300)) return Utils.formatResponse(updatePlayerTurn.code, updatePlayerTurn.message, updatePlayerTurn.data, updatePlayerTurn.error)
            turnCount.data++
            const updateTurnCount: FormatModel = this.setValueCalculate(sessionKey, 'infoGame', 'turnCount', turnCount.data)
            if (!(updateTurnCount.code >= 200 && updateTurnCount.code <= 300)) return Utils.formatResponse(updateTurnCount.code, updateTurnCount.message, updateTurnCount.data, updateTurnCount.error)
            return Utils.formatResponse(200, 'Next Player', true);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

}
