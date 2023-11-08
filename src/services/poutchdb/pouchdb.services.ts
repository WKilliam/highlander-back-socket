import PouchDB from "pouchdb";
import {Maps} from "../../models/maps.models";
import {Game, SessionStatusGame} from "../../models/room.content.models";
import {Utils} from "../../utils/utils";

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
            return Utils.formatResponse(200, 'Document créé avec succès', response, null);
        } catch (error) {
            return Utils.formatResponse(500, 'Erreur lors de la création du document JSON', null, error);
        }
    }

}
