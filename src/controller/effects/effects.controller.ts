import {Router} from "express";

const EffectsController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {EffectsServices} from "../../services/effects/effects.services";
import {EffectsModelsRequest} from "../../models/effects.models";
import {Utils} from "../../utils/utils";

const effectsServices = new EffectsServices(AppDataSource);

/**
 * @swagger
 * /effects:
 *   post:
 *     summary: Créer une nouvelle effet.
 *     tags:
 *       - Effects
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
 *               icon:
 *                 type: string
 *               rarity:
 *                 type: string
 *               type:
 *                 type: string
 *               action:
 *                 type: string
 *             example:
 *                 name: "Effects 1"
 *                 description : "Effects 1"
 *                 icon : "https://i.pinimg.com/originals/fd/c1/53/fdc15338eee7d61d57af6f12f3c47fec.png"
 *                 rarity : "COMMUN"
 *                 type : "DAMAGE"
 *                 action : "A1"
 *     responses:
 *       '201':
 *         description: Carte créée avec succès.
 *       '500':
 *         description: Erreur interne du serveur.
 */
EffectsController.post("/", async (
    request,
    response) => {
    const {name, description, icon, rarity, type, action} = request.body;
    let effectsModel: EffectsModelsRequest = {
        name: name,
        description: description,
        icon: icon,
        rarity: rarity,
        type: type,
        action: action
    }
    const received = await effectsServices.createEffect(effectsModel);
    return Utils.requestFormatCommon(response, received);
})


export default EffectsController;
