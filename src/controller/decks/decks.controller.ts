import {Router} from "express";

const DecksController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {DecksServices} from "../../services/decks/decks.services";
import {DecksRestApi} from "../../models/decks.models";

const decksService = new DecksServices(AppDataSource);


DecksController.post('/new', async (req, res) => {
    const {
        name,
        description,
        image,
        type,
        rarity,
        cards,
    } = req.body;
    const deck: DecksRestApi = {
        name: name,
        description: description,
        image: image,
        type: type,
        rarity: rarity,
        cards: cards,
    }
    const received = await decksService.create(deck);
    res.status(received.code).json(received);
});


DecksController.get("/", async (
    request,
    response) => {
    const id = request.query.id;
    if (isNaN(Number(id))) {
        response.status(400).json({
            code: 400,
            message: 'ID is not Number',
            data: null,
            error: 'ID is not Number'
        });
    }else{
        const received = await decksService.getDeckById(Number(id));
        response.status(received.code).json(received);
    }
});



export default DecksController;
