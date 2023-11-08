import * as crypto from 'crypto';
export class Encryptor {

    private algorithm: string;
    private key: string;

    constructor(secretKey: string) {
        this.algorithm = 'aes-256-cbc'; // Algorithme de chiffrement
        this.key = secretKey; // Clé secrète
    }

    // Fonction pour chiffrer
    encrypt(text: string): { iv: string; encryptedData: string } {
        const iv = crypto.randomBytes(16); // Vecteur d'initialisation (IV)
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return { iv: iv.toString('hex'), encryptedData: encrypted };
    }

    // Fonction pour déchiffrer
    decrypt(data: { iv: string; encryptedData: string }): string {
        const iv = Buffer.from(data.iv, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key), iv);
        let decrypted = decipher.update(data.encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
