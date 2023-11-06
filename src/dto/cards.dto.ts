import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {EffectsDto} from "./effects.dto";
import {DecksDto} from "./decks.dto";
import {ClientDto} from "./clients.dto";
import {CapacityDto} from "./capacity.dto";

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
    spd : number

    @Column()
    luk : number

    @ManyToOne(() => DecksDto, (deck) => deck.cards)
    @JoinColumn({ name: 'deckId' })
    deck: DecksDto;

    @ManyToMany(() => CapacityDto, (capacity) => capacity.cards)
    @JoinTable({ name: 'cards_to_capacities'})
    capacities: CapacityDto[];

    @ManyToMany(() => EffectsDto, (effect) => effect.cards)
    @JoinTable({ name: 'cards_to_effects'})
    effects: EffectsDto[];

    @ManyToMany(() => ClientDto, (client) => client.cards)
    @JoinTable({ name: 'cards_to_clients'})
    clients: ClientDto[];
}
