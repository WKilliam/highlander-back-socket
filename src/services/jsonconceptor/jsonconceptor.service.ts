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
            const json = fse.readFileSync(`parties/${path}`, 'utf8');
            return JSON.parse(json);
        } catch (error:any) {
            return error
        }
    }

    static updateJsonFile(path: string, key: string, value: any): void {
        try {
            const json = fse.readFileSync(`parties/${path}`, 'utf8');
            const data = JSON.parse(json);
            data[key] = value;
            const updatedJson = JSON.stringify(data);
            fse.writeFileSync(`parties/${path}`, updatedJson);
        } catch (error:any) {
            return error
        }
    }
}
