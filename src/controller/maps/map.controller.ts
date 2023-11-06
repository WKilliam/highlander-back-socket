import {Router} from "express";

const MapController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {MapsServices} from "../../services/maps/maps.services";
import {MapsSimplify} from "../../models/maps.models";
import {FormatRestApiModels} from "../../models/formatRestApi.models";
import {Utils} from "../../utils/utils";

const mapsServices = new MapsServices(AppDataSource);


MapController.post('/new', async (req, res) => {
    const {name, backgroundImage, width, height} = req.body;
    const map: MapsSimplify = {
        name: name,
        backgroundImage: backgroundImage,
        width: width,
        height: height
    }
    const received: FormatRestApiModels = await mapsServices.create(map);
    res.status(received.code).json(received);
});

MapController.get('/', async (req, res) => {
    const id = req.query.id;
    console.log(id)
    if (isNaN(Number(id))) {
        const received: FormatRestApiModels = Utils.formatResponse(400, 'ID is not Number', null,'ID is not Number');
        res.status(received.code).json(received);
    }else{
        const received: FormatRestApiModels = await mapsServices.getMapsById(Number(id));
        res.status(received.code).json(received);
    }
});


export default MapController;
