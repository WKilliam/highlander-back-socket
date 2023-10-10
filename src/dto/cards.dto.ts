import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {EffectsDto} from "./effects.dto";

@Entity('cards')
export class CardsDto {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name : string

    @Column()
    description : string

    @Column()
    image : string

    @Column()
    rarity : string

    @Column()
    atk : number

    @Column()
    def : number

    @Column()
    vit : number

    @Column()
    luk : number

    @ManyToMany(() => EffectsDto, effect => effect.cards)
    @JoinTable()
    effects: EffectsDto[];
}
