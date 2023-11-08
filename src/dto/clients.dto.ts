import {Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {CardsDto} from "./cards.dto";
import {DecksDto} from "./decks.dto";

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

    @ManyToMany(() => CardsDto, (card) => card.clients, { onDelete: 'CASCADE' })
    @JoinTable({name: 'cards_to_clients'})
    userCards: CardsDto[];

}
