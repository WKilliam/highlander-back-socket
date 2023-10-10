import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {MapsDto} from "./maps.dto";

@Entity('cells')
export class CellsDto {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne((type) => MapsDto, (map) => map.id, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'map_id' })
    map: MapsDto

    @Column()
    x: number;

    @Column()
    y: number;

    @Column()
    value: number;

}
