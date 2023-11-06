import {Router} from "express";

const CardsController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {CardsServices} from "../../services/cards/cards.services";
import {CardsRestApi} from "../../models/cards.models";
const cardsServices = new CardsServices(AppDataSource);


CardsController.post('/new', async (req, res) => {
    const {
name,
        description,
        image,
        rarity,
        atk,
        def,
        spd,
        luk,
        effects,
        capacities,
    } = req.body;
    let card:CardsRestApi = {
        name: name,
        description: description,
        image: image,
        rarity: rarity,
        atk: atk,
        def: def,
        spd: spd,
        luk: luk,
        effects: effects,
        capacities: capacities,
    }
    const received = await cardsServices.create(card);
    res.status(received.code).json(received);
})

CardsController.get("/", async (
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
        const received = await cardsServices.getCapacityById(Number(id));
        response.status(received.code).json(received);
    }
});


export default CardsController;
