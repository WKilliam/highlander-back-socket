import PouchDB from "pouchdb";
import {FormatRestApiModels} from "../../models/formatRestApi.models";
import {Maps} from "../../models/maps.models";
import {EntityStatus, Game, SessionStatusGame} from "../../models/room.content.models";
import fs from 'fs/promises';
import {PlayerCards, PlayerLobby} from "../../models/player.models";
import {Utils} from "../../utils/utils";
import {Attack, CardByEntityPlaying, CardDocumentSetter, Effects} from "../../models/cards.models";

interface Document {
    _id: string;
    sessionStatusGame: SessionStatusGame;
    game: Game;
    maps: Maps;
}

export class PouchdbServices {

    private pathDocument: string = 'parties/';

    async createDocument(room: string, data?: any) {
        const pouchDB = new PouchDB(`${this.pathDocument}${room}`);
        const doc: Document = JSON.parse(JSON.stringify(data));
        doc._id = room; // Utilisez l'identifiant de la salle comme _id

        try {
            const response = await pouchDB.put(doc);
            const successResponse: FormatRestApiModels = {
                date: new Date().toISOString(),
                data: doc,
                message: 'Document créé avec succès',
                code: 200,
            };
            return successResponse;
        } catch (error) {
            const errorResponse: FormatRestApiModels = {
                date: new Date().toISOString(),
                data: null,
                message: 'Erreur lors de la création du document JSON',
                code: 500,
                error: error,
            };
            return errorResponse;
        }
    }

    async searchInAllDocuments(pseudo: string, avatar: string): Promise<FormatRestApiModels> {
        try {
            const directories = await fs.readdir(this.pathDocument);
            const documentsContainingUser: Document[] = [];

            for (const directory of directories) {
                const directoryPath = `${this.pathDocument}${directory}`;
                const files = await fs.readdir(directoryPath);

                for (const file of files) {
                    const documentPath = `${directoryPath}${file}`;
                    const pouchDB = new PouchDB(documentPath);
                    const doc: Document = await pouchDB.get(documentPath);

                    if (this.documentContainsUser(doc, pseudo, avatar)) {
                        documentsContainingUser.push(doc);
                    }
                }
            }
            return Utils.formatResponse(200, 'Documents trouvés', documentsContainingUser);
        } catch (error: any) {
            return Utils.formatResponse(500, error.message, null)
        }
    }

    private documentContainsUser(doc: Document, pseudo: string, avatar: string): boolean {
        return (
            doc.sessionStatusGame &&
            doc.sessionStatusGame.lobby &&
            doc.sessionStatusGame.lobby.some(
                (player) => player.avatar === avatar && player.pseudo === pseudo
            )
        );
    }

    async addPlayerToLobby(room: string, player: PlayerLobby) {
        try {
            const pouchDB = new PouchDB(`${this.pathDocument}${room}`);
            const doc: Document = await pouchDB.get(room);

            if (doc.sessionStatusGame && doc.sessionStatusGame.lobby) {
                doc.sessionStatusGame.lobby.push(player);

                // Mettez à jour le document avec le lobby mis à jour
                await pouchDB.put(doc);

                const successResponse: FormatRestApiModels = {
                    date: new Date().toISOString(),
                    data: doc,
                    message: 'Joueur ajouté au lobby avec succès',
                    code: 200,
                };
                return successResponse;
            } else {
                const errorResponse: FormatRestApiModels = {
                    date: new Date().toISOString(),
                    data: null,
                    message: 'Erreur lors de l\'ajout du joueur au lobby',
                    code: 500,
                };
                return errorResponse;
            }
        } catch (error) {
            const errorResponse: FormatRestApiModels = {
                date: new Date().toISOString(),
                data: null,
                message: 'Erreur lors de l\'ajout du joueur au lobby',
                code: 500,
                error: error,
            };
            return errorResponse;
        }
    }

    async setPlayerInTeams(room: string, data: CardDocumentSetter, entityStatus: string, position: number) {
        try {
            const pouchDB = new PouchDB(`${this.pathDocument}${room}`);
            const doc: Document = await pouchDB.get(room);

            if (doc.game && doc.game.teams && doc.game.teams[position]) {
                // Assurez-vous que la position est valide
                if (position >= 0 && position < doc.game.teams.length) {
                    // Mettez à jour les valeurs du joueur
                    doc.game.teams[position].name = data.name || '';
                    doc.game.teams[position].commonLife = data.commonLife || -1;
                    doc.game.teams[position].commonMaxLife = data.commonMaxLife || -1;
                    doc.game.teams[position].commonAttack = data.commonAttack || -1;
                    doc.game.teams[position].commonDefense = data.commonDefense || -1;
                    doc.game.teams[position].commonLuck = data.commonLuck || -1;
                    doc.game.teams[position].commonSpeed = data.commonSpeed || -1;

                    doc.game.teams[position].cellPosition.id = data.cellPosition.id || -1;
                    doc.game.teams[position].cellPosition.x = data.cellPosition.x || -1;
                    doc.game.teams[position].cellPosition.y = data.cellPosition.y || -1;
                    doc.game.teams[position].cellPosition.value = data.cellPosition.value || -1;
                    switch (entityStatus) {
                        case 'ALIVE':
                            doc.game.teams[position].entityStatus = EntityStatus.ALIVE;
                            break;
                        default:
                            break
                    }
                    // Mettez à jour le document avec les nouvelles valeurs du joueur
                    await pouchDB.put(doc);

                    const successResponse: FormatRestApiModels = {
                        date: new Date().toISOString(),
                        data: doc,
                        message: 'Joueur mis à jour avec succès',
                        code: 200,
                    };
                    return successResponse;
                } else {
                    const errorResponse: FormatRestApiModels = {
                        date: new Date().toISOString(),
                        data: null,
                        message: 'Position de joueur non valide',
                        code: 400, // Vous pouvez personnaliser le code d'erreur
                    };
                    return errorResponse;
                }
            } else {
                const errorResponse: FormatRestApiModels = {
                    date: new Date().toISOString(),
                    data: null,
                    message: 'Erreur lors de la mise à jour du joueur',
                    code: 500,
                };
                return errorResponse;
            }
        } catch (error) {
            const errorResponse: FormatRestApiModels = {
                date: new Date().toISOString(),
                data: null,
                message: 'Erreur lors de la mise à jour du joueur',
                code: 500,
                error: error,
            };
            return errorResponse;
        }
    }

    async setCardsPlayerInTeam(room: string, positionTeam: number, positionPlayer: number, data: CardByEntityPlaying) {
        try {
            const pouchDB = new PouchDB(`${this.pathDocument}${room}`);
            const doc: Document | undefined = await pouchDB.get(room);

            if (doc && doc.game && doc.game.teams && doc.game.teams[positionTeam]) {
                const team = doc.game.teams[positionTeam];
                if (team.cardsPlayer) {
                    const cardsPlayer = team.cardsPlayer;
                    if (
                        positionPlayer >= 0 &&
                        positionPlayer < cardsPlayer.length
                    ) {
                        // Mettez à jour les valeurs des cartes du joueur
                        const player = cardsPlayer[positionPlayer].player;
                        if (player) {
                            player.avatar = data.player?.avatar || '';
                            player.pseudo = data.player?.pseudo || '';
                        }

                        const card = cardsPlayer[positionPlayer];
                        card.id = data.id || -1;
                        card.atk = data.atk || 0;
                        card.def = data.def || 0;
                        card.spd = data.spd || 0;
                        card.luk = data.luk || 0;
                        card.rarity = data.rarity || 'commun';
                        card.imageSrc = data.imageSrc || '';
                        card.effects = data.effects || [];
                        card.attacks = data.attacks || [];

                        // Mettez à jour le document avec les nouvelles valeurs du joueur
                        await pouchDB.put(doc);

                        const successResponse: FormatRestApiModels = {
                            date: new Date().toISOString(),
                            data: doc,
                            message: 'Cartes du joueur mises à jour avec succès',
                            code: 200,
                        };
                        return successResponse;
                    } else {
                        const errorResponse: FormatRestApiModels = {
                            date: new Date().toISOString(),
                            data: null,
                            message: 'Position de joueur non valide',
                            code: 400, // Vous pouvez personnaliser le code d'erreur
                        };
                        return errorResponse;
                    }
                }
            }

            const errorResponse: FormatRestApiModels = {
                date: new Date().toISOString(),
                data: null,
                message: 'Erreur lors de la mise à jour des cartes du joueur',
                code: 500,
            };
            return errorResponse;
        } catch (error) {
            const errorResponse: FormatRestApiModels = {
                date: new Date().toISOString(),
                data: null,
                message: 'Erreur lors de la mise à jour des cartes du joueur',
                code: 500,
                error: error,
            };
            return errorResponse;
        }
    }

}
