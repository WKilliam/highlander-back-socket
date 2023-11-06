import {DataSource, Repository} from "typeorm";
import {SessionDto} from "../../dto/session.dto";
import {GamekeyServices} from "../gamekey/gamekey.services";
import {MapsServices} from "../maps/maps.services";
import {Utils} from "../../utils/utils";
import {ClientDto} from "../../dto/clients.dto";
import {SessionCreated, SessionGame, StatusGame} from "../../models/room.content.models";
import {MapsDto} from "../../dto/maps.dto";
import {PouchdbServices} from "../jsonconceptor/pouchdb.services";
import {FormatRestApiModels} from "../../models/formatRestApi.models";
import {PlayerLobby} from "../../models/player.models";

export class SessionsServices {
    dataSourceConfig: Promise<DataSource>;
    gamekeyServices: GamekeyServices;
    mapServices: MapsServices;
    dataSourceConfigPouchDB: PouchdbServices;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.gamekeyServices = new GamekeyServices(dataSourceConfig);
        this.mapServices = new MapsServices(dataSourceConfig);
        this.dataSourceConfigPouchDB = new PouchdbServices();
    }



}
