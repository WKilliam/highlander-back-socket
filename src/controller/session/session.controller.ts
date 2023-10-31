import {Router} from "express";
import { SessionGamePlace, SessionModelRequest} from "../../models/sessions.models";
import {SessionsServices} from "../../services/sessions/sessions.services";
import {AppDataSource} from "../../utils/database/database.config";
import {FormatModel} from "../../models/format.model";

const sessionsServices: SessionsServices = new SessionsServices(AppDataSource);

const SessionController = Router();

/**
 * @swagger
 * /sessions/new:
 *   post:
 *     summary: Créer une nouvelle session.
 *     tags:
 *       - Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *              ownerId:
 *                  type: number
 *              createdAt:
 *                  type: string
 *              updatedAt:
 *                  type: string
 *              statusAccess:
 *                  type: string
 *              password:
 *                  type: string
 *              name:
 *                  type: string
 *              mapId:
 *                  type: number
 *              example:
 *               ownerId: 1
 *               createdAt: "2023-10-10T12:00:00Z"
 *               updatedAt: "2023-10-10T12:00:00Z"
 *               statusAccess: "public"
 *               password: "motdepasse"
 *               name: "Nom de la session"
 *               mapId: 1
 *     responses:
 *       '201':
 *         description: Session créée avec succès.
 *       '500':
 *         description: Erreur interne du serveur.
 */
SessionController.post("/new", async (
    request,
    response) => {
    const {
        ownerId,
        statusAccess,
        password,
        name,
        mapId,
        teamNameOne,
        teamNameTwo,
        teamNameThree,
        teamNameFour,
    } = request.body;

    let sessionModel: SessionModelRequest = {
        ownerId: ownerId,
        createdAt: new Date().toLocaleString(),
        name: name,
        updatedAt: new Date().toLocaleString(),
        statusAccess: statusAccess,
        password: password,
        mapId: mapId,
        teamNameOne: teamNameOne,
        teamNameTwo: teamNameTwo,
        teamNameThree: teamNameThree,
        teamNameFour: teamNameFour,
    }
    const received = await sessionsServices.createSession(sessionModel);
    if (received.code >= 200 && received.code < 300) {
        response.status(received.code).json(received.data);
    } else {
        response.status(received.code).json(received.message);
    }
})

// SessionController.post("/sessionGamePlace", async (
//     request,
//     response) => {
//     const {
//         gameKeySession,
//         avatar,
//         pseudo,
//     } = request.body;
//     let sessionGameKeyFreeplace : SessionGamePlace = {
//         gameKeySession: gameKeySession,
//         avatar: avatar,
//         pseudo: pseudo,
//     }
//     const received :FormatModel = await sessionsServices.checkFreePlaceSessionToGamekey(sessionGameKeyFreeplace);
//     if (received.code >= 200 && received.code < 300) {
//         response.status(received.code).json(received);
//     } else {
//         response.status(received.code).json(received.message);
//     }
// })


export default SessionController;
