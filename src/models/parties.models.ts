import {SessionModel} from "./sessions.models";
import {MonstersModels, TeamsModels} from "./teams.models";
import {EventsCellModels} from "./events.models";
import {MapModels} from "./map.models";

export interface PartiesModels {
    toursCount: number,
    orderTurn:Array<number>
    sessions: SessionModel,
    map: MapModels,
    teams: TeamsModels,
    monsters: MonstersModels,
    events: EventsCellModels[],
}
