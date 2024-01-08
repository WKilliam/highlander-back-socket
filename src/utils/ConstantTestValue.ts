import {SessionDto} from "../dto/session.dto";
import {SessionModels} from "../models/session.models";

export class ConstantTestValue{
    static sessionDto :SessionDto = {
        id: 1,
        game : SessionModels.initSessionGame()
    }
}
