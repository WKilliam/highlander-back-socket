import {SessionModel} from "./sessions.models";
import {TeamsModels} from "./teams.models";
import {EventsModels} from "./events.models";

export interface PartiesModels {
    session : SessionModel
    teams : TeamsModels
    events : EventsModels
}
