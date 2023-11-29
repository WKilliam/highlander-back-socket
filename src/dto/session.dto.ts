import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {SessionGame} from "../models/room.content.models";

@Entity('session')
export class SessionDto {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('json', { nullable: true })
    game:SessionGame
}
