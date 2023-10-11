import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {CardsDto} from "./cards.dto";

@Entity('client')
export class SessionDto{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pseudo: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column()
    createdAt: string;

    @Column()
    avatar: string;

    @Column()
    role: string;

    @Column({name: 'bear_coin'})
    bearcoin: number;

    @ManyToMany(() => CardsDto, card => card.id)
    cardspossession: CardsDto[];
}
