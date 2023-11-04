import {Router} from "express";
import {AppDataSource} from "../../utils/database/database.config";
import {UsersServices} from "../../services/users/users.services";
import {UserLogin, UserSubscription} from "../../models/users.models";
import {FormatModel} from "../../models/format.model";

const userService: UsersServices = new UsersServices(AppDataSource);
const UsersController = Router();


/**
 * @swagger
 * /user/new:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *                 description: Le pseudo de l'utilisateur.
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'utilisateur.
 *               email:
 *                 type: string
 *                 description: L'adresse e-mail de l'utilisateur.
 *               avatar:
 *                 type: string
 *                 description: L'avatar de l'utilisateur.
 *             example:
 *               pseudo: "JohnDoe"
 *               password: "motdepasse"
 *               email: "john.doe@example.com"
 *               avatar: "https://www.w3schools.com/howto/img_avatar.png"
 */
UsersController.post("/new", async (
    request,
    response) => {
    const {
        pseudo,
        password,
        email,
        avatar
    } = request.body;
    let userSubscription: UserSubscription = {
        pseudo,
        password,
        email,
        avatar
    }
    const received:FormatModel = await userService.createUser(userSubscription)
    if (received.code >= 200 && received.code < 300) {
        response.status(received.code).json(received.data)
    } else {
        response.status(received.code).json(received.data)
    }
})

UsersController.post("/login", async (
    request,
    response) => {
    const {
        email,
        password
    } = request.body;
    let userLogin: UserLogin = {
        email,
        password
    }
    const received:FormatModel = await userService.getUserByEmailAndPassword(userLogin)
    if (received.code >= 200 && received.code < 300) {
        response.status(received.code).json(received)
    } else {
        response.status(received.code).json(received.message)
    }
})

export default UsersController;
