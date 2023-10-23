import {DataSource, In, Repository} from "typeorm";
import {UserLogin, UserSubscription} from "../../models/users.models";
import {FormatModel} from "../../models/format.model";
import {ClientDto} from "../../dto/clients.dto";
import {Utils} from "../../utils/utils";
import {CardsDto} from "../../dto/cards.dto";

export class UsersServices{

    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createUser(userSubscription: UserSubscription) : Promise<FormatModel> {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const userRepository:Repository<ClientDto> = dataSource.getRepository(ClientDto);
            const cardRepository:Repository<CardsDto> = dataSource.getRepository(CardsDto);
            const cardsStarter = [1,2,3]
            const cards = await cardRepository.find({where: {id: In(cardsStarter)}});
            const newUser = userRepository.create({
                pseudo: userSubscription.pseudo,
                password: userSubscription.password,
                email: userSubscription.email,
                avatar: userSubscription.avatar,
                createdAt: new Date().toLocaleDateString(),
                role: "user",
                cardspossession: cards
            });
            const user = await userRepository.save(newUser);
            return Utils.formatResponse(200, "User created", user)
        }catch (error:any){
            return Utils.formatResponse(500, `${error}`, null)
        }
    }

    async getUserByEmailAndPassword(user:UserLogin) : Promise<FormatModel> {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const userRepository:Repository<ClientDto> = dataSource.getRepository(ClientDto);
            const userFound = await userRepository.findOne({
                select: ["id", "pseudo","email", "avatar", "bearcoin", "cardspossession"],
                where: {email: user.email, password: user.password}
            });
            if (userFound) {
                return Utils.formatResponse(200, "User found", userFound)
            } else {
                return Utils.formatResponse(404, `User not found`, null)
            }
        }catch (error:any){
            return Utils.formatResponse(500, `${error}`, null)
        }
    }
}
