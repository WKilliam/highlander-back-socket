import {FormatModel} from "../../models/format.model";
import {JsonconceptorService} from "../jsonconceptor/jsonconceptor.service";
import {Utils} from "../../utils/utils";

export class JsonServices {


    async getJson(sessionKey: string, keyPath: string) {
        try {
            const received: FormatModel = JsonconceptorService.getJsonFile(sessionKey, keyPath)
            return Utils.formatResponse(received.code, received.message, received.data, received.error);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }


    async patchJson(sessionKey: string, keyPath: string, data: any) {
        try {
            console.log(data)
            const jsonUpdate = JsonconceptorService.updateJsonFile(sessionKey, keyPath, data)
            return Utils.formatResponse(jsonUpdate.code, jsonUpdate.message, jsonUpdate.data, jsonUpdate.error);
        }catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', null, error)
        }
    }

}
