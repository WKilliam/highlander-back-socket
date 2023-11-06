import {Router} from "express";
import {AppDataSource} from "../../utils/database/database.config";
import {CapacityService} from "../../services/capacity/capacity.service";
import {CapacityRestApi} from "../../models/cards.models";
const CapacityController = Router();
const capacityService = new CapacityService(AppDataSource);

CapacityController.post("/new", async (
    request,
    response) => {
    const {
        name,
        description,
        icon,
        action,
    } = request.body;
    const capacity: CapacityRestApi = {
        name: name,
        description: description,
        icon: icon,
        action: action
    }
    const received = await capacityService.create(capacity);
    response.status(received.code).json(received);
});


CapacityController.get("/", async (
    request,
    response) => {
    const id = request.query.id;
    if (isNaN(Number(id))) {
        response.status(400).json({
            code: 400,
            message: 'ID is not Number',
            data: null,
            error: 'ID is not Number'
        });
    }else{
        const received = await capacityService.getCapacityById(Number(id));
        response.status(received.code).json(received);
    }
});

export default CapacityController;
