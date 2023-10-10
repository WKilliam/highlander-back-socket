import {Cellsmodel} from "./cells.models";

export interface EventsModels{
    events: EventsCellModels[],
}

export interface EventsCellModels{
    cells: Cellsmodel,
    message: string,
    action: string,
}


export interface EventsRequestModels{
    type: string,
    message: string,
    x: number,
    y: number,
    action: string,
}
