import {DataSource, Repository} from "typeorm";
import {SessionModelRequest, StatusGame} from "../../models/sessions.models";
import {SessionDto} from "../../dto/session.dto";
import {GamekeyServices} from "../gamekey/gamekey.services";
import {JsonconceptorService} from "../jsonconceptor/jsonconceptor.service";
import {PartiesModels} from "../../models/parties.models";
import {MapsServices} from "../maps/maps.services";

export class SessionsServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }


    async createSession(sessionModel:SessionModelRequest) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            const creating = sessionRepository.create({
                ownerId: sessionModel.ownerId,
                createdAt: sessionModel.createdAt,
                updatedAt: sessionModel.updatedAt,
                statusGame: StatusGame.ON,
                statusAccess: sessionModel.statusAccess,
                password: sessionModel.password,
                name: sessionModel.name,
                freeplace: 10
            })
            const saving = await sessionRepository.save(creating)
            const key = await new GamekeyServices(this.dataSourceConfig).createGamekey(saving.id)
            JsonconceptorService.createDirectory(key.key)
            const map = await new MapsServices(this.dataSourceConfig).getMapCompleted(sessionModel.mapId)

        }catch (error:any){
            return error
        }
    }
}
