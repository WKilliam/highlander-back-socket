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

export const AppDataSource  = new DataSource({
    type: "mariadb",
    host: "163.172.34.147",
    port: 3306,
    username: "bearman",
    password: "bearman",
    database: "mydb",
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
    ],
    subscribers: [],
    migrations: [],
}).initialize();
