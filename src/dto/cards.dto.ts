import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {EffectsDto} from "./effects.dto";
import {DecksDto} from "./decks.dto";

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

    @ManyToMany(() => DecksDto, deck => deck.cards, { eager: true, onDelete: 'CASCADE' })
    decks: DecksDto[];
}
