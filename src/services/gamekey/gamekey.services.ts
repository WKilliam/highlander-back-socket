import {DataSource, Repository} from "typeorm";
import {GamekeyDto} from "../../dto/gamekey.dto";
import {Utils} from "../../utils/utils";

export class GamekeyServices{
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createGamekey(sessionId: number) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const gamekeyRepository: Repository<GamekeyDto> = dataSource.getRepository(GamekeyDto);
            let generateKey: string = Utils.createGameKeySession(false);
            const valideKey: string = await this.refreshCanCreateGamekey(generateKey);
            if (valideKey === "-1") {
                return Utils.formatResponse(
                    500,
                    'Error: Impossible to generate a key',
                    {error: 'Impossible to generate a key'} );
            }
            console.log(valideKey)
            const gamekeyDto = new GamekeyDto();
            gamekeyDto.key = valideKey;
            gamekeyDto.session = {id: sessionId} as any;
            const create = gamekeyRepository.create(gamekeyDto)
            const keyGen =  await gamekeyRepository.save(create);
            return Utils.formatResponse(
                200,
                'Key created',
                keyGen );
        } catch (error: any) {
            return Utils.formatResponse( 500, 'Internal server error', error);
        }
    }

    async findGamekeyEsistant(generateKey: string): Promise<boolean> {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const gamekeyRepository: Repository<GamekeyDto> = dataSource.getRepository(GamekeyDto);
            let isExist = await gamekeyRepository.findBy({key: generateKey});
            return isExist.length > 0;
        } catch (error) {
            return false;
        }
    }

    async refreshCanCreateGamekey(generateKey: string): Promise<string> {
        if (!(await this.findGamekeyEsistant(generateKey))) {
            return generateKey; // Retourner generateKey si elle n'existe pas
        }
        for (let refreshTesting = 0; refreshTesting < 5; refreshTesting++) {
            let valideKey = Utils.createGameKeySession(false);
            if (!(await this.findGamekeyEsistant(valideKey))) {
                return valideKey; // Retourner valideKey si elle n'existe pas
            }
        }
        return "-1"; // Si les 5 tentatives échouent, retourner -1
    }

    async findOneKeyToSession(sessionId: number) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const gamekeyRepository: Repository<GamekeyDto> = dataSource.getRepository(GamekeyDto);
            const findKey = await gamekeyRepository.findOne({
                select:{
                    id: true,
                    key: true,
                },
                where:{
                    id: sessionId
                }});
            return Utils.formatResponse(
                200,
                'Key found',
                findKey );
        } catch (error: any) {
            return Utils.formatResponse( 500, 'Internal server error', error);
        }
    }


}
