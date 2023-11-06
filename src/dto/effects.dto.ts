import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {CardsDto} from "./cards.dto";

@Entity('effects')
export class EffectsDto {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 200 })
    name : string

    @Column({ length: 500 })
    description : string

    @Column()
    icon : string

    @Column()
    rarity : string

    @Column({ length: 50 })
    action : string

    @ManyToOne(() => CardsDto, (card) => card.effects)
    @JoinTable({ name: 'cards_to_effects'})
    cards: CardsDto[];
}
