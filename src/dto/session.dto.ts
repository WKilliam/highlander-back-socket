import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {SessionGame} from "../models/session.models";
import {CardPlayerEntityModels, PlayerCardsEntity} from "../models/cards.player.entity.models";
import {PlayerModels} from "../models/player.models";
import {CardByEntityPlaying, CardsModels} from "../models/cards.models";
import {EntityStatus} from "../models/enums";


@Entity('session')
export class SessionDto {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('json', {nullable: true})
    game: SessionGame

}
