import {DataSource, In, Repository} from "typeorm";

import {ClientDto} from "../../dto/clients.dto";
import {Utils} from "../../utils/utils";
import {CardsDto} from "../../dto/cards.dto";
import {UsersLogin, UserSubscription} from "../../models/users.models";

export class UsersServices{

    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async create(user: UserSubscription) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const usersDtoRepository: Repository<ClientDto> = dataSource.getRepository(ClientDto);
            const newUser: ClientDto = usersDtoRepository.create({
                pseudo: user.pseudo,
                email: user.email,
                password: user.password,
                avatar: user.avatar,
                role: 'user',
                createdAt: new Date().toISOString()
            })
            const createdUser: ClientDto = await usersDtoRepository.save(newUser);
            if (!createdUser) return Utils.formatResponse(500, 'User created Error', newUser, null);
            return Utils.formatResponse(201, 'User created successfully', createdUser, null);
        }catch (error:any){
            return Utils.formatResponse(500, 'Internal server error', null, error.message);
        }
    }
}
