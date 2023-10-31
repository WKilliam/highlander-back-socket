import {FormatModel} from "../../models/format.model";
import {JsonconceptorService} from "./jsonconceptor.service";
import {Utils} from "../../utils/utils";
import {PlayersGameModels, PlayersLittleModels, PlayersLobbyModels} from "../../models/players.models";
import {GameModels} from "../../models/parties.models";
import {TeamBodyModels} from "../../models/teams.models";
import {CardsDto} from "../../dto/cards.dto";

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
            if (received.code <= 200 && received.code > 300) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            return Utils.formatResponse(received.code, received.message, received.data, received.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static addPlayerAllPlayer(sessionKey: string, avatar: string, pseudo: string) {
        try {
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.allPlayers')
            if (received.code <= 200 && received.code > 300) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            let value: Array<PlayersLittleModels> = received.data
            if ((value.length + 1) > 7) return Utils.formatResponse(404, 'Not Place Found', 'Place not found')
            value.push(Utils.initLittlePlayerModels(avatar, pseudo))
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, 'infoGame.allPlayers', value)
            if (update.code <= 200 && update.code > 300) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }


    private static mapBody() {
        let map: Map<string, string> = new Map();
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
        return map
    }


    static securityCheckPlayer(sessionKey: string, teamTag: string, position: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`${teamTag}-${position}`)
            if (!text) return Utils.formatResponse(404, 'Not Team Found', 'Team not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, text)
            if (received.code <= 200 && received.code > 300) return Utils.formatResponse(received.code, received.message, received.data, received.error)
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
            if (received.code <= 200 && received.code > 300) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            if (received.data.name !== "") return Utils.formatResponse(404, 'Card full', 'Card full')
            return Utils.formatResponse(200, 'Card Place Open', 'Card Place Open')
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }


    static setAllPlayers(sessionKey: string, avatar: string, pseudo: string, teamTag: string, position: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`${teamTag}-${position}`)
            if (!text) return Utils.formatResponse(404, 'Not Team Found', 'Team not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.allPlayers')
            if (received.code <= 200 && received.code > 300) return Utils.formatResponse(received.code, received.message, received.data, received.error)
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
            if (update.code <= 200 && update.code > 300) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
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
            if (received.code <= 200 && received.code > 300) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            let playerPlace: PlayersGameModels = received.data
            if (playerPlace.pseudo !== "") return Utils.formatResponse(404, 'Team full', 'Team full')
            playerPlace.pseudo = pseudo
            playerPlace.avatar = avatar
            playerPlace.life = 100
            playerPlace.maxLife = 100
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, text, playerPlace)
            if (update.code <= 200 && update.code > 300) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

    static setCardTeam(sessionKey: string, avatar: string, pseudo: string, teamTag: string, cardsTag: string, position: number, cardsId: number) {
        try {
            const map: Map<string, string> = this.mapBody()
            const text = map.get(`${teamTag}-${cardsTag}-${position}`)
            if (!text) return Utils.formatResponse(404, 'Card not Found', 'Card not found')
            const received: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, text)
            if (received.code <= 200 && received.code > 300) return Utils.formatResponse(received.code, received.message, received.data, received.error)
            let cardPlace: CardsDto = received.data
            if (cardPlace.name !== "") return Utils.formatResponse(404, 'Card full', 'Card full')
            const lobby: FormatModel = JsonconceptorService.getJsonFile(`${sessionKey}/parties.json`, 'infoGame.lobby')
            if (lobby.code <= 200 && lobby.code > 300) return Utils.formatResponse(lobby.code, lobby.message, lobby.data, lobby.error)
            let value: Array<PlayersLobbyModels> = lobby.data
            let playerExisted = value.filter((item: PlayersLobbyModels) => {
                if (item.pseudo === pseudo && item.avatar === avatar) {
                    return item
                }
            })
            let cards = playerExisted[0].cards.filter((item: CardsDto) => {
                if (item.id === cardsId) {
                    return item
                }
            })
            if (cards.length === 0) return Utils.formatResponse(404, 'Card not Found', 'Card not found')
            const update: FormatModel = JsonconceptorService.updateJsonFile(`${sessionKey}/parties.json`, text, cards[0])
            if (update.code <= 200 && update.code > 300) return Utils.formatResponse(update.code, update.message, update.data, update.error)
            return Utils.formatResponse(update.code, update.message, update.data, update.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }


}
