import {DataSource, In, Repository} from "typeorm";

import {ClientDto} from "../../dto/clients.dto";
import {Utils} from "../../utils/utils";
import {CardsDto} from "../../dto/cards.dto";
import {TokenData, UserFrontData, UsersLogin, UserSubscription} from "../../models/users.models";
import {DecksDto} from "../../dto/decks.dto";
import {Encryptor} from "../../utils/crypto/encryptor";
import {CardsRestApi} from "../../models/cards.models";
import {DecksRestApi, DecksRestApiUser} from "../../models/decks.models";

export class UsersServices {

    dataSourceConfig: Promise<DataSource>;
    encryptor: Encryptor;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
        this.encryptor = new Encryptor('test');
    }

    async create(user: UserSubscription) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const usersDtoRepository: Repository<ClientDto> = dataSource.getRepository(ClientDto);
            const decksDtoRepository: Repository<DecksDto> = dataSource.getRepository(DecksDto);
            const cardsDtoRepository: Repository<CardsDto> = dataSource.getRepository(CardsDto);

            // Vérifier si l'email existe déjà dans la base de données
            const existingUserWithEmail = await usersDtoRepository.findOne({where: {email: user.email}});
            if (existingUserWithEmail) {
                return Utils.formatResponse(400, 'Email already exists', null, null);
            }

            // Vérifier si l'avatar existe déjà dans la base de données
            const existingUserWithAvatar = await usersDtoRepository.findOne({where: {avatar: user.avatar}});
            if (existingUserWithAvatar) {
                return Utils.formatResponse(400, 'Avatar already exists', null, null);
            }

            // Obtenez les decks associés à l'utilisateur
            const decks = await decksDtoRepository.find({
                where: {id: In(user.deckIds)},
                relations: ['cards']
            });
            // Utilisez flatMap pour extraire les IDs de toutes les cartes associées à tous les decks
            let cardIds: Array<number> = []
            for (let i = 0; i < decks[0].cards.length; i++) {
                cardIds.push(decks[0].cards[i].id)
            }

            // Concaténez les IDs des cartes des decks avec user.cardsIds et éliminez les doublons
            const allCardIds = Array.from(new Set([...user.cardsIds, ...cardIds]));


            const cards = await cardsDtoRepository.find({
                where: {id: In(allCardIds)},
                relations: ['effects', 'capacities']
            });
            console.log(cards)

            const createUser = usersDtoRepository.create({
                pseudo: user.pseudo,
                password: user.password,
                email: user.email,
                avatar: user.avatar,
                userCards: cards,
                createdAt: new Date().toISOString(),
                role: 'user',
                bearcoin: 0,
            })
            const createdUser = await usersDtoRepository.save(createUser);
            return Utils.formatResponse(201, 'User created successfully', createUser, null);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal server error', null, error.message);
        }
    }

    async login(user: UsersLogin) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const usersDtoRepository: Repository<ClientDto> = dataSource.getRepository(ClientDto);
            const existingUser = await usersDtoRepository.findOne({
                select: ['id', 'pseudo', 'email', 'avatar', 'bearcoin'],
                where: {email: user.email, password: user.password},
                relations: [
                    'userCards',
                    'userCards.effects',
                    'userCards.capacities'
                ]
            });
            if (!existingUser) {
                return Utils.formatResponse(400, 'Email or password incorrect', null, null);
            }
            return Utils.formatResponse(200, 'User logged in successfully', existingUser, null);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal server error', null, error.message);
        }
    }
}
