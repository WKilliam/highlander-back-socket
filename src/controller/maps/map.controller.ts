import {Router} from "express";

const MapController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {MapsServices} from "../../services/maps/maps.services";
import {MapModelsRequest} from "../../models/map.models";
import {Utils} from "../../utils/utils";
import {FormatModel} from "../../models/format.model";

const mapsServices = new MapsServices(AppDataSource);

/**
 * @swagger
 * /maps:
 *   post:
 *     summary: Créer une nouvelle carte.
 *     tags:
 *       - Maps
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               backgroundImage:
 *                 type: string
 *               width:
 *                 type: number
 *               height:
 *                 type: number
 *             example:
 *                 name: "Carte 1"
 *                 backgroundImage : "https://i.pinimg.com/originals/fd/c1/53/fdc15338eee7d61d57af6f12f3c47fec.png"
 *                 width : 970
 *                 height : 512
 *     responses:
 *       '201':
 *         description: Carte créée avec succès.
 *       '500':
 *         description: Erreur interne du serveur.
 */
MapController.post("/", async (
    request,
    response) => {
    const {backgroundImage, width, height, name} = request.body;
    let mapModel: MapModelsRequest = {
        backgroundImage: backgroundImage,
        width: width,
        height: height,
        name: name
    }
    const received = await mapsServices.createMap(mapModel);
    if(received.code >= 200 || received.code <= 299){
        return response.status(received.code).json(received.data);
    } else {
        return response.status(received.code).json(received);
    }
})


/**
 * @swagger
 * /maps/infos :
 *  get :
 *    summary : Récupérer les informations de toutes les cartes (ID, image de fond, nom).
 *    tags:
 *      - Maps
 *    responses :
 *      '200' :
 *        description : Informations de cartes récupérées avec succès.
 *      '500' :
 *        description : Erreur interne du serveur.
 */
MapController.get("/infos", async (
    request,
    response) => {
    const received = await mapsServices.getMapInfo();
    if(received.code >= 200 || received.code <= 299){
        return response.status(received.code).json(received.data);
    } else {
        return response.status(received.code).json(received);
    }
})


export default MapController;
