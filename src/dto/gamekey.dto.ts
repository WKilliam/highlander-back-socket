import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {MapsDto} from "./maps.dto";
import {SessionDto} from "./session.dto";

@Entity('gamekey')
export class GamekeyDto {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => SessionDto, session => session.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id'})
    session: SessionDto;

    @Column()
    key: string;

}
