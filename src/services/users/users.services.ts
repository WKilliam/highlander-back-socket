import {DataSource} from "typeorm";
import {UserSubscription} from "../../models/users.models";

export class UsersServices{

    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createUser(userSubscription: UserSubscription){
        try {

        }catch (error:any){
            return error
        }
    }
}
