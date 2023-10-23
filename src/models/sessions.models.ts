import {MapModels} from "./map.models";
import {ClientDto} from "../dto/clients.dto";

export interface SessionModel{
    id:number,
    ownerId: number,
    gameKeySession : string,
    createdAt:string,
    updatedAt: string,
    statusGame:StatusGame,
    statusAccess:StatusAccess,
    password:string,
    freeplace: number
    name: string
}

export interface SessionModelRequest{
    ownerId: number,
    name: string,
    createdAt:string,
    updatedAt: string,
    statusAccess:StatusAccess,
    password:string,
    mapId: number,
    teamNameOne: string,
    teamNameTwo: string,
    teamNameThree: string,
    teamNameFour: string,
}


export enum StatusGame{
    ON = "ON",
    OFF = "OFF"
}

export enum StatusAccess{
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}


export interface SessionJsonTeamUpdate{
    isAlive?: boolean,
    name?: string,
}
