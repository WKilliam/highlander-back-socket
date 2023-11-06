import {Router} from "express";
import {SessionsServices} from "../../services/sessions/sessions.services";
import {AppDataSource} from "../../utils/database/database.config";
import {SessionCreated} from "../../models/room.content.models";
const sessionsServices: SessionsServices = new SessionsServices(AppDataSource);
const SessionController = Router();



export default SessionController;
