import {Router} from "express";
import {AppDataSource} from "../../utils/database/database.config";
import {UsersServices} from "../../services/users/users.services";
import {UserSubscription} from "../../models/users.models";
const userService: UsersServices = new UsersServices(AppDataSource);
const UsersController = Router();


UsersController.post('/new', async (req, res) => {
    const {
        email,
        password,
        pseudo,
        avatar,
    } = req.body;
    const user:UserSubscription = {
        pseudo: pseudo,
        password : password,
        email : email,
        avatar : avatar,
    }
    const received = await userService.create(user);
    res.status(received.code).json(received);
})

export default UsersController;
