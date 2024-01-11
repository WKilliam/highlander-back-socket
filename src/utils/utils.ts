import {Cells} from "../models/maps.models";
import {SessionDto} from "../dto/session.dto";
import {FormatRestApiModels} from "../models/formatRestApi";
import {CardByEntityPlaying, CardsModels} from "../models/cards.models";
import {CardPlayerEntityModels, PlayerCardsEntity} from "../models/cards.player.entity.models";
import {PlayerLobby, PlayerModels} from "../models/player.models";
import {CardsDto} from "../dto/cards.dto";
import {Can, EntityCategorie, EntityStatus} from "../models/enums";
import {EntityActionMoving} from "../models/actions.game.models";

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
    static codeErrorChecking(code: number): boolean {
        return code < 200 || code > 299;
    }
    static setPlayerTeam(data: SessionDto, lobbyPosition: number, teamPosition: number, cardPosition: number, cardByPlayer: number | null = null) {
        // Check if teams[teamPosition].cardsPlayer[cardPosition] is not already taken
        let userInformation:PlayerLobby =  data.game.sessionStatusGame.lobby[lobbyPosition];
        let challenger:PlayerCardsEntity = (data.game && data.game.game && data.game.game.challenger && data.game.game.challenger[teamPosition]) ?? PlayerModels.initPlayerCards();
        let cardInfo:CardByEntityPlaying = (challenger.cardsInfo && challenger.cardsInfo[cardPosition]) ?? CardsModels.initCardByEntityPlaying();
        if(
            cardInfo.player.avatar !== '' &&
            cardInfo.player.pseudo !== '' &&
            cardInfo.player.avatar !== userInformation.avatar &&
            cardInfo.player.pseudo !== userInformation.pseudo) {
            // card is already taken by another player
            return FormatRestApiModels.createFormatRestApi(400, 'The seat is already taken.', null, null);
        }
        // set the card to the player
        const challenge = this.setOnlyPlayerInChallenger(data.game.game.challenger,userInformation,cardByPlayer,teamPosition,cardPosition)
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
            let updatedPlayer = { ...player };
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


    static caseNULL(data: SessionDto) {

    }
    static caseSTART_TURN(data: SessionDto) {

    }

    static caseSEND_MOVE(data: SessionDto) {

    }

    static caseMOVE(data: SessionDto) {

    }



}
