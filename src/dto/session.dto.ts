import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {StatusAccess, StatusGame} from "../models/sessions.models";
import {CellsDto} from "./cells.dto";
import {GamekeyDto} from "./gamekey.dto";

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
    statusGame:StatusGame;

    @Column()
    statusAccess:StatusAccess;

    @Column({type: "varchar", length: 70})
    password:string;

    @Column({type: "varchar", length: 70})
    name: string;

    @Column()
    freeplace: number = 8;

    @OneToMany(() => GamekeyDto, (gamekey) => gamekey.session)
    cells: GamekeyDto[];
}
