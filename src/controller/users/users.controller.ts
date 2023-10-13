import {Router} from "express";
import {AppDataSource} from "../../utils/database/database.config";
import {UsersServices} from "../../services/users/users.services";
import SessionController from "../session/session.controller";
import {UserSubscription} from "../../models/users.models";

const userService: UsersServices = new UsersServices(AppDataSource);

const UsersController = Router();

SessionController.post("/", async (
    request,
    response) => {
    try {
        const {
            pseudo,
            password,
            email,
            createdAt,
            avatar,
            role
        } = request.body;
        let userSubscription :UserSubscription = {
            pseudo,
            password,
            email,
            createdAt,
            avatar,
            role
        }
        const create = await userService.createUser(userSubscription)
        return response.status(200).json(create);
    } catch (error: any) {

    }
})


export default UsersController;
