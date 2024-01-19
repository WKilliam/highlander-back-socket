import {Cells} from "../models/maps.models";
import {SessionDto} from "../dto/session.dto";
import {FormatRestApi, FormatRestApiModels} from "../models/formatRestApi";
import {CardByEntityPlaying, CardsModels} from "../models/cards.models";
import {CardPlayerEntityModels, PlayerCardsEntity} from "../models/cards.player.entity.models";
import {PlayerLobby, PlayerModels} from "../models/player.models";
import {CardsDto} from "../dto/cards.dto";
import {Can, EntityCategorie, EntityStatus} from "../models/enums";
import {EntityActionMoving, EntityEvolving, EntityResume} from "../models/actions.game.models";
import {FightSession, SessionGame, SessionModels} from "../models/session.models";
import {CellsDto} from "../dto/cells.dto";
import {MasterMaidData} from "../models/users.models";
import {pipeline} from "stream";

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
            status: EntityStatus.ALIVE
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

    // convert list of cells to matrix
    static convertListCellsToMatrix(listeCellules: Cells[]): Cells[][] {
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
    static getGridIndices(cells: Cells[]) {
        let gridCellData: Cells[][] = this.convertListCellsToMatrix(cells)
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
    static findCellsAtDistance(cells: Cells[], startId: number, distance: number) {
        const result: Cells[] = [];
        let startX: number | null = null;
        let startY: number | null = null;
        let gridCells = this.convertListCellsToMatrix(cells)
        gridCells.forEach((rowArray, rowIndex) => {
            rowArray.forEach((cell, colIndex) => {
                if (cell.id === startId) {
                    startX = rowIndex;
                    startY = colIndex;
                }
            });
        });

        if (startX === null || startY === null) {
            return FormatRestApiModels.createFormatRestApi(400, 'Start cell not found.', null, null);
        } else {
            const {minX, maxX, minY, maxY} = this.getGridIndices(result);
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const dx = Math.abs(x - startY);
                    const dy = Math.abs(y - startX);
                    const manhattanDistance = dx + dy;
                    if (manhattanDistance === distance) {
                        result.push(gridCells[y][x]);
                    }
                }
            }
            return FormatRestApiModels.createFormatRestApi(200, 'Cells found.', result, null);
        }
    }

    static codeErrorChecking(code: number): boolean {
        return code < 200 || code > 299;
    }

    static setPlayerTeam(data: SessionDto, lobbyPosition: number, teamPosition: number, cardPosition: number, cardByPlayer: number | null = null) {
        // Check if teams[teamPosition].cardsPlayer[cardPosition] is not already taken
        let userInformation: PlayerLobby = data.game.sessionStatusGame.lobby[lobbyPosition];
        let challenger: PlayerCardsEntity = (data.game && data.game.game && data.game.game.challenger && data.game.game.challenger[teamPosition]) ?? PlayerModels.initPlayerCards();
        let cardInfo: CardByEntityPlaying = (challenger.cardsInfo && challenger.cardsInfo[cardPosition]) ?? CardsModels.initCardByEntityPlaying();
        if (
            cardInfo.player.avatar !== '' &&
            cardInfo.player.pseudo !== '' &&
            cardInfo.player.avatar !== userInformation.avatar &&
            cardInfo.player.pseudo !== userInformation.pseudo) {
            // card is already taken by another player
            return FormatRestApiModels.createFormatRestApi(400, 'The seat is already taken.', null, null);
        }
        // set the card to the player
        const challenge = this.setOnlyPlayerInChallenger(data.game.game.challenger, userInformation, cardByPlayer, teamPosition, cardPosition)
        data.game.game.challenger = challenge
        // check if another team has the card
        data.game.game.challenger = this.checkAnotherTeamRefresh(data.game.game.challenger, teamPosition, cardPosition, userInformation);
        return FormatRestApiModels.createFormatRestApi(200, 'Card Change', data, null);
    }

    static setOnlyPlayerInChallenger(challenger: Array<PlayerCardsEntity>, playerLobby: PlayerLobby, cardByPlayer: number | null, teamPosition: number, cardPosition: number): Array<PlayerCardsEntity> {
        return challenger.map((team, currentTeamIndex) => {
            if (currentTeamIndex === teamPosition) {
                team.cardsInfo = team.cardsInfo?.map((card, currentCardIndex) => {
                    if (typeof cardByPlayer === 'number' && currentCardIndex === cardPosition) {
                        // Mettre à jour la carte spécifique avec les informations du joueur
                        return {
                            player: {
                                avatar: playerLobby.avatar,
                                pseudo: playerLobby.pseudo,
                                status: EntityStatus.ALIVE
                            },
                            atk: playerLobby.cards[cardByPlayer].atk,
                            def: playerLobby.cards[cardByPlayer].def,
                            spd: playerLobby.cards[cardByPlayer].spd,
                            luk: playerLobby.cards[cardByPlayer].luk,
                            description: playerLobby.cards[cardByPlayer].description,
                            name: playerLobby.cards[cardByPlayer].name,
                            rarity: playerLobby.cards[cardByPlayer].rarity,
                            imageSrc: playerLobby.cards[cardByPlayer].image,
                            effects: playerLobby.cards[cardByPlayer].effects,
                            capacities: playerLobby.cards[cardByPlayer].capacities,
                        };
                    } else if (cardByPlayer === null) {
                        // Mettre à jour toutes les cartes de l'équipe avec les informations du joueur
                        return {
                            ...card,
                            player: {
                                avatar: playerLobby.avatar,
                                pseudo: playerLobby.pseudo,
                                status: EntityStatus.ALIVE
                            },
                        };
                    }
                    return card;
                });
            }
            return team;
        });
    }

    static checkAnotherTeamRefresh(challenger: Array<PlayerCardsEntity>, teamPosition: number, cardPosition: number, userInformation: PlayerLobby) {
        let refreshChallenger: Array<PlayerCardsEntity> = challenger.map((player, teamIndex) => {
            // Cloner les informations du joueur
            let updatedPlayer = {...player};
            // Réinitialiser les cartes correspondant aux critères, sauf à la position spécifiée
            updatedPlayer.cardsInfo = player.cardsInfo?.map((card, indexCard) => {
                if (teamIndex !== teamPosition || indexCard !== cardPosition) {
                    if (card.player.avatar === userInformation.avatar && card.player.pseudo === userInformation.pseudo) {
                        return CardsModels.initCardByEntityPlaying(); // Réinitialisation de la carte
                    }
                }
                return card; // Conserver la carte telle quelle
            });
            return updatedPlayer;
        });
        return refreshChallenger;
    }

    static countReturn(data: SessionDto) {
        let count = 0
        for (let i = 0; i < data.game.game.challenger.length; i++) {
            const cardsPlayer = data.game.game.challenger[i].cardsInfo ?? [];
            for (let j = 0; j < cardsPlayer.length; j++) {
                if (cardsPlayer[j].player.status === EntityStatus.ALIVE) {
                    count++
                }
            }
        }
        return count
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

    private static rollingTunrBySpeedEntity(data: SessionDto) {
        const challenger = data.game.game.challenger ?? []
        let entityTurn: Array<EntityActionMoving> = []
        challenger.forEach((player, index) => {
            player.cardsInfo?.forEach((card, indexCard) => {
                if (card.player.avatar !== "" && card.player.pseudo !== "" && card.description !== "" && card.name !== "" && player.typeEntity === EntityCategorie.HUMAIN) {
                    const entityActionMoving: EntityActionMoving = {
                        resume: {
                            teamIndex: index,
                            cardIndex: indexCard,
                            entityStatus: EntityStatus.ALIVE,
                            currentCellsId: player.cellPosition.id ?? -1,
                            typeEntity: EntityCategorie.HUMAIN,
                            indexInsideArray: -1,
                            cardPlaying: card,
                            speed: card.spd
                        },
                        evolving: {
                            dice: null,
                            movesCansIds: null,
                            moveToId: null,
                            currentCan: Can.NULL
                        }
                    }
                    entityTurn.push(entityActionMoving)
                } else if (card.player.avatar !== "" && card.player.pseudo !== "" && card.description !== "" && card.name !== "" && player.typeEntity === EntityCategorie.COMPUTER) {
                    const entityActionMoving: EntityActionMoving = {
                        resume: {
                            teamIndex: index,
                            cardIndex: indexCard,
                            entityStatus: EntityStatus.ALIVE,
                            currentCellsId: player.cellPosition.id ?? -1,
                            typeEntity: EntityCategorie.COMPUTER,
                            indexInsideArray: -1,
                            cardPlaying: card,
                            speed: card.spd
                        },
                        evolving: {
                            dice: null,
                            movesCansIds: null,
                            moveToId: null,
                            currentCan: Can.NULL
                        }
                    }
                    entityTurn.push(entityActionMoving)
                }
            })
        })
        const turn = entityTurn.sort((a: EntityActionMoving, b: EntityActionMoving) => {
            return b.resume.speed - a.resume.speed
        });
        for (let i = 0; i < turn.length; i++) {
            turn[i].resume.indexInsideArray = i
        }
        return turn
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

    static initializeChallenger(challenger: Array<PlayerCardsEntity>, cells: Array<Cells>) {
        let cellsIds: Array<number> = [];
        return challenger.map(team => {
            let shouldInitialize = false;

            // Vérifier si l'équipe est active
            team?.cardsInfo?.forEach(card => {
                if (card.atk !== -21 || card.def !== -21 || card.spd !== -21 || card.luk !== -21) {
                    shouldInitialize = true;
                }
            });
            if (shouldInitialize) {
                // Initialiser les valeurs communes
                team.commonAttack = team.cardsInfo?.map(card => card.atk !== -21 ? card.atk : 0).reduce((a, b) => a + b, 0) ?? 0;
                team.commonDefense = team.cardsInfo?.map(card => card.def !== -21 ? card.def : 0).reduce((a, b) => a + b, 0) ?? 0;
                team.commonLuck = team.cardsInfo?.map(card => card.luk !== -21 ? card.luk : 0).reduce((a, b) => a + b, 0) ?? 0;
                team.commonSpeed = team.cardsInfo?.map(card => card.spd !== -21 ? card.spd : 0).reduce((a, b) => a + b, 0) ?? 0;
                team.commonLife = 200;
                team.commonMaxLife = 200;

                const allCells = cells ?? [];
                // check if cellsIds contains value random
                let randomIndex = Math.floor(Math.random() * allCells.length);
                while (cellsIds.includes(randomIndex)) {
                    randomIndex = Math.floor(Math.random() * allCells.length);
                }
                team.cellPosition = allCells[randomIndex];
                cellsIds.push(randomIndex);
            }
            return team;
        });
    }

    static createGameContent(data: SessionDto, cards: Array<CardsDto>) {
        const monsterCreate = this.createMonsterEntityPlaying(data, cards)
        const challenger = data.game.game.challenger.concat(monsterCreate)
        data.game.game.challenger = this.initializeChallenger(challenger, data.game.maps.cellsGrid)
        data.game.sessionStatusGame.entityTurn = this.rollingTunrBySpeedEntity(data)
        return data
    }


    static caseNULL(data: SessionDto, entityResume: EntityResume) {
        const turnListPosition = entityResume.indexInsideArray
        data.game.sessionStatusGame.entityTurn[turnListPosition].evolving = {
            dice: null,
            movesCansIds: null,
            moveToId: null,
            currentCan: Can.START_TURN
        }
        return FormatRestApiModels.createFormatRestApi(200, 'Null', data, null);
    }


    static caseSTART_TURN(data: SessionDto, entityResume: EntityResume) {
        const turnListPosition = entityResume.indexInsideArray
        data.game.sessionStatusGame.entityTurn[turnListPosition].evolving = {
            dice: null,
            movesCansIds: null,
            moveToId: null,
            currentCan: Can.SEND_DICE
        }
        return FormatRestApiModels.createFormatRestApi(200, 'Start Turn', data, null);
    }

    static caseSEND_DICE(data: SessionDto, entityResume: EntityResume, entityEvolving: EntityEvolving) {
        const turnListPosition = entityResume.indexInsideArray
        if (entityEvolving.dice !== null) {
            const movesCansIds = this.findCellsAtDistance(data.game.maps.cellsGrid, entityResume.currentCellsId, entityEvolving.dice)
            if (this.codeErrorChecking(movesCansIds.code)) return FormatRestApiModels.createFormatRestApi(movesCansIds.code, movesCansIds.message, movesCansIds.data, movesCansIds.error);
            data.game.sessionStatusGame.entityTurn[turnListPosition].evolving = {
                dice: entityEvolving.dice,
                movesCansIds: movesCansIds.data,
                moveToId: null,
                currentCan: Can.CHOOSE_MOVE
            }
            return FormatRestApiModels.createFormatRestApi(200, 'Dice is send', data, null);
        } else {
            return FormatRestApiModels.createFormatRestApi(400, 'Dice is null', null, null);
        }
    }

    static caseCHOOSE_MOVE(data: SessionDto, entityResume: EntityResume, entityEvolving: EntityEvolving) {
        const turnListPosition = entityResume.indexInsideArray
        const valueMoveToId = entityEvolving.moveToId  ?? -1
        if (valueMoveToId === -1 && entityEvolving.movesCansIds === null) {
            return FormatRestApiModels.createFormatRestApi(400, 'MoveToId and MovesCansIds is null', null, null);
        } else {
            data.game.sessionStatusGame.entityTurn[turnListPosition].evolving = {
                dice: entityEvolving.dice,
                movesCansIds: entityEvolving.movesCansIds,
                moveToId: entityEvolving.moveToId,
                currentCan: Can.MOVE
            }
            const errorFormatCells = {id: -1, x: -1, y: -1, value: -1}
            const moveCellSelected = data.game.maps.cellsGrid.find(cell => cell.id === entityEvolving.moveToId)
            if (moveCellSelected === undefined) return FormatRestApiModels.createFormatRestApi(400, 'MoveToId is not found', null, null);
            data.game.game.challenger[entityResume.teamIndex].cellPosition = moveCellSelected ?? errorFormatCells
            if (data.game.game.challenger[entityResume.teamIndex].cellPosition.id === -1) return FormatRestApiModels.createFormatRestApi(400, 'MoveToId is not found', null, null);
            data.game.sessionStatusGame.entityTurn.map((entityActionMoving, index) => {
                if (entityActionMoving.resume.teamIndex === entityResume.teamIndex && index !== turnListPosition) {
                    data.game.sessionStatusGame.entityTurn[index].resume.currentCellsId = valueMoveToId
                }
            })
            return FormatRestApiModels.createFormatRestApi(200, 'Move is choose', data, null);
        }
    }

    static caseMOVE(data: SessionDto, entityResume: EntityResume, entityEvolving: EntityEvolving) {
        const turnListPosition = entityResume.indexInsideArray
        let isFitghtOrNot = false
        let teamIndexChallenger = -1
        data.game.game.challenger.forEach((player, index) => {
            isFitghtOrNot = (player.cellPosition.id === data.game.game.challenger[entityResume.teamIndex].cellPosition.id && index !== entityResume.teamIndex)
            if (isFitghtOrNot) teamIndexChallenger = index
        })

        if(!isFitghtOrNot) {
            data.game.sessionStatusGame.entityTurn[turnListPosition].evolving = {
                dice: entityEvolving.dice,
                movesCansIds: entityEvolving.movesCansIds,
                moveToId: entityEvolving.moveToId,
                currentCan: Can.FINISH_TURN
            }
            return FormatRestApiModels.createFormatRestApi(200, 'Move is finish', data, null);
        }else{
            let tabEntityFight: Array<PlayerCardsEntity> = []
            tabEntityFight.push(data.game.game.challenger[entityResume.teamIndex])
            data.game.game.challenger.splice(entityResume.teamIndex, 1)
            tabEntityFight.push(data.game.game.challenger[teamIndexChallenger])
            data.game.game.challenger.splice(teamIndexChallenger, 1)
            data.game.sessionStatusGame.entityTurn.forEach((entityActionMoving, index) => {
                if(entityActionMoving.resume.teamIndex === entityResume.teamIndex || entityActionMoving.resume.teamIndex === teamIndexChallenger) {
                    data.game.sessionStatusGame.entityTurn.splice(index, 1)
                }
            })
            data.game.sessionStatusGame.currentEntityActionMovingPosition = 0
            let fightSession = SessionModels.initFightSession()
            let map : Map<string,FightSession> = new Map<string,FightSession>()
            map.set(`${tabEntityFight[0].name}-VS-${tabEntityFight[1].name}`,fightSession)
            data.game.game.fightings = map
            return FormatRestApiModels.createFormatRestApi(200, 'Move is finish', data, null);
        }
    }

    static caseFINISH_TURN(data: SessionDto, entityResume: EntityResume, entityEvolving: EntityEvolving) {
        const turnListPosition = entityResume.indexInsideArray
        data.game.sessionStatusGame.entityTurn[turnListPosition].evolving = {
            dice: entityEvolving.dice,
            movesCansIds: entityEvolving.movesCansIds,
            moveToId: entityEvolving.moveToId,
            currentCan: Can.FINISH_TURN
        }
        return FormatRestApiModels.createFormatRestApi(200, 'Finish Turn', data, null);
    }


    static pingMaidMasterSend(data: SessionDto,room:string,queueClientActionCall: Map<string,MasterMaidData>) {
        if(!queueClientActionCall.has(room)){
            const masterMaidData: MasterMaidData = {
                lobbyPosition: 0,
                valid: false,
                countCheckError: 0
            }
            return FormatRestApiModels.createFormatRestApi(200, 'Lobby Position is send', masterMaidData, null);
        }else{
            const userMaid = queueClientActionCall.get(room)?.lobbyPosition ?? -1
            if (userMaid === -1) return FormatRestApiModels.createFormatRestApi(400, 'Lobby Position is not found', null, null);
            const limitLobbyPosition = data.game.sessionStatusGame.lobby.length - 1
            const  countCheckError = queueClientActionCall.get(room)?.countCheckError ?? 0
            if(userMaid + 1 > limitLobbyPosition) {
                return FormatRestApiModels.createFormatRestApi(200, 'Lobby Position is send', {lobbyPosition:0,valid:false,countCheckError:countCheckError + 1}, null);
            }else{
                queueClientActionCall.set(room,{lobbyPosition:0,valid:false,countCheckError:countCheckError + 1})
                return FormatRestApiModels.createFormatRestApi(200, 'Lobby Position is send', {lobbyPosition:userMaid + 1,valid:false,countCheckError:countCheckError + 1}, null);
            }
        }
    }
}
