import {Cellsmodel} from "./cells.models";
import {TypeEvent} from "../utils/enum/enum";



export interface EventsCellModels{
    cells: Cellsmodel,
    message: string,
    typeEvent: TypeEvent,
}


export interface EventsRequestModels{
    typeEvent: string,
    message: string,
}
