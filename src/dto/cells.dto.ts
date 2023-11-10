import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {MapsDto} from "./maps.dto";

@Entity('cells')
export class CellsDto {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    x: number;

    @Column()
    y: number;

    @Column()
    value: number;

    @ManyToOne((type) => MapsDto, (map) => map.id, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'map_id' })
    map: MapsDto
}
