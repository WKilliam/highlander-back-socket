import jwt from 'jsonwebtoken';
import {Utils} from "../utils";
import {FormatRestApi, FormatRestApiModels} from "../../models/formatRestApi";

interface TokenData {
    userId: number;
    email: string;
    password: string;
    roles: string[];
}

export class TokenManager {
    private readonly secretKey: string;
    private successTokenCreated:string = 'Token Created';
    private failledTokenCreated:string = 'Token Not Created';
    private failledTokenSuccess:string = 'Token Success';
    private failledTokenError:string = 'Token Error';
    private failledTokenInvalid:string = 'Token Invalid';


    constructor(secretKey: string) {
        this.secretKey = secretKey;
    }

    createToken(data: TokenData): FormatRestApi {
        let token=  jwt.sign(data, this.secretKey);
        if (!token) {
            return FormatRestApiModels.createFormatRestApi(500, this.failledTokenError, null, this.failledTokenError);
        }
        return FormatRestApiModels.createFormatRestApi(200, this.successTokenCreated, token,'');
    }

    verifyToken(token: string): FormatRestApi {
        try {
            let verifie:TokenData =  jwt.verify(token, this.secretKey) as TokenData;
            return FormatRestApiModels.createFormatRestApi(200, this.successTokenCreated, verifie,'');
        } catch (error) {
            return FormatRestApiModels.createFormatRestApi(401, this.failledTokenInvalid, null, error);
        }
    }
}
