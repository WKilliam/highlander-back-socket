import {Router} from "express";

const MapController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {MapsServices} from "../../services/maps/maps.services";
import {MapsSimplify} from "../../models/maps.models";
import {FormatRestApiModels} from "../../models/formatRestApi.models";
import {Utils} from "../../utils/utils";

const mapsServices = new MapsServices(AppDataSource);


MapController.post('/new', async (request, response) => {
    const {name, backgroundImage, width, height} = request.body;
    const map: MapsSimplify = {
        name: name,
        backgroundImage: backgroundImage,
        width: width,
        height: height
    }
    const received: FormatRestApiModels = await mapsServices.create(map);
    response.status(received.code).json(received);
});

MapController.get('/', async (request, response) => {
    const id = request.query.id;
    if (isNaN(Number(id))) {
        const received: FormatRestApiModels = Utils.formatResponse(400, 'ID is not Number', null, 'ID is not Number');
        response.status(received.code).json(received);
    } else {
        const received: FormatRestApiModels = await mapsServices.getMapsById(Number(id));
        response.status(received.code).json(received);
    }
});

MapController.get('/allMaps', async (request, response) => {

    const received: FormatRestApiModels = await mapsServices.getAllMaps();
    response.status(received.code).json(received);

});

export default MapController;
