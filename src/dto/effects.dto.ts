import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {CardsDto} from "./cards.dto";

@Entity('effects')
export class EffectsDto {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name : string

    @Column()
    description : string

    @Column()
    icon : string

    @Column()
    rarity : string

    // Type d'effet (par exemple, "Dégâts", "Soins", "Buff", "Debuff", etc.)
    @Column()
    type : string

    @Column()
    action : string

    @ManyToMany(() => CardsDto, card => card.effects)
    cards: CardsDto[];
}
