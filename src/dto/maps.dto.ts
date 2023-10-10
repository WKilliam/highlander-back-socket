import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity('maps')
export class MapsDto {

    @PrimaryGeneratedColumn()
    id: number

    @Column({name: 'background_image', type: 'bytea'})
    backgroundImage: Buffer

    @Column()
    width: number;

    @Column()
    height: number;

}
