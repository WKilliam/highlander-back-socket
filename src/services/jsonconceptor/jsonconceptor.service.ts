import fse from 'fs-extra';
import {Utils} from "../../utils/utils";
import {FormatModel} from "../../models/format.model";

export class JsonconceptorService {

    // static createDirectory(path: string): FormatModel {
    //     try {
    //         fse.ensureDirSync(`parties/${path}`);
    //         return Utils.formatResponse(200, 'Directory created', null);
    //     } catch (error:any) {
    //         return Utils.formatResponse(500, 'Internal Server Error', error);
    //     }
    // }

    static createJsonFile(path: string, data: any): FormatModel {
        try {
            const json = JSON.stringify(data);
            fse.writeFileSync(`parties/${path}`, json);
            return Utils.formatResponse(200, 'Directory created', null);
        } catch (error:any) {
            return Utils.formatResponse(500, 'Internal Server Error', error);
        }
    }

    static readJsonFile(path: string): FormatModel {
        try {
            console.log(path)
            const json = fse.readFileSync(`parties/${path}/parties.json`, 'utf8');
            return Utils.formatResponse(200, 'Directory created', json);
        } catch (error:any) {
            return Utils.formatResponse(500, 'Internal Server Error', error);
        }
    }

    static getJsonFile(pathKeySession: string,keyJson:string): FormatModel {
        try {
            const json = fse.readJsonSync(`parties/${pathKeySession}/parties.json`);
            const data = keyJson.split('.').reduce((obj, key) => obj[key], json);
            return Utils.formatResponse(200, 'Directory created', data);
        } catch (error) {
            return Utils.formatResponse(500, `Internal Server Error`, error);
        }
    }


    // static updateJsonKey(obj: any, keyPath: string, value: any): void {
    //     const keys = keyPath.split('.');
    //     let currentObj = obj;
    //
    //     for (let i = 0; i < keys.length - 1; i++) {
    //         if (!currentObj[keys[i]]) {
    //             currentObj[keys[i]] = {};
    //         }
    //         currentObj = currentObj[keys[i]];
    //     }
    //
    //     currentObj[keys[keys.length - 1]] = value;
    // }
    //
    // static updateJsonFile(path: string, keyPath: string, value: any): FormatModel {
    //     try {
    //         const json = fse.readFileSync(`parties/${path}/parties.json`, 'utf8');
    //         const data = JSON.parse(json);
    //         this.updateJsonKey(data, keyPath, value);
    //         const updatedJson = JSON.stringify(data);
    //         fse.writeFileSync(`parties/${path}/parties.json`, updatedJson);
    //         return Utils.formatResponse(200, 'Directory created', null);
    //     } catch (error) {
    //         return Utils.formatResponse(500, 'Internal Server Error', error);
    //     }
    // }

    static mergeJsonData(target: any, source: any): void {
        for (const key in source) {
            if (source[key] instanceof Object && !Array.isArray(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                this.mergeJsonData(target[key], source[key]);
            } else if (source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    }

    static updateJsonFile(path: string, keyPath: string, value: any): FormatModel {
        try {
            const json = fse.readFileSync(`parties/${path}/parties.json`, 'utf8');
            const data = JSON.parse(json);

            // Obtenez la partie des données que vous souhaitez mettre à jour en utilisant la clé keyPath
            const targetData = keyPath.split('.').reduce((obj, key) => obj[key], data);

            // Fusionnez les nouvelles données dans la partie ciblée de vos données
            this.mergeJsonData(targetData, value);

            const updatedJson = JSON.stringify(data);
            fse.writeFileSync(`parties/${path}/parties.json`, updatedJson);
            return Utils.formatResponse(200, 'Directory created', null);
        } catch (error) {
            return Utils.formatResponse(500, 'Internal Server Error', error);
        }
    }
}
