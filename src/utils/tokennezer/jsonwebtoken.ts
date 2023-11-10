import jwt from 'jsonwebtoken';
import {Utils} from "../utils";
import {FormatRestApiModels} from "../../models/formatRestApi.models";

interface TokenData {
    userId: number;
    email: string;
    password: string;
    roles: string[];
}

export class TokenManager {
    private readonly secretKey: string;

    constructor(secretKey: string) {
        this.secretKey = secretKey;
    }

    createToken(data: TokenData): FormatRestApiModels {
        let token=  jwt.sign(data, this.secretKey);
        if (!token) {
            return Utils.formatResponse(500, 'Token error', null, 'Token error');
        }
        return Utils.formatResponse(200, 'Token success', token);
    }

    verifyToken(token: string): FormatRestApiModels {
        try {
            let verifie:TokenData =  jwt.verify(token, this.secretKey) as TokenData;
            return Utils.formatResponse(200, 'Token success', verifie);
        } catch (error) {
            return Utils.formatResponse(401, 'Token invalid', null, error);
        }
    }
}
