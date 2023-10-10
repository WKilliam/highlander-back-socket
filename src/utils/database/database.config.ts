import "reflect-metadata"
import { DataSource } from "typeorm"

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
    ],
    subscribers: [],
    migrations: [],
}).initialize();
