import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {MapsDto} from "./maps.dto";

@Entity('cells')
export class CellsDto {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    x: number;

    @Column()
    y: number;

    @Column()
    value: number;

    @ManyToOne(() => MapsDto, (map) => map.cells, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'mapId' })
    map: MapsDto

}
