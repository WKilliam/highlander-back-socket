import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {CardsDto} from "./cards.dto";

@Entity('capacity')
export class CapacityDto {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 200 })
    name : string

    @Column({ length: 500 })
    description : string

    @Column({ length: 500 })
    icon : string

    @Column({ length: 50 })
    action : string

    @ManyToOne(() => CardsDto, (card) => card.capacities)
    @JoinTable({ name: 'cards_to_capacities'})
    cards: CardsDto[];
}
