import {DataSource, Repository} from "typeorm";
import {MapsServices} from "../maps/maps.services";
import {SessionCreated, SessionGame} from "../../models/room.content.models";
import {PouchdbServices} from "../poutchdb/pouchdb.services";
import {Utils} from "../../utils/utils";
import {MapsDto} from "../../dto/maps.dto";
import fs from "fs"

export class SessionsServices {
    dataSourceConfig: Promise<DataSource>;
    dataSourceConfigPouchDB: PouchdbServices;
    private readonly directory: string = 'parties';

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.dataSourceConfigPouchDB = new PouchdbServices();
    }

    createGameKey(): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    getFilesInDirectory(): string[] {
        const files = fs.readdirSync(this.directory);
        return files;
    }

    newKeyIfNotExist(){
        let key:string = '';
        let isExist:boolean = true;
        let end :number= 0;

        while (true){
            key = this.createGameKey();
            if(end === 5){
                return Utils.formatResponse(500, 'Key count timeout error', 'key not found', 'Key count timeout error');
            }else{
                if(this.getFilesInDirectory().includes(key)){
                    end++;
                }else{
                    return Utils.formatResponse(200, 'Key success', 'key found', key);
                }
            }
        }
    }

    async create(session: SessionCreated) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const mapDtoRepository:Repository<MapsDto> = dataSource.getRepository(MapsDto);
            const map = await mapDtoRepository.findOne({
                where: {id: session.mapId},
                relations: ['cells']
            });
            if (!map) {
                return Utils.formatResponse(500, 'Map not found', 'map not found', 'Map not found');
            }
            const gamekey = this.newKeyIfNotExist();
            if(gamekey.code === 500){
                return Utils.formatResponse(500, 'Key count timeout error', 'key not found', 'Key count timeout error');
            }
            const sessionGame: SessionGame = Utils.initSessionGame(gamekey.data, session.teamNames, map);
            const pouchdb = await this.dataSourceConfigPouchDB.createDocument(gamekey.data,sessionGame);
            if(pouchdb.code === 500){
                return Utils.formatResponse(500, 'Pouchdb error', 'pouchdb error', 'Pouchdb error');
            }else{
                return Utils.formatResponse(200, 'Session created', sessionGame, null);
            }
        }catch (error:any){
            return Utils.formatResponse(500, error.message, null, null);
        }
    }

}
