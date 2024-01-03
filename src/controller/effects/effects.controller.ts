import {Router} from "express";
const EffectsController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {EffectsServices} from "../../services/effects/effects.services";
import {FormatRestApi, FormatRestApiModels} from "../../models/formatRestApi";
import { Effects} from "../../models/cards.models";
import {Utils} from "../../utils/utils";
const effectsServices = new EffectsServices(AppDataSource);

EffectsController.post('/new', async (req, res) => {
    const {
        name,
        description,
        icon,
        rarity,
        action,
    } = req.body;
    const effects: Effects = {
        name: name,
        description: description,
        icon: icon,
        rarity: rarity,
        action: action
    }
    const received: FormatRestApi = await effectsServices.create(effects);
    res.status(received.code).json(received);
})

EffectsController.get('/', async (req, res) => {
    const id = req.query.id;
    console.log(id)
    if (isNaN(Number(id))) {
        const received: FormatRestApi = FormatRestApiModels.createFormatRestApi(400, 'ID is not Number', null, 'ID is not Number');
        res.status(received.code).json(received);
    }else{
        const received: FormatRestApi = await effectsServices.getEffectsById(Number(id));
        res.status(received.code).json(received);
    }
});

export default EffectsController;
