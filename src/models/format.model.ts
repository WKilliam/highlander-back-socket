export interface FormatModel{
    code: number;
    message?: string;
    data?: any;
    error?: any;
}

export interface SocketFormatModel {
    date: string;
    room: string;
    data?: any;
    message: string;
    code: number;
    error: any;
}
