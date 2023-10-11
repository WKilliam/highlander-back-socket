import {DataSource, Repository} from "typeorm";
import {EffectsModelsRequest} from "../../models/effects.models";
import {GamekeyDto} from "../../dto/gamekey.dto";
import {EffectsDto} from "../../dto/effects.dto";
import {Utils} from "../../utils/utils";
import {FormatModel} from "../../models/format.model";

export class EffectsServices {
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createEffect(effect: EffectsModelsRequest) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const effectsRepository: Repository<EffectsDto> = dataSource.getRepository(EffectsDto);
            const newEffect = effectsRepository.create({
                name: effect.name,
                description: effect.description,
                icon: effect.icon,
                rarity: effect.rarity,
                type: effect.type,
                action: effect.action
            });
            const effectData = await effectsRepository.save(newEffect);
            return Utils.formatResponse(201,'Created Effects', effectData);
        } catch (error: any) {
            return { error: error.message , code: 500 } as FormatModel;
        }
    }

}
