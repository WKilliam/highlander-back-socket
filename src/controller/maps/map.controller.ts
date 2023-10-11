import {Router} from "express";

const MapController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {MapsServices} from "../../services/maps/maps.services";
import {MapsDto} from "../../dto/maps.dto";
import {MapModelsRequest} from "../../models/map.models";
const mapsServices =  new MapsServices(AppDataSource);

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
    try {
        const {backgroundImage, width, height,name} = request.body;
        let mapModel : MapModelsRequest = {
            backgroundImage: backgroundImage,
            width: width,
            height: height,
            name: name
        }
        const map: MapsDto = await mapsServices.createMap(mapModel);
        response.status(201).json(map);
    } catch (error: any) {
        console.error(error);
        response.status(500).send(error);
    }
})


export default MapController;
