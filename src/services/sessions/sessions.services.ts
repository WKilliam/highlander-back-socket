import {DataSource, Repository} from "typeorm";
import {SessionModelRequest, StatusGame} from "../../models/sessions.models";
import {SessionDto} from "../../dto/session.dto";
import {GamekeyServices} from "../gamekey/gamekey.services";
import {JsonconceptorService} from "../jsonconceptor/jsonconceptor.service";
import {PartiesModels} from "../../models/parties.models";
import {MapsServices} from "../maps/maps.services";
import {Utils} from "../../utils/utils";
import {FormatModel} from "../../models/format.model";

export class SessionsServices {
    dataSourceConfig: Promise<DataSource>;
    gamekeyServices: GamekeyServices;
    mapServices: MapsServices;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.gamekeyServices = new GamekeyServices(dataSourceConfig);
        this.mapServices = new MapsServices(dataSourceConfig);
    }

    async createSession(sessionModel:SessionModelRequest) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            let players = Utils.createPlayersModelsInit()
            let monster = Utils.createPlayersModelsMonsterInit(5)
            let arrayNameTeam: Array<string> = [
                sessionModel.teamNameOne,
                sessionModel.teamNameTwo,
                sessionModel.teamNameThree,
                sessionModel.teamNameFour
            ];
            let teamPlayer =Utils.createTeamBodyModelsInit(players,arrayNameTeam)
            let teamModels = Utils.createTeamsModelsInit(teamPlayer)
            let teamMonster =Utils.createTeamsMonstersModelsInit(monster,5)
            let monsterModels = Utils.createMonstersModelsInit(teamMonster)
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
            const key = await this.gamekeyServices.createGamekey(saving.id)
            const map = await this.mapServices.getMapCompleted(sessionModel.mapId)
            const partiesModels: PartiesModels = {
                toursCount: 0,
                orderTurn: [],
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
                map: map.data,
                teams: teamModels,
                monsters: monsterModels,
                events: []
            }
            
            return Utils.formatResponse(201,'Created', partiesModels);
        } catch (error: any) {
            return Utils.formatResponse(500,'Internal Server Error', error);
        }
    }
}
