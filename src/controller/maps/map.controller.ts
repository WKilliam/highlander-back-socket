import {Router} from "express";

const MapController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {MapsServices} from "../../services/maps/maps.services";
import {MapsDto} from "../../dto/maps.dto";
import {MapModelsRequest} from "../../models/map.models";
import {JsonconceptorService} from "../../services/jsonconceptor/jsonconceptor.service";
import {Utils} from "../../utils/utils";
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
        const {backgroundImage, width, height,name} = request.body;
        let mapModel : MapModelsRequest = {
            backgroundImage: backgroundImage,
            width: width,
            height: height,
            name: name
        }
        const received = await mapsServices.createMap(mapModel);
        return Utils.requestFormatCommon(response, received);
})

MapController.get("/infos", async (
    request,
    response) => {
    const received = await mapsServices.getMapInfo();
    return Utils.requestFormatCommon(response, received);
})


MapController.get("/", async (
    request,
    response) => {
    // TODO : A modifier pour formatter la réponse
    try {
        let cellsGrid;
        let sessionKey = request.query.session as string
        let json = JsonconceptorService.readJsonFile(sessionKey)
        if (json && json.map && json.map.cellsGrid) {
            cellsGrid = json.map.cellsGrid;
            return response.status(200).send(cellsGrid)
        } else {
            response.status(500).send('Le fichier JSON ne contient pas le tableau cellsGrid.')
        }
    }catch (error:any){
        console.error(error);
        response.status(500).send(error);
    }
})

MapController.post("/findPosition", async (
    request,
    response) => {
    try {
        // const map: MapsDto[] = await mapsServices.getMaps();
        // response.status(200).json(map);
    } catch (error: any) {
        console.error(error);
        response.status(500).send(error);
    }
});

MapController.post("/placePawn", async (
    request,
    response) => {
    try {

    } catch (error: any) {
        console.error(error);
        response.status(500).send(error);
    }
});


export default MapController;
