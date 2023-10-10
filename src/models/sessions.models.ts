import {MapModels} from "./map.models";

export interface SessionModel{
    id:number,
    ownerId: number,
    gameKeySession : string,
    createdAt:string,
    updatedAt: string,
    statusGame:StatusGame,
    statusAccess:StatusAccess,
    password:string,
    freeplace: number,
    name: string,
    map?: MapModels
}

export interface SessionModelRequest{
    ownerId: number,
    name: string,
    createdAt:string,
    updatedAt: string,
    statusAccess:StatusAccess,
    password:string,
    mapId: number
}


export enum StatusGame{
    ON = "ON",
    OFF = "OFF"
}

export enum StatusAccess{
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}