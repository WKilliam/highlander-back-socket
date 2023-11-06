import {Router} from "express";
import {JsonServices} from "../../services/jsonconceptor/json.services";
import {FormatRestApiModels} from "../../models/formatRestApi.models";

const JsonController = Router();
const jsonServices = new JsonServices();





export default JsonController;
