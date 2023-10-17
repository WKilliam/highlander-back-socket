import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {EffectsDto} from "./effects.dto";
import {DecksDto} from "./decks.dto";
import {ClientDto} from "./clients.dto";

@Entity('cards')
export class CardsDto {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name : string

    @Column({ length: 500 })
    description : string

    @Column({ length: 500 })
    image : string

    @Column()
    rarity : string

    @Column()
    createdAt : string

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

    @ManyToMany(() => ClientDto, userposse => userposse.cardspossession)
    @JoinTable()
    userposse: ClientDto[];

}
