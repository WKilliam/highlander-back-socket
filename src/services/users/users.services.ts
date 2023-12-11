import {DataSource, In, Repository} from "typeorm";

import {ClientDto} from "../../dto/clients.dto";
import {Utils} from "../../utils/utils";
import {CardsDto} from "../../dto/cards.dto";
import {TokenData, UserFrontData, UsersLogin, UserSubscription} from "../../models/users.models";
import {DecksDto} from "../../dto/decks.dto";
import { TokenManager} from "../../utils/tokennezer/jsonwebtoken";
import {CardEntitySimplify, CardsRestApi} from "../../models/cards.models";
import {DecksRestApi, DecksRestApiUser} from "../../models/decks.models";

export class UsersServices {

    dataSourceConfig: Promise<DataSource>;

    constructor(dataSourceConfig: Promise<DataSource>) {
        this.dataSourceConfig = dataSourceConfig;
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
                select: ["id",'pseudo', 'email', 'password', 'avatar', 'bearcoin'],
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
            const tokenManager = new TokenManager('votre_clé_secrète');
            const token = tokenManager.createToken({
                userId: existingUser.id,
                email: existingUser.email,
                password: existingUser.password,
                roles: ['user']
            });
            if (token.code < 200 || token.code > 299) {
                return Utils.formatResponse(token.code, `${token.message}`, token.data, token.error);
            }
            const decks: Array<DecksRestApiUser> = [];
            const cards: Array<CardEntitySimplify> = [];

            for (let i = 0; i < existingUser.userCards.length; i++) {
                cards.push({
                    id: existingUser.userCards[i].id,
                    name: existingUser.userCards[i].name,
                    description: existingUser.userCards[i].description,
                    image: existingUser.userCards[i].image,
                    rarity: existingUser.userCards[i].rarity,
                    atk: existingUser.userCards[i].atk,
                    def: existingUser.userCards[i].def,
                    spd: existingUser.userCards[i].spd,
                    luk: existingUser.userCards[i].luk,
                    effects: existingUser.userCards[i].effects,
                    capacities: existingUser.userCards[i].capacities
                })
                decks.push({
                    name: existingUser.userCards[i].deck.name,
                    description: existingUser.userCards[i].deck.description,
                    image: existingUser.userCards[i].deck.image,
                    type: existingUser.userCards[i].deck.type,
                    rarity: existingUser.userCards[i].deck.rarity,
                })
            }
            const tokenData: UserFrontData = {
                token: token.data,
                pseudo: existingUser.pseudo,
                avatar: existingUser.avatar,
                bearcoins: existingUser.bearcoin,
                decks: decks.filter(
                    (deck, index, self) =>
                        index ===
                        self.findIndex((d) =>
                            d.name === deck.name &&
                            d.description === deck.description &&
                            d.image === deck.image &&
                            d.type === deck.type &&
                            d.rarity === deck.rarity
                        )
                ),
                cards: cards.map(card=>{
                    return {
                        id: card.id,
                        name: card.name,
                        description: card.description,
                        image: card.image,
                        rarity: card.rarity,
                        atk: card.atk,
                        def: card.def,
                        spd: card.spd,
                        luk: card.luk,
                        effects: card.effects,
                        capacities: card.capacities
                    }
                })
            }
            return Utils.formatResponse(200, 'User logged in successfully', tokenData, null);
        } catch (error: any) {
            return Utils.formatResponse(500, 'Internal server error', null, error.message);
        }
    }

    async getUserSimplified(token: string) {
        try {
            const dataSource: DataSource = await this.dataSourceConfig;
            const tokenManager = new TokenManager('votre_clé_secrète');
            const tokenData = tokenManager.verifyToken(token);
            if (tokenData.code < 200 || tokenData.code > 299) {
                return Utils.formatResponse(tokenData.code, `${tokenData.message}`, tokenData.data, tokenData.error);
            }
            const login = await this.login({
                email: tokenData.data.email,
                password: tokenData.data.password
            });
            if (login.code < 200 || login.code > 299) {
                return Utils.formatResponse(login.code, `${login.message}`, login.data, login.error);
            }else{
                return Utils.formatResponse(200, 'User logged in successfully', login.data, null);
            }
        }catch (error: any) {
            return Utils.formatResponse(500, 'Internal server error', null, error.message);
        }
    }
}
