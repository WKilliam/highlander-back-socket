import {DataSource, Repository} from "typeorm";
import {SessionGamePlace, SessionModelRequest, StatusGame} from "../../models/sessions.models";
import {SessionDto} from "../../dto/session.dto";
import {GamekeyServices} from "../gamekey/gamekey.services";
import {JsonconceptorService} from "../jsonconceptor/jsonconceptor.service";
import {PartiesFullBodyModels} from "../../models/parties.models";
import {MapsServices} from "../maps/maps.services";
import {Utils} from "../../utils/utils";
import {ClientDto} from "../../dto/clients.dto";
import {CardsDto} from "../../dto/cards.dto";
import {InfoGame} from "../../models/infoGame";
import {GamekeyDto} from "../../dto/gamekey.dto";
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

    async createSession(sessionModel: SessionModelRequest) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
            const userRepository: Repository<ClientDto> = dataSource.getRepository(ClientDto);
            const cardsRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
            // Create session
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
            // Get user
            const user: ClientDto | null = await userRepository.findOne({
                select: ["avatar", "pseudo", "cards"],
                where: {id: sessionModel.ownerId}
            })
            if (!user) return Utils.formatResponse(404, 'Not User Found', 'User not found');
            const key = await this.gamekeyServices.createGamekey(saving.id)
            const map = await this.mapServices.getMapCompleted(sessionModel.mapId)
            let infoGame: InfoGame = Utils.initInfoGameModels(key.data.key, user.avatar, user.pseudo)
            let game = Utils.initialiserGameModels(
                sessionModel.teamNameOne, sessionModel.teamNameTwo,
                sessionModel.teamNameThree, sessionModel.teamNameFour)
            const allCardsUsserPossess = await cardsRepository.find({
                select: ["id", "name", "description", "image", "rarity", "atk", "def", "spd", "luk", "effects",],
                where: {clients: {id: sessionModel.ownerId}}
            })
            infoGame.lobby.push({avatar: user.avatar, pseudo: user.pseudo, cards: allCardsUsserPossess,})
            const partiesFullBodyModels: PartiesFullBodyModels = {infoGame: infoGame, game: game, map: map.data}
            JsonconceptorService.createDirectoryAndJsonFile(`${key.data.key}`, partiesFullBodyModels)
            return Utils.formatResponse(201, 'Created', partiesFullBodyModels);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', error);
        }
    }

    // async checkFreePlaceSessionToGamekey(key: SessionGamePlace) {
    //     try {
    //         const dataSource: DataSource = await this.dataSourceConfig;
    //         const sessionRepository: Repository<SessionDto> = dataSource.getRepository(SessionDto);
    //         const gameKeyRepository: Repository<GamekeyDto> = dataSource.getRepository(GamekeyDto);
    //         const userRepository: Repository<ClientDto> = dataSource.getRepository(ClientDto);
    //         const cardsRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);
    //         let partiesContent: FormatModel = Utils.partiesDataSocket(key.gameKeySession)
    //         if (partiesContent.code <= 200 && partiesContent.code > 300) return Utils.formatResponse(
    //             partiesContent.code,
    //             partiesContent.message,
    //             partiesContent.data,
    //             partiesContent.error
    //         );
    //         let partiesFullBodyModelsSend: PartiesFullBodyModels = partiesContent.data
    //
    //         let user = partiesFullBodyModelsSend.infoGame.allPlayers.filter(item => {
    //             if (item.avatar === key.avatar && item.pseudo === key.pseudo) {
    //                 return item
    //             }
    //         })
    //         if (user.length > 0) {
    //             return Utils.formatResponse(200, 'Customer refresh', partiesFullBodyModelsSend);
    //         } else {
    //             const sessionBYGamekey = await gameKeyRepository.findOne({
    //                 select: ["session"],
    //                 where: {key: key.gameKeySession},
    //                 relations: ["session"]
    //             })
    //             if (!sessionBYGamekey) return Utils.formatResponse(404, 'Not Session Found', 'Session not found');
    //             if (sessionBYGamekey.session.freeplace === 0) return Utils.formatResponse(403, 'Forbidden', 'Session is full');
    //             // Get user
    //             const user: ClientDto | null = await userRepository.findOne({
    //                 select: ["avatar", "pseudo", "cards"],
    //                 where: {avatar: key.avatar, pseudo: key.pseudo}
    //             })
    //             if (!user) return Utils.formatResponse(404, 'Not User Found', 'User not found');
    //             const allCardsUsserPossess = await cardsRepository.find({
    //                 select: ["id", "name", "description", "image", "rarity", "atk", "def", "spd", "luk", "effects",],
    //                 where: {clients: {id: user.id}}
    //             })
    //             partiesFullBodyModelsSend.infoGame.lobby.push({
    //                 avatar: user.avatar,
    //                 pseudo: user.pseudo,
    //                 cards: allCardsUsserPossess,
    //             })
    //             partiesFullBodyModelsSend.infoGame.allPlayers.push({
    //                 avatar: key.avatar,
    //                 pseudo: key.pseudo,
    //                 teamTag: ""
    //             })
    //
    //             let infoGame = JsonconceptorService.infoGameUpdateLobbyAndAllPlayerJsonFile(
    //                 `${key.gameKeySession}/infogame.json`,
    //                 partiesFullBodyModelsSend.infoGame.allPlayers,
    //                 partiesFullBodyModelsSend.infoGame.lobby)
    //             if (infoGame.code <= 200 && infoGame.code > 300) return Utils.formatResponse(404, 'Not InfoGame Found', 'InfoGame not found');
    //             partiesFullBodyModelsSend.infoGame = infoGame.data
    //             await sessionRepository.update(sessionBYGamekey.session.id, {freeplace: sessionBYGamekey.session.freeplace - 1});
    //             return Utils.formatResponse(200, 'Customer refresh', partiesFullBodyModelsSend);
    //         }
    //     } catch (error: any) {
    //         return Utils.formatResponse(500, 'Internal Server Error', error);
    //     }
    // }
}
