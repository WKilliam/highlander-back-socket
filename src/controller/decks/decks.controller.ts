import {Router} from "express";

const DecksController = Router();
import {CardsModelsRequest} from "../../models/cards.models";
import {AppDataSource} from "../../utils/database/database.config";
import {CardsServices} from "../../services/cards/cards.services";
import {DecksModelsRequest} from "../../models/decks.models";
import {DecksServices} from "../../services/decks/decks.services";
import {Utils} from "../../utils/utils";

const decksService = new DecksServices(AppDataSource);

/**
 * @swagger
 * /decks:
 *   post:
 *     summary: Créer une nouvelle carte.
 *     tags:
 *       - Decks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               type:
 *                 type: string
 *               rarity:
 *                 type: string
 *               createdAt:
 *                 type: string
 *               count:
 *                 type: number
 *               cards:
 *                 type: array
 *             example:
 *               name: "Angel of Death"
 *               description: "Call of Death Guardian"
 *               image: "https://i.pinimg.com/originals/fd/c1/53/fdc15338eee7d61d57af6f12f3c47fec.png"
 *               type: "MONSTER"
 *               rarity: "COMMUN"
 *               createdAt: "2021-10-20T00:00:00.000Z"
 *               count: 1
 *               cards: [1, 2, 3]
 *     responses:
 *       '201':
 *         description: Carte créée avec succès.
 *       '500':
 *         description: Erreur interne du serveur.
 */
DecksController.post("/", async (
    request,
    response) => {

    const {
        name,
        description,
        image,
        type,
        rarity,
        createdAt,
        count,
        cards,
    } = request.body;
    let decksModel: DecksModelsRequest = {
        name: name,
        description: description,
        image: image,
        type: type,
        rarity: rarity,
        createdAt: createdAt,
        count: count,
        cards: cards
    }
    const received = await decksService.createDeck(decksModel);
    return Utils.requestFormatCommon(response, received);
})


export default DecksController;
