import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {GamekeyDto} from "./gamekey.dto";
import {StatusGame} from "../models/room.content.models";

@Entity('session')
export class SessionDto{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ownerId: number;

    @Column()
    createdAt:string;

    @Column()
    updatedAt: string;

    @Column()
    statusGame:string;

    @Column({type: "varchar", length: 70})
    password:string;

    @Column({type: "varchar", length: 70})
    name: string;

    @OneToMany(() => GamekeyDto, (gamekey) => gamekey.session)
    gamekeyDtos: GamekeyDto[];
}
