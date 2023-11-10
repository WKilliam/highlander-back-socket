import PouchDB from "pouchdb";
import {Maps} from "../../models/maps.models";
import {Game, SessionGame, SessionStatusGame} from "../../models/room.content.models";
import {Utils} from "../../utils/utils";

interface Document {
    _id: string;
    sessionStatusGame: SessionStatusGame;
    game: Game;
    maps: Maps;
}

export class PouchdbServices {

    private pathDocument: string = 'parties/';
    private pouchDBRoom: string = ''

    constructor(room: string) {
        console.log('room inside constructor', room)
        this.pouchDBRoom = room;
    }

    createTest(){
        return this.pouchDBRoom
    }

    async createDocument(room: string) {
        // const pouchDB = new PouchDB(`${this.pathDocument}${room}`);
        console.log('room inside create document', room)
        return Utils.formatResponse(500, 'Document créé avec succès', null, null);
        // let docInit: Document = {
        //     _id: room,
        //     sessionStatusGame: data.sessionStatusGame,
        //     game: data.game,
        //     maps: data.maps
        // };
        // const doc: Document = JSON.parse(JSON.stringify(docInit));
        // try {
        //     const response = await pouchDB.put(doc);
        //     return Utils.formatResponse(200, 'Document créé avec succès', response, null);
        // } catch (error) {
        //     return Utils.formatResponse(500, 'Erreur lors de la création du document JSON', null, error);
        // }
    }

}
