import "reflect-metadata"
import { DataSource } from "typeorm"
import {CellsDto} from "../../dto/cells.dto";
import {MapsDto} from "../../dto/maps.dto";
import {GamekeyDto} from "../../dto/gamekey.dto";
import {SessionDto} from "../../dto/session.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {CardsDto} from "../../dto/cards.dto";

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
        CardsDto
    ],
    subscribers: [],
    migrations: [],
}).initialize();
