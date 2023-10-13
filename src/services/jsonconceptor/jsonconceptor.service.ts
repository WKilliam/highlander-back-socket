import fse from 'fs-extra';

export class JsonconceptorService {

    static createDirectory(path: string): void {
        try {
            fse.ensureDirSync(`parties/${path}`);
        } catch (error:any) {
            return error
        }
    }

    static createJsonFile(path: string, data: any): void {
        try {
            const json = JSON.stringify(data);
            fse.writeFileSync(`parties/${path}`, json);
        } catch (error:any) {
            return error
        }
    }

    static readJsonFile(path: string): any {
        try {
            console.log(path)
            const json = fse.readFileSync(`parties/${path}/parties.json`, 'utf8');
            return JSON.parse(json);
        } catch (error:any) {
            return error
        }
    }

    static updateJsonKey(obj, keyPath, value) {
        const keys = keyPath.split('.');
        let currentObj = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!currentObj[keys[i]]) {
                currentObj[keys[i]] = {};
            }
            currentObj = currentObj[keys[i]];
        }

        currentObj[keys[keys.length - 1]] = value;
    }

    static updateJsonFile(path, keyPath, value) {
        try {
            const json = fse.readFileSync(`parties/${path}`, 'utf8');
            const data = JSON.parse(json);
            updateJsonKey(data, keyPath, value);
            const updatedJson = JSON.stringify(data);
            fse.writeFileSync(`parties/${path}`, updatedJson);
        } catch (error) {
            return error;
        }
    }
}
