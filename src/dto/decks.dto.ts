import {Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {CardsDto} from "./cards.dto";

@Entity('decks')
export class DecksDto {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name : string

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    @Column()
    description: string;

    @Column()
    image: string;

    @Column()
    type: string;

    @Column()
    rarity: string;

    @Column()
    count: number;

    @OneToMany(() => CardsDto, (card) => card.deck, { cascade: true })
    cards: CardsDto[];

}
