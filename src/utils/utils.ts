import {Cells} from "../models/maps.models";
import {SessionDto} from "../dto/session.dto";
import {FormatRestApiModels} from "../models/formatRestApi";
import {CardByEntityPlaying, CardsModels} from "../models/cards.models";
import {CardPlayerEntityModels, PlayerCardsEntity} from "../models/cards.player.entity.models";
import {PlayerLobby} from "../models/player.models";
import {CardsDto} from "../dto/cards.dto";
import {Can, EntityCategorie, EntityStatus} from "../models/enums";
import {EntityActionFight, EntityActionMoving} from "../models/actions.game.models";
import {FightSession, SessionModels} from "../models/session.models";

export class Utils {

    private static adjectives = ["Féroces", "Mystiques", "Terrifiants", "Anciens", "Surnaturels"];
    private static names = ["Gargouilles", "Spectres", "Griffons", "Hydres", "Minotaures"];
    private static themes = ["des Abysses", "de la Nuit", "des Ombres", "de l'Infini", "du Chaos"];

    static randomMonsterName() {
        let pseudoMonstres = [
            "Ombre Funeste",
            "Griffes de Nuit",
            "Fléau Ténébreux",
            "Harpies Maudites",
            "Gargouilles Infernales",
            "Hydra de l'Ombre",
            "Chimère Dévoreuse",
            "Basilic Venimeux",
            "Démons Sanguinaires",
            "Minotaure Furieux",
            "Spectres Vengeurs",
            "Gobelins Maléfiques",
            "Loups Nocturnes",
            "Dragon de l'Abîme",
            "Goules Affamées",
            "Kraken Abyssal",
            "Wyvernes Sombres",
            "Banshees Hurlantes",
            "Gobelins des Marais",
            "Liche Immortelle"
        ];
        let avatarMonstres = [
            "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/343344341/original/f6f27d307c3080a6590744b8e093f85877939079/do-a-horror-dark-fantasy-character-or-creature-for-your-dnd-campaign.jfif",
        ];
        return {
            pseudo: pseudoMonstres[Math.floor(Math.random() * pseudoMonstres.length)],
            avatar: avatarMonstres[Math.floor(Math.random() * avatarMonstres.length)],
        }
    }

    private static getRandomElement(array: string[]): string {
        return array[Math.floor(Math.random() * array.length)];
    }

    public static generateTeamNames(existingNames: string[], count: number): string[] {
        const newNames: string[] = [];
        while (newNames.length < count) {
            const adjective = this.getRandomElement(this.adjectives);
            const name = this.getRandomElement(this.names);
            const theme = this.getRandomElement(this.themes);
            const teamName = `${adjective} ${name} ${theme}`;

            if (!existingNames.includes(teamName) && !newNames.includes(teamName)) {
                newNames.push(teamName);
            }
        }
        return newNames;
    }

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

    static codeErrorChecking(code: number): boolean {
        return code < 200 || code > 299;
    }

    static setPlayerTeam(
        data: SessionDto, lobbyPosition: number, teamPosition: number,
        cardPosition: number, cardByPlayer: number | null = null
    ) {
        let teams = data.game.game.challenger ?? []
        let lobby = data.game.sessionStatusGame.lobby ?? []

        // Check if teams[teamPosition].cardsPlayer[cardPosition] is not already taken
        let userInformation = lobby[lobbyPosition];
        let checkSession = teams[teamPosition].cardsInfo ?? [];
        console.log(cardByPlayer)
        if (checkSession.length === 0) {
            return FormatRestApiModels.createFormatRestApi(400, 'The seat is already taken.', null, null);
        } else {
            const processSet = this.setCardByPlayer(
                teams,
                teamPosition,
                cardPosition,
                userInformation,
                cardByPlayer);
            if (this.codeErrorChecking(processSet.code)) return FormatRestApiModels.createFormatRestApi(400, processSet.message, processSet.data, processSet.error);
            const checkAnotherTeamRefresh = this.checkAnotherTeamRefresh(teams, teamPosition, cardPosition, userInformation);
            if (this.codeErrorChecking(checkAnotherTeamRefresh.code)) return FormatRestApiModels.createFormatRestApi(400, checkAnotherTeamRefresh.message, checkAnotherTeamRefresh.data, checkAnotherTeamRefresh.error);
            data.game.game.challenger = checkAnotherTeamRefresh.data
            return FormatRestApiModels.createFormatRestApi(200, 'Card Change', data, null);
        }
    }

    private static setCardByPlayer(teams: Array<PlayerCardsEntity>, teamPosition: number, cardPosition: number, userInformation: PlayerLobby, cardByPlayer: number | null) {
        for (let i = 0; i < teams.length; i++) {
            const sessionEndPoint = teams[i].cardsInfo ?? [];
            for (let j = 0; j < sessionEndPoint.length; j++) {
                const ifSeatIsEmty = sessionEndPoint[j].player?.avatar === "" && sessionEndPoint[j].player?.pseudo === ""
                const ifSeatIsEqualPlayer = sessionEndPoint[j].player?.avatar === userInformation.avatar && sessionEndPoint[j].player?.pseudo === userInformation.pseudo
                if (ifSeatIsEmty || ifSeatIsEqualPlayer) {
                    if (cardByPlayer === null) {
                        const card: CardByEntityPlaying = {
                            ...sessionEndPoint[j],
                            player: {
                                avatar: userInformation.avatar,
                                pseudo: userInformation.pseudo,
                            },
                        }
                        sessionEndPoint[j] = card
                    } else {
                        const card: CardByEntityPlaying = {
                            player: {
                                avatar: userInformation.avatar,
                                pseudo: userInformation.pseudo,
                            },
                            atk: userInformation.cards[cardByPlayer].atk,
                            def: userInformation.cards[cardByPlayer].def,
                            spd: userInformation.cards[cardByPlayer].spd,
                            luk: userInformation.cards[cardByPlayer].luk,
                            description: userInformation.cards[cardByPlayer].description,
                            name: userInformation.cards[cardByPlayer].name,
                            entityStatus: EntityStatus.ALIVE,
                            rarity: userInformation.cards[cardByPlayer].rarity,
                            imageSrc: userInformation.cards[cardByPlayer].image,
                            effects: userInformation.cards[cardByPlayer].effects,
                            capacities: userInformation.cards[cardByPlayer].capacities,
                        }
                        sessionEndPoint[j] = card
                    }
                } else {
                    return FormatRestApiModels.createFormatRestApi(400, 'The seat does not belong to the player.', null, null);
                }
            }
        }
        return FormatRestApiModels.createFormatRestApi(200, 'Card Change', teams, null);
    }

    private static checkAnotherTeamRefresh(teams: Array<PlayerCardsEntity>, teamPosition: number, cardPosition: number, userInformation: PlayerLobby) {
        for (let i = 0; i < teams.length; i++) {
            const sessionEndPoint = teams[i].cardsInfo ?? [];
            for (let j = 0; j < sessionEndPoint.length; j++) {
                const currentPositionNotChange = i === teamPosition && j === cardPosition
                const isSamePlayer = sessionEndPoint[j].player?.pseudo === userInformation.pseudo && sessionEndPoint[j].player?.avatar === userInformation.avatar
                if (sessionEndPoint[j].player?.avatar === userInformation.avatar &&
                    sessionEndPoint[j].player?.pseudo === userInformation.pseudo &&
                    !currentPositionNotChange &&
                    isSamePlayer) {
                    sessionEndPoint[j] = CardsModels.initCardByEntityPlaying();
                }
            }
        }
        return FormatRestApiModels.createFormatRestApi(200, 'Card Change', teams, null);
    }


    static createGameContent(data: SessionDto, cards: Array<CardsDto>) {
        const playerInit = this.playerInit(data)
        const content = this.createMonsterEntityPlaying(data, cards)
        data.game.game.challenger =  playerInit.game.game.challenger.concat(content)
        data.game.sessionStatusGame.entityTurn = this.rollingTunrBySpeedEntity(data)
        return data
    }

    static cardCommonFusionStat(team: PlayerCardsEntity,key:string) {
        const valueCardOne = team?.cardsInfo?.[0][key] ?? 0
        const valueCardTwo = team?.cardsInfo?.[1][key] ?? 0
        return (team?.cardsInfo?.[0][key] === -21 && team?.cardsInfo?.[1][key] === -21) ? -21 :
            (team?.cardsInfo?.[0][key] === -21 && team?.cardsInfo?.[1][key]!== -21) ? valueCardTwo :
                (team?.cardsInfo?.[0][key] !== -21 && team?.cardsInfo?.[1][key] === -21) ? valueCardOne :
                    (team?.cardsInfo?.[0][key] !== -21 && team?.cardsInfo?.[1][key] !== -21) ? valueCardOne + valueCardTwo : -1
    }

    static playerInit(data: SessionDto) {
        for (let i = 0; i < 4 ; i++) {
            console.log(data.game.game.challenger[i].name)
            data.game.game.challenger[i].commonAttack = this.cardCommonFusionStat(data.game.game.challenger[i],'atk')
            data.game.game.challenger[i].commonDefense = this.cardCommonFusionStat(data.game.game.challenger[i],'def')
            data.game.game.challenger[i].commonLuck = this.cardCommonFusionStat(data.game.game.challenger[i],'luk')
            data.game.game.challenger[i].commonSpeed = this.cardCommonFusionStat(data.game.game.challenger[i],'spd')
            const common = (data.game.game.challenger[i].commonAttack === -21 &&
                data.game.game.challenger[i].commonDefense === -21 &&
                data.game.game.challenger[i].commonLuck === -21 &&
                data.game.game.challenger[i].commonSpeed === -21) ? -21 : 200
            data.game.game.challenger[i].commonMaxLife = common
            data.game.game.challenger[i].commonLife = common
        }
        return data
    }

    private static createMonsterEntityPlaying(data: SessionDto, cards: Array<CardsDto>): Array<PlayerCardsEntity> {
        const randomNum = Math.floor(Math.random() * 5) + 1;
        let tabMonsters: Array<PlayerCardsEntity> = []
        for (let i = 0; i < randomNum; i++) {
            const cardOne = cards[Math.floor(Math.random() * cards.length)];
            const cardTwo = cards[Math.floor(Math.random() * cards.length)];
            const cell = data.game.maps.cellsGrid[Math.floor(Math.random() * data.game.maps.cellsGrid.length)];
            const monsterOne: CardByEntityPlaying = {
                atk: cardOne.atk,
                def: cardOne.def,
                spd: cardOne.spd,
                luk: cardOne.luk,
                rarity: cardOne.rarity,
                imageSrc: cardOne.image,
                description: cardOne.description,
                name: cardOne.name,
                entityStatus: EntityStatus.ALIVE,
                effects: cardOne.effects,
                capacities: cardOne.capacities,
                player: this.randomMonsterName(),
            }
            const monsterTwo: CardByEntityPlaying = {
                atk: cardTwo.atk,
                def: cardTwo.def,
                spd: cardTwo.spd,
                luk: cardTwo.luk,
                rarity: cardTwo.rarity,
                imageSrc: cardTwo.image,
                description: cardTwo.description,
                entityStatus: EntityStatus.ALIVE,
                name: cardTwo.name,
                effects: cardTwo.effects,
                capacities: cardTwo.capacities,
                player: this.randomMonsterName(),
            }
            let monster = CardPlayerEntityModels.initPlayerCardsEntity(false, this.generateTeamNames([], 1)[0], [monsterOne, monsterTwo])
            tabMonsters.push(monster)
        }
        return tabMonsters;
    }

    private static noSimilarCellPosition(data: SessionDto, tabMonsters: Array<PlayerCardsEntity>) {
        let cells: Array<Cells> = []
        for (let i = 0; i < data.game.maps.cellsGrid.length; i++) {
            for (let j = 0; j < tabMonsters.length; j++) {
                if (data.game.maps.cellsGrid[i].id !== tabMonsters[j].cellPosition.id) {
                    cells.push(data.game.maps.cellsGrid[i])
                }
            }
        }
        return cells
    }

    private static rollingTunrBySpeedEntity(data: SessionDto) {
        const challenger = data.game.game.challenger ?? []
        let entityTurn: Array<EntityActionMoving> = []
        challenger.forEach((player, index) => {
            player.cardsInfo?.forEach((card, indexCard) => {
                if (card.player.avatar !== "" && card.player.pseudo !== "" && card.description !== "" && card.name !== "" && player.typeEntity === EntityCategorie.HUMAIN) {
                    entityTurn.push({
                        teamIndex: index,
                        cardIndex: indexCard,
                        typeEntity: EntityCategorie.HUMAIN,
                        playerCardsEntity: player,
                        currentCan: Can.NULL,
                    })
                } else if (card.player.avatar !== "" && card.player.pseudo !== "" && card.description !== "" && card.name !== "" && player.typeEntity === EntityCategorie.COMPUTER) {
                    entityTurn.push({
                        teamIndex: index,
                        cardIndex: indexCard,
                        typeEntity: EntityCategorie.COMPUTER,
                        playerCardsEntity: player,
                        currentCan: Can.NULL,
                    })
                }
            })
        })
        const turn = entityTurn.sort((a: EntityActionMoving, b: EntityActionMoving) => {
            return b.playerCardsEntity.commonSpeed - a.playerCardsEntity.commonSpeed
        });
        for (let i = 0; i < turn.length; i++) {
            turn[i].indexInsideArray = i
        }
        return turn
    }

    static countReturn(data: SessionDto) {
        let count = 0
        for (let i = 0; i < data.game.game.challenger.length; i++) {
            const cardsPlayer = data.game.game.challenger[i].cardsInfo ?? [];
            for (let j = 0; j < cardsPlayer.length; j++) {
                if (cardsPlayer[j].entityStatus === EntityStatus.ALIVE) {
                    count++
                }
            }
        }
        return count
    }

    static nextEntityTurn(data: SessionDto) {
        data.game.sessionStatusGame.entityTurn
    }

    static checkEntityPlay(data: SessionDto) {
        const currentEntityActionMovingPosition = data.game.sessionStatusGame.currentEntityActionMovingPosition
        const limitArrayTurn = data.game.sessionStatusGame.entityTurn.length
        if (currentEntityActionMovingPosition === -1) {
            data.game.sessionStatusGame.currentEntityActionMovingPosition = 0
            return FormatRestApiModels.createFormatRestApi(200, 'Entity Play', data, null);
        } else {
            if (currentEntityActionMovingPosition === limitArrayTurn - 1) {
                data.game.sessionStatusGame.currentEntityActionMovingPosition = 0
                data.game.sessionStatusGame.entityTurn = this.rollingTunrBySpeedEntity(data)
                return FormatRestApiModels.createFormatRestApi(200, 'Entity Play', data, null);
            } else {
                data.game.sessionStatusGame.currentEntityActionMovingPosition = currentEntityActionMovingPosition + 1
                return FormatRestApiModels.createFormatRestApi(200, 'Entity Play', data, null);
            }
        }
    }

    static humainAction(
        data: SessionDto,
        teamIndex: number,
        cardIndex: number,
        dice: number | null,
        movesCans: Array<Cells> | null,
        moveTo: Cells | null,
        currentCan: Can) {
        const turnList = data.game.sessionStatusGame.entityTurn ?? []
        const currentEntityActionMovingPosition = data.game.sessionStatusGame.currentEntityActionMovingPosition

        if (turnList.length === 0) {
            return FormatRestApiModels.createFormatRestApi(400, 'No entity turn', null, null);
        } else {
            const teamIndexInTurnList = turnList[currentEntityActionMovingPosition].teamIndex
            const cardIndexInTurnList = turnList[currentEntityActionMovingPosition].cardIndex
            if (turnList[currentEntityActionMovingPosition].typeEntity !== EntityCategorie.HUMAIN) return FormatRestApiModels.createFormatRestApi(400, 'Entity is not Humain', null, null);
            if (teamIndexInTurnList !== teamIndex && cardIndexInTurnList !== cardIndex) return FormatRestApiModels.createFormatRestApi(400, 'Entity is not Humain', null, null);
            switch (currentCan) {
                case Can.START_TURN:
                    data.game.sessionStatusGame.entityTurn[currentEntityActionMovingPosition].currentCan = Can.SEND_DICE
                    return FormatRestApiModels.createFormatRestApi(200, 'Entity Play START_TURN', data, null);
                case Can.SEND_DICE:
                    if (dice === null) return FormatRestApiModels.createFormatRestApi(400, 'Dice is null', null, null);
                    data.game.sessionStatusGame.entityTurn[currentEntityActionMovingPosition].currentCan = Can.CHOOSE_MOVE
                    return FormatRestApiModels.createFormatRestApi(200, 'Entity Play SEND_DICE', data, null);
                case Can.CHOOSE_MOVE:
                    if (movesCans === null) return FormatRestApiModels.createFormatRestApi(400, 'movesCans is null', null, null);
                    data.game.sessionStatusGame.entityTurn[currentEntityActionMovingPosition].currentCan = Can.MOVE
                    return FormatRestApiModels.createFormatRestApi(200, 'Entity Play CHOOSE_MOVE', data, null);
                case Can.MOVE:
                    if (moveTo === null) return FormatRestApiModels.createFormatRestApi(400, 'moveTo is null', null, null);
                    const checkIfFightConditionIsOk = this.checkIfFightConditionIsOk(data, teamIndex, cardIndex, moveTo)
                    if (this.codeErrorChecking(checkIfFightConditionIsOk.code)) return FormatRestApiModels.createFormatRestApi(
                        400, checkIfFightConditionIsOk.message, checkIfFightConditionIsOk.data, checkIfFightConditionIsOk.error);
                    data = checkIfFightConditionIsOk.data
                    if(!checkIfFightConditionIsOk.data.fight){
                        data.game.sessionStatusGame.entityTurn[currentEntityActionMovingPosition].currentCan = Can.FINISH_TURN
                        return FormatRestApiModels.createFormatRestApi(200, 'Entity Play MOVE', data, null);
                    }else{
                        return FormatRestApiModels.createFormatRestApi(200, 'Entity Play MOVE', Can.START_FIGHT, null);
                    }
                case Can.FINISH_TURN:
                    data.game.sessionStatusGame.entityTurn[currentEntityActionMovingPosition].currentCan = Can.START_TURN
                    const next  = this.checkEntityPlay(data)
                    if (this.codeErrorChecking(next.code)) return FormatRestApiModels.createFormatRestApi(
                        400, next.message, next.data, next.error);
                    data = next.data
                    return FormatRestApiModels.createFormatRestApi(200, 'Entity Play FINISH_TURN', data, null);
                case Can.START_FIGHT:
                    break
                default:
                    break
            }
        }
    }

    static updateEntityPosition(data: SessionDto, teamIndex: number,moveTo: Cells) {
        // update inside data.game.sessionStatusGame.entityTurn
        for (let i = 0; i < data.game.sessionStatusGame.entityTurn.length; i++) {
            if(data.game.sessionStatusGame.entityTurn[i].teamIndex === teamIndex){
                data.game.sessionStatusGame.entityTurn[i].playerCardsEntity.cellPosition = moveTo
            }
        }
        // update inside data.game.game.challenger
        for (let i = 0; i < data.game.game.challenger.length; i++) {
            if(i === teamIndex){
                data.game.game.challenger[i].cellPosition = moveTo
            }
        }
        return data
    }

    static checkIfFightConditionIsOk(data: SessionDto, teamIndex: number, cardIndex: number, moveTo: Cells) {
        let player:Array<EntityActionMoving> = [];
        data.game.sessionStatusGame.entityTurn.filter((entityActionMoving: EntityActionMoving) =>{
            if(entityActionMoving.playerCardsEntity.cellPosition.id === moveTo.id){
                player.push(entityActionMoving)
            }
        })
        if(player.length === 0) {
            return FormatRestApiModels.createFormatRestApi(400, 'No entity in this cell', null, null);
        }else if(player.length === 1) {
            // reset toutes les position lié au player dans la liste
            const resetPosition = this.updateEntityPosition(data, teamIndex, moveTo)
            return  FormatRestApiModels.createFormatRestApi(200, 'One entity in this cell', {
                update : resetPosition,
                fight : false
            }, null);
        }else if (player.length === 2) {
           // crée l'instance de combat
            const resetPosition = this.updateEntityPosition(data, teamIndex, moveTo)
            const fightSession = this.updateFightSession(resetPosition, teamIndex, moveTo)
            return FormatRestApiModels.createFormatRestApi(200, 'Two entity in this cell',
                {
                    update:fightSession,
                    fight : true
                }, null);
        }else{
            return FormatRestApiModels.createFormatRestApi(400, 'More than two entity in this cell', null, null);
        }
    }

    static updateFightSession(data: SessionDto, teamIndex: number, moveTo: Cells) {
        data = this.updateEntityPosition(data, teamIndex, moveTo)
        let fightSession: FightSession  = SessionModels.initFightSession()
        let challenger:Array<PlayerCardsEntity> = []
        data.game.game.challenger.filter((player: PlayerCardsEntity) =>{
            if(player.cellPosition.id === moveTo.id){
                challenger.push(player)
            }
        })
        data.game.game.challenger.filter((player: PlayerCardsEntity) => player.name !== challenger[0].name || player.name !== challenger[1].name)
        data.game.sessionStatusGame.entityTurn.filter((entityActionMoving: EntityActionMoving) => entityActionMoving.playerCardsEntity.name !== challenger[0].name || entityActionMoving.playerCardsEntity.name !== challenger[1].name)
        fightSession.challenger = challenger
        fightSession.currentEntityActionFightPosition = 0
        const titleKey = `${challenger[0].name} VS ${challenger[1].name}`
        data.game.game.fightings.set(titleKey, fightSession)
        return data
    }
}
