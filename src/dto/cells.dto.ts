import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
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

    @ManyToMany(() => MapsDto, (map) => map.id, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'mapId' })
    map: MapsDto;
}
