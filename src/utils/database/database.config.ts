import "reflect-metadata"
import { DataSource } from "typeorm"
import {CellsDto} from "../../dto/cells.dto";
import {MapsDto} from "../../dto/maps.dto";
import {GamekeyDto} from "../../dto/gamekey.dto";
import {SessionDto} from "../../dto/session.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {CardsDto} from "../../dto/cards.dto";
import {EventDto} from "../../dto/event.dto";
import {DecksDto} from "../../dto/decks.dto";
import {ClientDto} from "../../dto/clients.dto";
import {CapacityDto} from "../../dto/capacity.dto";
import PouchDB from "pouchdb";

export const AppDataSource  = new DataSource({
    // type: "mariadb",
    // host: "localhost",
    // port: 3306,
    // username: "bearman",
    // password: "bearman",
    // database: "mydb",
    type: 'sqlite',
    database: 'src/utils/database/data.db',
    synchronize: true,
    logging: true,
    entities: [
        CellsDto,
        MapsDto,
        GamekeyDto,
        SessionDto,
        EffectsDto,
        CardsDto,
        EventDto,
        DecksDto,
        ClientDto,
        CapacityDto
    ],
    subscribers: [],
    migrations: [],
}).initialize();


