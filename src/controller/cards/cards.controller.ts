import {Router} from "express";

const CardsController = Router();
import {CardsModelsRequest} from "../../models/cards.models";
import {AppDataSource} from "../../utils/database/database.config";
import {CardsServices} from "../../services/cards/cards.services";
import {FormatModel} from "../../models/format.model";
import {Utils} from "../../utils/utils";

const cardsServices = new CardsServices(AppDataSource);


/**
 * @swagger
 * /cards/new:
 *   post :
 *     summary: Créer une nouvelle carte.
 *     tags :
 *       - Cards
 *     requestBody :
 *       required : true
 *       content :
 *         application/json :
 *           schema :
 *             type : object
 *             properties :
 *               name :
 *                 type : string
 *               description :
 *                 type : string
 *               image :
 *                 type : string
 *               rarity :
 *                 type : string
 *               atk :
 *                 type : number
 *               def :
 *                 type : number
 *               vit :
 *                 type : number
 *               luk:
 *                 type : number
 *               effects:
 *                 type: array
 *                 items:
 *                   type: number
 *             example:
 *               name: "Angel of Death"
 *               description: "Call of Death Guardian"
 *               image: "https://i.pinimg.com/originals/fd/c1/53/fdc15338eee7d61d57af6f12f3c47fec.png"
 *               rarity: "COMMUN"
 *               atk: 1
 *               def: 1
 *               vit: 1
 *               luk: 1
 *               effects: [1, 2, 3]
 *     responses:
 *       '201':
 *         description: Carte créée avec succès.
 *       '500':
 *         description: Erreur interne du serveur.
 */
CardsController.post("/new", async (
    request,
    response) => {
    const {
        name,
        description,
        image,
        rarity,
        atk,
        def,
        spd,
        luk,
        effects
    } = request.body;
    let cardsModel: CardsModelsRequest = {
        name: name,
        description: description,
        image: image,
        rarity: rarity,
        atk: atk,
        def: def,
        spd: spd,
        luk: luk,
        effects: effects
    }
    const create = await cardsServices.createCard(cardsModel);
    return Utils.requestFormatCommon(response, create);
})
/**
 * @swagger
 * /cards/allcards:
 *   get:
 *     summary: Récupérer toutes les cartes.
 *     tags:
 *       - Cards
 *     responses:
 *       '200':
 *         description: Liste de toutes les cartes récupérée avec succès.
 *       '500':
 *         description: Erreur interne du serveur.
 */
CardsController.get("/allcards", async (
    request,
    response) => {
    const create: FormatModel = await cardsServices.getAllCards();
    return Utils.requestFormatCommon(response, create);
})


/**
 * @swagger
 * /cards:
 *   patch:
 *     summary: Créer une nouvelle carte.
 *     tags:
 *       - Cards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               rarity:
 *                 type: string
 *               atk:
 *                 type: number
 *               def:
 *                 type: number
 *               vit:
 *                 type: number
 *               luk:
 *                 type: number
 *               effects:
 *                 type: array
 *                 items:
 *                   type: number
 *             example:
 *               id: 1
 *               name: "Angel of Death"
 *               description: "Call of Death Guardian"
 *               image: "https://i.pinimg.com/originals/fd/c1/53/fdc15338eee7d61d57af6f12f3c47fec.png"
 *               rarity: "COMMUN"
 *               atk: 1
 *               def: 1
 *               vit: 1
 *               luk: 1
 *               effects: [1, 2, 3]
 *     responses:
 *       '201':
 *         description: Carte créée avec succès.
 *       '500':
 *         description: Erreur interne du serveur.
 */
CardsController.patch("/", async (
    request,
    response) => {

    const {
        name,
        description,
        image,
        rarity,
        atk,
        def,
        spd,
        luk,
        effects
    } = request.body;
    let cardsModel: CardsModelsRequest = {
        name: name,
        description: description,
        image: image,
        rarity: rarity,
        atk: atk,
        def: def,
        spd: spd,
        luk: luk,
        effects: effects
    }
    const create: FormatModel = await cardsServices.patchCard(cardsModel);
    return Utils.requestFormatCommon(response, create);
})


export default CardsController;
