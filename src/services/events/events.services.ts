import {DataSource, Repository} from "typeorm";
import {EffectsDto} from "../../dto/effects.dto";
import {EventDto} from "../../dto/event.dto";
import {EventsRequestModels} from "../../models/events.models";
import {Utils} from "../../utils/utils";
import {FormatModel} from "../../models/format.model";

export class EventsServices{
    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
    }

    async createEvents(eventModelsRequest: EventsRequestModels) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const eventsRepository: Repository<EventDto> = dataSource.getRepository(EventDto);
            const newEvents = eventsRepository.create({
                message: eventModelsRequest.message,
                typeEvent: eventModelsRequest.typeEvent
            })
            const event =  await eventsRepository.save(newEvents);
            return Utils.formatResponse(201,'Created', event);
        } catch (error: any) {
            return { error: error.message , code: 500 } as FormatModel;
        }
    }
}
