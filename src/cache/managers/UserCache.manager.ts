import { Inject, Service } from "typedi";
import APIClient from "../../clients/Api.client";
import { TokenService } from "../../services/Token.service";
import { Logger, LoggerFactory } from "../../utils/Logger";
import { LRUCache } from "../models/LRUCache.storage";
import DINames from "../../utils/DI.names";
import ConfigService from "../../services/Config.service";

type T = TwitchUser;

@Service(DINames.UserCacheManager)
export default class UserCacheManager extends LRUCache<T> {
    private readonly logger: Logger;

    private constructor(
        @Inject(DINames.ConfigService) readonly config: ConfigService,
        @Inject(DINames.TokenService) readonly tokenService: TokenService,
        @Inject(DINames.APIClient) private readonly apiClient: APIClient,
        @Inject(DINames.LoggerFactory) readonly loggerFactory: LoggerFactory
    ) {
        super({ ttl: 300 });
        this.logger = loggerFactory.createLogger('UserCacheManager');
    }

    async findIdByUsername(username: string): Promise<string | null> {
        const user = await this.getByName(username);
        if(user === null) return null;
        return user.id;
    }

    async getByName(username: string): Promise<T | null> {
        const userFromCache = this.values().find(user => user.login === username);
        if(userFromCache !== undefined) {
            this.logger.log(`Found data for user nickname=${username} in cache`);
            return userFromCache;
        }
        // API Request
        const user = await this.apiClient.user.getByLogin(username);
        if(user === null) return null;
        this.logger.log(`Retrieved data for user nickname=${username}`);
        this.set(user.id, user);
        return user;
    }

    async getById(id: string): Promise<TwitchUser | null> {
        const userFromCache = this.get(id);
        if(userFromCache !== null) {
            this.logger.log(`Found data for user id=${id} in cache`);
            return userFromCache;
        }
        // API Request
        const user = await this.apiClient.user.getById(id);
        if(user === null) return null;
        this.logger.log(`Retrieved data for user nickname=${id}`);
        this.set(id, user);
        return user;
    }
}

export type TwitchUser = {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email: string;
    created_at: string;
    updated_at: string;
}