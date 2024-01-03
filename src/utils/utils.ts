import {Cells} from "../models/maps.models";
import {SessionDto} from "../dto/session.dto";
import {FormatRestApiModels} from "../models/formatRestApi";
import {CardByEntityPlaying, CardEntitySimplify, CardsModels} from "../models/cards.models";
import {PlayerCardsEntity} from "../models/cards.player.entity.models";
import {PlayerLobby} from "../models/player.models";

export class Utils {

    // static randomName(teamEntityPlaying: Array<EntityPlaying>) {
    //     let nomsMonstres = [
    //         "Ombre Funeste",
    //         "Griffes de Nuit",
    //         "Fléau Ténébreux",
    //         "Harpies Maudites",
    //         "Gargouilles Infernales",
    //         "Hydra de l'Ombre",
    //         "Chimère Dévoreuse",
    //         "Basilic Venimeux",
    //         "Démons Sanguinaires",
    //         "Minotaure Furieux",
    //         "Spectres Vengeurs",
    //         "Gobelins Maléfiques",
    //         "Loups Nocturnes",
    //         "Dragon de l'Abîme",
    //         "Goules Affamées",
    //         "Kraken Abyssal",
    //         "Wyvernes Sombres",
    //         "Banshees Hurlantes",
    //         "Gobelins des Marais",
    //         "Liche Immortelle"
    //     ];
    //     const generateUniqueName = (): string => {
    //         let newName = nomsMonstres[Math.floor(Math.random() * nomsMonstres.length)];
    //         while (teamEntityPlaying.some(entity => entity.name === newName)) {
    //             newName = nomsMonstres[Math.floor(Math.random() * nomsMonstres.length)];
    //         }
    //         return newName;
    //     };
    //     return generateUniqueName();
    // }
    //
    //

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
        let teams = data.game.game.teams ?? []
        let lobby = data.game.sessionStatusGame.lobby ?? []

        // Check if teams[teamPosition].cardsPlayer[cardPosition] is not already taken
        let userInformation = lobby[lobbyPosition];
        let checkSession = teams[teamPosition].cardsPlayer ?? [];
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
            data.game.game.teams = checkAnotherTeamRefresh.data
            return FormatRestApiModels.createFormatRestApi(200, 'Card Change', data, null);
        }
    }

    private static setCardByPlayer(teams: Array<PlayerCardsEntity>, teamPosition: number, cardPosition: number, userInformation: PlayerLobby, cardByPlayer: number | null) {
        for (let i = 0; i < teams.length; i++) {
            const sessionEndPoint = teams[i].cardsPlayer ?? [];
            for (let j = 0; j < sessionEndPoint.length; j++) {
                const ifIsPlayer = sessionEndPoint[j].player?.avatar === userInformation.avatar && sessionEndPoint[j].player?.pseudo === userInformation.pseudo
                const ifIsEmptyRender = sessionEndPoint[j].player?.avatar === "" && sessionEndPoint[j].player?.pseudo === ""
                const ifIsCoordonate = j === cardPosition && i === teamPosition
                if (ifIsEmptyRender && ifIsCoordonate) {
                    if (ifIsPlayer || ifIsEmptyRender) {
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
        }
        return FormatRestApiModels.createFormatRestApi(200, 'Card Change', teams, null);
    }

    private static checkAnotherTeamRefresh(teams: Array<PlayerCardsEntity>, teamPosition: number, cardPosition: number, userInformation: PlayerLobby) {
        for (let i = 0; i < teams.length; i++) {
            const sessionEndPoint = teams[i].cardsPlayer ?? [];
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

//
    // // convert list of cells to matrix
    // static convertListCellsToMatrix(listeCellules: Cells[]): Cells[][] {
    //     const mapWidth: number = 936;
    //     const mapHeight: number = 620;
    //     const cellWidth = 32;
    //     const cellHeight = 32;
    //     const numCols = Math.floor(mapWidth / cellWidth);
    //     const numRows = Math.floor(mapHeight / cellHeight);
    //     let gridCellData: Cells[][] = [];
    //     let cellId = 1;
    //
    //     for (let row = 0; row < numRows; row++) {
    //         const rowArray: Cells[] = [];
    //         for (let col = 0; col < numCols; col++) {
    //             const existingCell = listeCellules.find(cell => cell.id === cellId);
    //             const cell: Cells = existingCell || {
    //                 id: cellId,
    //                 x: col * cellWidth + 5,
    //                 y: row * cellHeight + 5,
    //                 value: 1,
    //             };
    //             rowArray.push(cell);
    //             cellId++;
    //         }
    //         gridCellData.push(rowArray);
    //     }
    //     return gridCellData;
    // }
    //
    // // get limit of grid
    // static getGridIndices(cells: Cells[]): GridLimit {
    //     let gridCellData: Cells[][] = this.convertListCellsToMatrix(cells)
    //     const numRows = gridCellData.length;
    //     const numCols = gridCellData[0].length;
    //     const minX = 0;
    //     const maxX = numCols - 1;
    //     const minY = 0;
    //     const maxY = numRows - 1;
    //     console.log(`Limites de la matrice : minRow=${minX}, maxRow=${maxX}, minCol=${minY}, maxCol=${maxY}`);
    //     return {minX, maxX, minY, maxY};
    // }
    //
    //
    // // give posibility to move player
    // static findCellsAtDistance(cells: Cells[], startId: number, distance: number) {
    //     const result: Cells[] = [];
    //     let startX: number | null = null;
    //     let startY: number | null = null;
    //     let gridCells = this.convertListCellsToMatrix(cells)
    //     gridCells.forEach((rowArray, rowIndex) => {
    //         rowArray.forEach((cell, colIndex) => {
    //             if (cell.id === startId) {
    //                 startX = rowIndex;
    //                 startY = colIndex;
    //             }
    //         });
    //     });
    //
    //     if (startX === null || startY === null) {
    //         return FormatRestApiModels.createFormatRestApi(400, 'Start cell not found.', null, null);
    //     }
    //     const {minX, maxX, minY, maxY} = this.getGridIndices(result);
    //     for (let x = minX; x <= maxX; x++) {
    //         for (let y = minY; y <= maxY; y++) {
    //             const dx = Math.abs(x - startY);
    //             const dy = Math.abs(y - startX);
    //             const manhattanDistance = dx + dy;
    //             if (manhattanDistance === distance) {
    //                 result.push(gridCells[y][x]);
    //             }
    //         }
    //     }
    //     return FormatRestApiModels.createFormatRestApi(200, 'Cells found.', result, null);
    // }
    //
    //

    //
    // static initTeamEntityPlaying(teamName: Array<string>): Array<EntityPlaying> {
    //     let teamEntityPlaying: Array<EntityPlaying> = [];
    //     for (let i = 0; i < teamName.length; i++) {
    //         teamEntityPlaying.push({
    //             name: teamName[i],
    //             commonLife: -1,
    //             commonMaxLife: -1,
    //             commonAttack: -1,
    //             commonDefense: -1,
    //             commonLuck: -1,
    //             commonSpeed: -1,
    //             cellPosition: {
    //                 id: -1,
    //                 x: -1,
    //                 y: -1,
    //                 value: -1
    //             },
    //             entityStatus: EntityStatus.ALIVE,
    //             cardsPlayer: [
    //                 {
    //                     player: {
    //                         avatar: '',
    //                         pseudo: '',
    //                     },
    //                     atk: -1,
    //                     def: -1,
    //                     spd: -1,
    //                     luk: -1,
    //                     description: '',
    //                     name: '',
    //                     rarity: '',
    //                     status: EntityStatus.ALIVE,
    //                     imageSrc: '',
    //                     effects: [],
    //                     capacities: [],
    //                 },
    //                 {
    //                     player: {
    //                         avatar: '',
    //                         pseudo: '',
    //                     },
    //                     atk: -1,
    //                     def: -1,
    //                     spd: -1,
    //                     luk: -1,
    //                     description: '',
    //                     name: '',
    //                     rarity: '',
    //                     status: EntityStatus.ALIVE,
    //                     imageSrc: '',
    //                     effects: [],
    //                     capacities: [],
    //                 }
    //             ],
    //         });
    //     }
    //     return teamEntityPlaying;
    // }
    //
    // static initTeamEntityPlayingWithCards(
    //     session: Array<EntityPlaying>,
    //     lobby: Array<PlayerLobby>,
    //     lobbyPosition: number,
    //     teamPosition: number,
    //     cardPosition: number
    // ) {
    //     let checkUpSession = session ?? []
    //     let checkUpLobby = lobby ?? []
    //     let checkUpLobbyPosition = lobbyPosition ?? -1
    //     let checkUpTeamPosition = teamPosition ?? -1
    //     let checkUpCardPosition = cardPosition ?? -1
    //     if(checkUpSession.length === 0 || checkUpLobby.length === 0 || checkUpLobbyPosition === -1 || checkUpTeamPosition === -1 || checkUpCardPosition === -1){
    //         return FormatRestApiModels.createFormatRestApi(400, 'Error initTeamEntityPlayingWithCards', null, null);
    //     }else{
    //         const userInformation = lobby[lobbyPosition];
    //         const checkSession = session[teamPosition].cardsPlayer ?? [];
    //         if (checkSession.length === 0) {
    //             return FormatRestApiModels.createFormatRestApi(400, 'The seat is already taken.', null, null);
    //         }
    //
    //         // Vérifier si le joueur demandant n'est pas déjà placé dans une autre carte
    //         let isUserPlaced = false;
    //         for (let i = 0; i < session.length; i++) {
    //             const sessionEndPoint = session[i].cardsPlayer ?? [];
    //             if(sessionEndPoint.length === 0){
    //                 return FormatRestApiModels.createFormatRestApi(400, 'Error initTeamEntityPlayingWithCards', null, null);
    //             }else{
    //                 for (let j = 0; j < sessionEndPoint.length; j++) {
    //                     if (sessionEndPoint[j].player?.avatar === userInformation.avatar &&
    //                         sessionEndPoint[j].player?.pseudo === userInformation.pseudo) {
    //                         isUserPlaced = true;
    //                         break;
    //                     }
    //                 }
    //             }
    //
    //             if (isUserPlaced) break;
    //         }
    //
    //         // Si le joueur demandant n'est pas déjà placé
    //         if (!isUserPlaced) {
    //             // Set session[teamPosition].cardsPlayer[cardPosition] par les informations du joueur
    //             checkSession[cardPosition] = {
    //                 atk: -1,
    //                 def: -1,
    //                 spd: -1,
    //                 luk: -1,
    //                 rarity: '',
    //                 imageSrc: '',
    //                 description: '',
    //                 name: '',
    //                 effects: [],
    //                 capacities: [],
    //                 status: EntityStatus.ALIVE,
    //                 player: {
    //                     avatar: userInformation.avatar,
    //                     pseudo: userInformation.pseudo,
    //                 },
    //             };
    //
    //             // Supprimer l'ancienne position du joueur s'il existe
    //             for (let i = 0; i < session.length; i++) {
    //                 const sessionEndPoint = session[i].cardsPlayer ?? [];
    //                 for (let j = 0; j < sessionEndPoint.length; j++) {
    //                     if (sessionEndPoint[j].player?.avatar === userInformation.avatar &&
    //                         sessionEndPoint[j].player?.pseudo === userInformation.pseudo &&
    //                         (i !== teamPosition || j !== cardPosition)) {
    //                         sessionEndPoint[j] = {
    //                             atk: -1,
    //                             def: -1,
    //                             spd: -1,
    //                             luk: -1,
    //                             rarity: '',
    //                             imageSrc: '',
    //                             description: '',
    //                             name: '',
    //                             effects: [],
    //                             capacities: [],
    //                             status: EntityStatus.ALIVE,
    //                             player: {
    //                                 avatar: '',
    //                                 pseudo: '',
    //                             },
    //                         };
    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //         return FormatRestApiModels.createFormatRestApi(200, 'Card Change', session, null);
    //     }
    // }
    //
    //
    // // static initPlaceTeamCard(
    // //     data: JoinSessionTeamCard,
    // //     session: Array<EntityPlaying>,
    // //     lobby: Array<PlayerLobby>,
    // // ): FormatRestApiModels {
    // //     // Vérifier si la position dans cardPlayer n'est pas déjà prise
    // //     const existingPlayer: PlayerLobby = lobby[data.lobbyPosition];
    // //     const placeIsTaken = session[data.teamPosition].cardsPlayer ?? [];
    // //     const cardSelected = lobby[data.lobbyPosition].cards[data.cardByPlayer];
    // //     if (existingPlayer.pseudo === '' || existingPlayer.avatar === '') {
    // //         return FormatRestApiModels.createFormatRestApi(400, 'Player not found.', null, null);
    // //     }
    // //     if (placeIsTaken[data.cardPosition].player?.pseudo !== existingPlayer.pseudo && placeIsTaken[data.cardPosition].player?.avatar !== existingPlayer.avatar) {
    // //         return FormatRestApiModels.createFormatRestApi(400, 'The seat does not belong to the player.', null, null);
    // //     }
    // //     if (cardSelected.name === '') {
    // //         return FormatRestApiModels.createFormatRestApi(400, 'Card not found.', null, null);
    // //     }
    // //
    // //     for (let i = 0; i < session.length; i++) {
    // //         if (i === data.teamPosition) {
    // //             let cards: Array<CardByEntityPlaying> = session[i].cardsPlayer ?? [];
    // //             for (let j = 0; j < cards.length; j++) {
    // //                 // Vérifier si la carte correspond à la position actuelle et réinitialiser si nécessaire
    // //                 if (i === data.teamPosition && j === data.cardPosition) {
    // //                     cards[j] = {
    // //                         atk: cardSelected.atk,
    // //                         def: cardSelected.def,
    // //                         spd: cardSelected.spd,
    // //                         luk: cardSelected.luk,
    // //                         rarity: cardSelected.rarity,
    // //                         imageSrc: cardSelected.image,
    // //                         description: cardSelected.description,
    // //                         name: cardSelected.name,
    // //                         effects: cardSelected.effects,
    // //                         capacities: cardSelected.capacities,
    // //                         status: EntityStatus.ALIVE,
    // //                         player: {
    // //                             avatar: existingPlayer.avatar,
    // //                             pseudo: existingPlayer.pseudo,
    // //                         },
    // //                     };
    // //                     session[i].commonLuck = Utils.initCommunStat(session[i], 'luk')
    // //                     session[i].commonSpeed = Utils.initCommunStat(session[i], 'spd')
    // //                     session[i].commonDefense = Utils.initCommunStat(session[i], 'def')
    // //                     session[i].commonAttack = Utils.initCommunStat(session[i], 'atk')
    // //                     session[i].commonMaxLife = Utils.initCommunStat(session[i], 'maxLife')
    // //                     session[i].commonLife = Utils.initCommunStat(session[i], 'life')
    // //                 } else {
    // //                     console.log('Card already in place');
    // //                 }
    // //             }
    // //         }
    // //     }
    // //     return FormatRestApiModels.createFormatRestApi(200, 'Card Change', session, null);
    // // }
    //
    // static getIfJustOnePlayerHaveCard(session: Array<EntityPlaying>): boolean {
    //     let count = 0;
    //     for (let i = 0; i < session.length; i++) {
    //         const team = session[i].cardsPlayer ?? [];
    //         for (let j = 0; j < team.length; j++) {
    //             if (
    //                 team[j].player?.pseudo !== '' &&
    //                 team[j].player?.avatar !== '' &&
    //                 team[j].name !== '' &&
    //                 team[j].imageSrc !== '' &&
    //                 team[j].rarity !== '' &&
    //                 team[j].description !== '' &&
    //                 team[j].atk !== -1 &&
    //                 team[j].def !== -1 &&
    //                 team[j].spd !== -1 &&
    //                 team[j].luk !== -1 &&
    //                 team[j].effects.length !== 0 &&
    //                 team[j].capacities.length !== 0) {
    //                 count++;
    //             }
    //         }
    //     }
    //     return count !== 0;
    // }
    //
    // static generateRandomNumber(min: number, max: number): number {
    //     return Math.floor(Math.random() * (max - min + 1)) + min;
    // }
    //
    // static initMonsterEntityPlaying(cards: Array<CardsDto>, map: Array<Cells>): Array<EntityPlaying> {
    //     let teamEntityPlaying: Array<EntityPlaying> = [];
    //     // this.generateRandomNumber(1, 2)
    //     for (let i = 0; i < 1; i++) {
    //         const validCells = map.filter(cell => cell.value !== -1);
    //         let indexMap = this.generateRandomNumber(0, validCells.length - 1);
    //         let indexOne = this.generateRandomNumber(0, cards.length - 1);
    //         let indexTwo = this.generateRandomNumber(0, cards.length - 1);
    //         let cardOne = {
    //             atk: cards[indexOne].atk,
    //             def: cards[indexOne].def,
    //             spd: cards[indexOne].spd,
    //             luk: cards[indexOne].luk,
    //             description: cards[indexOne].description,
    //             name: cards[indexOne].name,
    //             rarity: cards[indexOne].rarity,
    //             status: EntityStatus.ALIVE,
    //             imageSrc: cards[indexOne].image,
    //             effects: cards[indexOne].effects,
    //             capacities: cards[indexOne].capacities,
    //         }
    //         let cardTwo = {
    //             atk: cards[indexTwo].atk,
    //             def: cards[indexTwo].def,
    //             spd: cards[indexTwo].spd,
    //             luk: cards[indexTwo].luk,
    //             description: cards[indexTwo].description,
    //             name: cards[indexTwo].name,
    //             rarity: cards[indexTwo].rarity,
    //             status: EntityStatus.ALIVE,
    //             imageSrc: cards[indexTwo].image,
    //             effects: cards[indexTwo].effects,
    //             capacities: cards[indexTwo].capacities,
    //         }
    //         teamEntityPlaying.push({
    //             name: this.randomName(teamEntityPlaying),
    //             commonLife: 200,
    //             commonMaxLife: 200,
    //             commonAttack: cardOne.atk + cardTwo.atk,
    //             commonDefense: cardOne.def + cardTwo.def,
    //             commonLuck: cardOne.luk + cardTwo.luk,
    //             commonSpeed: cardOne.spd + cardTwo.spd,
    //             cellPosition: {
    //                 id: validCells[indexMap].id,
    //                 x: validCells[indexMap].x,
    //                 y: validCells[indexMap].y,
    //                 value: validCells[indexMap].value
    //             },
    //             entityStatus: EntityStatus.ALIVE,
    //             cardsMonster: [
    //                 cardOne,
    //                 cardTwo
    //             ],
    //         });
    //     }
    //     return teamEntityPlaying;
    // }
    //
    // static placeEntityPlayer(session: Array<EntityPlaying>, map: Array<Cells>, monsterCells: Array<Cells>) {
    //     let playerPositionCells: Array<Cells> = []
    //     for (let i = 0; i < session.length; i++) {
    //         const team = session[i].cardsPlayer ?? [];
    //         for (let j = 0; j < team.length; j++) {
    //             if (team[j].player?.pseudo !== '' && team[j].player?.avatar !== '') {
    //                 if (session[i].cellPosition) {
    //                     const validCells = map.filter(cell => cell.value !== -1);
    //                     const validCellsWithNotMonster = validCells.filter(cell => {
    //                         let monster = monsterCells.length === 0 || monsterCells.some(monsterCell => monsterCell.id !== cell.id)
    //                         let player = playerPositionCells.length === 0 || playerPositionCells.some(playerCell => playerCell.id !== cell.id)
    //                         return monster && player
    //                     });
    //                     let indexMap = this.generateRandomNumber(0, validCellsWithNotMonster.length - 1);
    //                     session[i].cellPosition = {
    //                         id: validCellsWithNotMonster[indexMap].id,
    //                         x: validCellsWithNotMonster[indexMap].x,
    //                         y: validCellsWithNotMonster[indexMap].y,
    //                         value: validCellsWithNotMonster[indexMap].value
    //                     }
    //                     playerPositionCells.push(validCellsWithNotMonster[indexMap])
    //                 } else {
    //                     console.log('Cell position is null')
    //                 }
    //             }
    //         }
    //     }
    //     return session;
    // }
    //
    // static initCommunStat(session: EntityPlaying, type: string) {
    //     let players = session.cardsPlayer ?? [];
    //
    //     const playerOne = players[0];
    //     const playerTwo = players[1];
    //
    //     switch (type) {
    //         case 'luk':
    //             if (playerOne.luk !== -1 && playerTwo.luk !== -1) {
    //                 return playerOne.luk + playerTwo.luk
    //             } else if (playerOne.luk !== -1 && playerTwo.luk === -1) {
    //                 return playerOne.luk
    //             } else if (playerOne.luk === -1 && playerTwo.luk !== -1) {
    //                 return playerTwo.luk
    //             } else {
    //                 return -1
    //             }
    //         case 'atk':
    //             if (playerOne.atk !== -1 && playerTwo.atk !== -1) {
    //                 return playerOne.atk + playerTwo.atk
    //             } else if (playerOne.atk !== -1 && playerTwo.atk === -1) {
    //                 return playerOne.atk
    //             } else if (playerOne.atk === -1 && playerTwo.atk !== -1) {
    //                 return playerTwo.atk
    //             } else {
    //                 return -1
    //             }
    //         case 'def':
    //             if (playerOne.def !== -1 && playerTwo.def !== -1) {
    //                 return playerOne.def + playerTwo.def
    //             } else if (playerOne.def !== -1 && playerTwo.def === -1) {
    //                 return playerOne.def
    //             } else if (playerOne.def === -1 && playerTwo.def !== -1) {
    //                 return playerTwo.def
    //             } else {
    //                 return -1
    //             }
    //         case 'spd':
    //             if (playerOne.spd !== -1 && playerTwo.spd !== -1) {
    //                 return playerOne.spd + playerTwo.spd
    //             } else if (playerOne.spd !== -1 && playerTwo.spd === -1) {
    //                 return playerOne.spd
    //             } else if (playerOne.spd === -1 && playerTwo.spd !== -1) {
    //                 return playerTwo.spd
    //             } else {
    //                 return -1
    //             }
    //         case 'maxLife':
    //             if (playerOne.name !== '' && playerTwo.name !== '') {
    //                 return 200
    //             } else if (playerOne.name !== '' && playerTwo.name === '') {
    //                 return 100
    //             } else if (playerOne.name === '' && playerTwo.name !== '') {
    //                 return 100
    //             } else {
    //                 return -1
    //             }
    //         case 'life':
    //             if (playerOne.name !== '' && playerTwo.name !== '') {
    //                 return 200
    //             } else if (playerOne.name !== '' && playerTwo.name === '') {
    //                 return 100
    //             } else if (playerOne.name === '' && playerTwo.name !== '') {
    //                 return 100
    //             } else {
    //                 return -1
    //             }
    //         default:
    //             return -1
    //     }
    // }
    //
    // static turnInit(game: Game) {
    //
    //     let allEntities: Array<TurnListEntity> = [];
    //
    //     console.log('teamAlpha', game.teams[0].cellPosition)
    //
    //     // Extract player entities
    //     game.teams.forEach((team, teamIndex) => {
    //         team?.cardsPlayer?.forEach((card, cardIndex) => {
    //             if (card.player?.pseudo !== '') {
    //                 allEntities.push({
    //                     team: team.name,
    //                     pseudo: card?.player?.pseudo ?? 'none',
    //                     teamIndex: teamIndex,
    //                     cardIndex: cardIndex,
    //                     typeEntity: EntityCategorie.HUMAIN,
    //                     luk: card.luk,
    //                     cellPosition: team.cellPosition
    //                 });
    //             }
    //         });
    //     });
    //
    //     // Extract monster entities
    //     game.monsters.forEach((monster, monsterIndex) => {
    //         monster?.cardsMonster?.forEach((card, cardIndex) => {
    //             allEntities.push({
    //                 team: monster.name,
    //                 pseudo: card.name,
    //                 teamIndex: monsterIndex,
    //                 cardIndex: cardIndex,
    //                 typeEntity: EntityCategorie.COMPUTER,
    //                 luk: card.luk,
    //                 cellPosition: monster.cellPosition
    //             });
    //         });
    //     });
    //
    //     let tab = allEntities.sort((a, b) => b.luk - a.luk);
    //     return tab;
    // }
    //
    //
    // static moveEntityPlayer(teams: Array<EntityPlaying>, cellToMove: Cells, pseudo: string) {
    //     teams.forEach(team => {
    //         const {cardsPlayer, cellPosition} = team;
    //         if (cardsPlayer) {
    //             const player = cardsPlayer.find(card => card.player?.pseudo === pseudo);
    //             if (player) {
    //                 team.cellPosition = cellToMove;
    //             }
    //         }
    //     });
    //     return teams;
    // }
    //
    // static moveEntityMonster(monsters: Array<EntityPlaying>, cellToMove: Cells, pseudo: string) {
    //     monsters.forEach(team => {
    //         const {cardsPlayer, cellPosition} = team;
    //         if (cardsPlayer) {
    //             const player = cardsPlayer.find(card => card.name === pseudo);
    //             if (player) {
    //                 team.cellPosition = cellToMove;
    //             }
    //         }
    //     });
    //     return monsters;
    // }
    //
    // static findEntityByTurnListEntity(teams: Array<EntityPlaying>, entity: TurnListEntity) {
    //     let cell = teams[entity.teamIndex].cellPosition
    // }
    //
    //
    // static checkIfPawnCellEqualAnotherPawnCell(
    //     teams: Array<EntityPlaying>,
    //     monsters: Array<EntityPlaying>,
    //     entity:TurnListEntity,
    // ) {
    //
    // }


}
