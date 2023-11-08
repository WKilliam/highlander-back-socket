import {Router} from "express";
import {AppDataSource} from "../../utils/database/database.config";
import {UsersServices} from "../../services/users/users.services";
import {UsersLogin, UserSubscription} from "../../models/users.models";
const userService: UsersServices = new UsersServices(AppDataSource);
const UsersController = Router();


UsersController.post('/new', async (request, response) => {
    const {
        email,
        password,
        pseudo,
        avatar,
        deckIds,
        cardIds,
    } = request.body;
    const user:UserSubscription = {
        pseudo: pseudo,
        password : password,
        email : email,
        avatar : avatar,
        deckIds : deckIds,
        cardsIds : cardIds
    }
    const received = await userService.create(user);
    response.status(received.code).json(received);
})

UsersController.post('/login', async (request, response) => {
    const {
        email,
        password
    } = request.body;
    const user:UsersLogin = {
        password : password,
        email : email,
    }
    const received = await userService.login(user);
    response.status(received.code).json(received);
})

export default UsersController;
