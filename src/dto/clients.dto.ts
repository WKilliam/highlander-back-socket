import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {CardsDto} from "./cards.dto";

@Entity('client')
export class ClientDto {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50})
    pseudo: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column({name: 'created_at'})
    createdAt: string;

    @Column({length: 255})
    avatar: string;

    @Column()
    role: string;

    @Column({name: 'bear_coin'})
    bearcoin: number = 0;

    @ManyToMany(() => CardsDto, card => card.id)
    cardspossession: CardsDto[];
}
