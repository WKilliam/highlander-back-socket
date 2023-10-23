import {DataSource, Repository} from "typeorm";
import {SessionModelRequest, StatusGame} from "../../models/sessions.models";
import {SessionDto} from "../../dto/session.dto";
import {GamekeyServices} from "../gamekey/gamekey.services";
import {JsonconceptorService} from "../jsonconceptor/jsonconceptor.service";
import { PartiesModelsJson} from "../../models/parties.models";
import {MapsServices} from "../maps/maps.services";
import {Utils} from "../../utils/utils";
import {ClientDto} from "../../dto/clients.dto";

export class SessionsServices {
    dataSourceConfig: Promise<DataSource>;
    gamekeyServices: GamekeyServices;
    mapServices: MapsServices;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.gamekeyServices = new GamekeyServices(dataSourceConfig);
        this.mapServices = new MapsServices(dataSourceConfig);
    }

    async createSession(sessionModel: SessionModelRequest) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            const userRepository: Repository<ClientDto> = dataSource.getRepository(ClientDto);
            const creating = sessionRepository.create({
                ownerId: sessionModel.ownerId,
                createdAt: sessionModel.createdAt,
                updatedAt: sessionModel.updatedAt,
                statusGame: StatusGame.ON,
                statusAccess: sessionModel.statusAccess,
                password: sessionModel.password,
                name: sessionModel.name,
                freeplace: 7,
            })
            const saving = await sessionRepository.save(creating)
            const user : ClientDto | null = await userRepository.findOne({
                select: ["avatar", "pseudo", "cardspossession"],
                where: {id: sessionModel.ownerId}
            })
            if (!user) return Utils.formatResponse(404, 'Not User Found', 'User not found');
            const key = await this.gamekeyServices.createGamekey(saving.id)
            const map = await this.mapServices.getMapCompleted(sessionModel.mapId)
            let partiesModels: PartiesModelsJson = {
                map: map.data,
                sessions: {
                    id: saving.id,
                    ownerId: saving.ownerId,
                    gameKeySession: key.data.key,
                    createdAt: saving.createdAt,
                    updatedAt: saving.updatedAt,
                    statusGame: saving.statusGame,
                    statusAccess: saving.statusAccess,
                    password: saving.password,
                    name: saving.name,
                    freeplace: saving.freeplace,
                },
                game : Utils.initialiserGameModels(),
                infoGame: {
                    turnCount: 0,
                    orderTurn: [],
                }
            }
            console.log(user.cardspossession)
            partiesModels.game.lobby.push({
                avatar: user.avatar,
                pseudo: user.pseudo,
                cards: user.cardspossession,
            })
            JsonconceptorService.createDirectory(`${key.data.key}`)
            JsonconceptorService.createJsonFile(`${key.data.key}/parties.json`, partiesModels)
            return Utils.formatResponse(201,'Created', partiesModels);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', error);
        }
    }
}
