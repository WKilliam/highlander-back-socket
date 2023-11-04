import fse from 'fs-extra';
import {Utils} from "../../utils/utils";
import {FormatModel} from "../../models/format.model";
import {PlayersLittleModels, PlayersLobbyModels} from "../../models/players.models";
import {SocketJoinSession, SocketJoinTeamCard} from "../../models/sockets.models";
import {TeamBodyModels} from "../../models/teams.models";
import * as fs from "fs";
import {GameModels, PartiesFullBodyModels} from "../../models/parties.models";
import {InfoGame} from "../../models/infoGame";
import {MapModels} from "../../models/map.models";

export class JsonconceptorService {

    static createDirectoryAndJsonFile(path: string, data: any): FormatModel {
        try {
            // Crée le répertoire
            fse.ensureDirSync(`parties/${path}`);

            // Crée le fichier JSON dans le répertoire
            const json = JSON.stringify(data);
            fse.writeFileSync(`parties/${path}/parties.json`, json);

            return Utils.formatResponse(200, 'Répertoire et fichier JSON créés avec succès', null);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Erreur interne du serveur', error);
        }
    }

    static getAllDirectoriesAndFiles() {
        try {
            const baseDirectory = 'parties'; // Dossier racine contenant les répertoires

            if (fs.existsSync(baseDirectory) && fs.lstatSync(baseDirectory).isDirectory()) {
                const directories = fs.readdirSync(baseDirectory);

                const result: { session: string; parties: any; }[] = []; // Ajouter un type explicite ici

                for (const directory of directories) {
                    const dirPath = `${baseDirectory}/${directory}`;

                    if (fs.lstatSync(dirPath).isDirectory()) {
                        const jsonFilePath = `${dirPath}/parties.json`;

                        if (fs.existsSync(jsonFilePath)) {
                            const jsonData = fse.readJsonSync(jsonFilePath);
                            result.push({ session: directory, parties: jsonData });
                        }
                    }
                }
                return Utils.formatResponse(200, 'Liste des répertoires et fichiers', result);
            } else {
                return Utils.formatResponse(404, 'Directory not found', null);
            }
        } catch (error) {
            return Utils.formatResponse(500, 'Erreur interne du serveur', error);
        }
    }


    static readJsonFile(path: string): FormatModel {
        try {
            const filePath = `parties/${path}`;
            console.log('Reading file:', filePath); // Ajoutez cette ligne pour le débogage

            if (fs.existsSync(filePath)) {
                console.log('File found');
                const json = fse.readFileSync(filePath, 'utf8');
                return Utils.formatResponse(200, `File found parties/${path}`, json);
            } else {
                return Utils.formatResponse(404, `File not found parties/${path}`, null);
            }
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal Server Error', error);
        }
    }

    static getJsonFile(pathKeySession: string, keyJson: string): FormatModel {
        try {
            // Vérifiez si le répertoire existe
            if (fse.existsSync(`parties/${pathKeySession}`)) {
                // Le répertoire existe, vous pouvez maintenant essayer de lire le fichier JSON
                const json = fse.readJsonSync(`parties/${pathKeySession}`);
                const data = keyJson.split('.').reduce((obj, key) => obj[key], json);
                return Utils.formatResponse(200, 'Directory created', data);
            } else {
                // Le répertoire n'existe pas, retournez une réponse d'erreur
                return Utils.formatResponse(404, 'Directory not found', null);
            }
        } catch (error) {
            return Utils.formatResponse(500, `Internal Server Error`, error);
        }
    }

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
            const json = fse.readFileSync(`parties/${path}`, 'utf8');
            const data = JSON.parse(json);

            // Obtenez la partie des données que vous souhaitez mettre à jour en utilisant la clé keyPath
            const targetData = keyPath.split('.').reduce((obj, key) => obj[key], data);

            // Fusionnez les nouvelles données dans la partie ciblée de vos données
            this.mergeJsonData(targetData, value);

            const updatedJson = JSON.stringify(data);
            fse.writeFileSync(`parties/${path}`, updatedJson);
            return Utils.formatResponse(200, `File Update parties/${path}`, JSON.parse(updatedJson));
        } catch (error) {
            return Utils.formatResponse(500, 'Internal Server Error', error);
        }
    }
}
