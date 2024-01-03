export interface FormatRestApi {
    date: string;
    data: any;
    message: string;
    code: number;
    error: any
}

export class FormatRestApiModels {
    static initFormatRestApi(): FormatRestApi {
        return {
            date: new Date().toISOString(),
            data: '',
            message: '',
            code: 0,
            error: ''
        }
    }

    static createFormatRestApi(
        code: number,
        message: string,
        data: any,
        error: any): FormatRestApi {
        return {
            date: new Date().toISOString(),
            data: data,
            code: code,
            message: message ,
            error: error
        }
    }
}
