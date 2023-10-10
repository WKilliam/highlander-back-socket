import {Router} from "express";
const CardsController = Router();
import {CardsModelsRequest} from "../../models/cards.models";
import {AppDataSource} from "../../utils/database/database.config";
import {CardsServices} from "../../services/cards/cards.services";
const cardsServices = new CardsServices(AppDataSource);


/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Créer une nouvelle carte.
 *     tags:
 *       - Cards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               rarity:
 *                 type: string
 *               atk:
 *                  type: number
 *               def:
 *                  type: number
 *               vit:
 *                  type: number
 *               luk:
 *                  type: number
 *               effects:
 *                  type: array
 *             example:
 *                 name: "Angel of Death"
 *                 description : "Call of Death Guardian"
 *                 icon : "https://i.pinimg.com/originals/fd/c1/53/fdc15338eee7d61d57af6f12f3c47fec.png"
 *                 rarity : "COMMUN"
 *                 atk : 1
 *                 def : 1
 *                 vit : 1
 *                 luk : 1
 *                 effects : [1,2,3]
 *     responses:
 *       '201':
 *         description: Carte créée avec succès.
 *       '500':
 *         description: Erreur interne du serveur.
 */
CardsController.post("/", async (
    request,
    response) => {
    try {
        const {
            name,
            description,
            image,
            rarity,
            atk,
            def,
            vit,
            luk,
            effects
        } = request.body;
        let cardsModel : CardsModelsRequest = {
            name: name,
            description: description,
            image: image,
            rarity: rarity,
            atk: atk,
            def: def,
            vit: vit,
            luk: luk,
            effects: effects
        }
        const create = cardsServices.createCard(cardsModel);
        response.status(201).json(create);
    } catch (error: any) {
        console.error(error);
        response.status(500).send(error);
    }
})



export default CardsController;
