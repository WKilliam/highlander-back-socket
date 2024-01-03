import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {SessionGame} from "../models/session.models";


@Entity('session')
export class SessionDto {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('json', { nullable: true })
    game:SessionGame
}
