import {Router} from "express";

const EventsController = Router();
import {AppDataSource} from "../../utils/database/database.config";
import {EventsServices} from "../../services/events/events.services";
import {Utils} from "../../utils/utils";

const eventsServices = new EventsServices(AppDataSource);


export default EventsController;
