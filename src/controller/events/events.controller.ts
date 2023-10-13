import {Router} from "express";

const EventsController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {EventsServices} from "../../services/events/events.services";
import {EffectsModelsRequest} from "../../models/effects.models";
import {EventsRequestModels} from "../../models/events.models";
import {Utils} from "../../utils/utils";

const eventsServices = new EventsServices(AppDataSource);


/**
 * @swagger
 * /events:
 *   post:
 *     summary: Créer une nouvelle événement.
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               typeEvent:
 *                 type: string
 *           example:
 *             message: "Events Alert"
 *             actionEvent: "A1"
 *             typeEvent: "Events 1"
 *     responses:
 *       '201':
 *         description: Événement créé avec succès.
 *       '500':
 *         description: Erreur interne du serveur.
 */
EventsController.post("/", async (
    request,
    response) => {
    const {
        typeEvent,
        message,
        actionEvent
    } = request.body;
    let eventsModel: EventsRequestModels = {
        typeEvent: typeEvent,
        message: message,
    }
    const received = await eventsServices.createEvents(eventsModel)
    return Utils.requestFormatCommon(response, received);
});
export default EventsController;
