import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {CellsDto} from "./cells.dto";

@Entity('maps')
export class MapsDto {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'background_image', type: 'varchar', length: 255 })
    backgroundImage: string;

    @Column()
    width: number;

    @Column()
    height: number;

    @Column()
    name: string;

    @OneToMany(() => CellsDto, (cell) => cell.map)
    cells: CellsDto[];
}
