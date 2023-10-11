import {DataSource} from "typeorm";

export class UsersServices{

    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createUser(){
        try {

        }catch (error:any){
            return error
        }
    }
}
