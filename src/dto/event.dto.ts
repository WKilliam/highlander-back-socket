import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {CardsDto} from "./cards.dto";

@Entity('events')
export class EventDto {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    message : string

    @Column({name: 'type_event'})
    typeEvent : string
}
