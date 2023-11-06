import {DataSource} from "typeorm";

export class EventsServices{
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }


}
