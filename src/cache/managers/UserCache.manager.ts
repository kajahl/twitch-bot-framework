import APIClient from "../../clients/Api.client";
import { TokenService } from "../../services/Token.service";
import Logger from "../../utils/Logger";
import { LRUCache } from "../models/LRUCache.storage";

const logger = new Logger('UserCacheManager')

type T = TwitchUser;
export default class UserCacheManager extends LRUCache<T> {
    private static instance: UserCacheManager;
    public static getInstance(): UserCacheManager {
        return UserCacheManager.instance;
    }
    public static init(tokenService: TokenService): UserCacheManager {
        UserCacheManager.instance = new UserCacheManager(tokenService);
        return UserCacheManager.instance;
    }
    private constructor(
        private tokenService: TokenService
    ) {
        super({ ttl: 300 });
    }

    async findIdByUsername(username: string): Promise<string | null> {
        const user = await this.getByName(username);
        if(user === null) return null;
        return user.id;
    }

    async getByName(username: string): Promise<T | null> {
        const userFromCache = this.values().find(user => user.login === username);
        if(userFromCache !== undefined) {
            logger.log(`Found data for user nickname=${username} in cache`);
            return userFromCache;
        }
        // API Request
        const appApi = await APIClient.asApp();
        const user = await appApi.user.getByLogin(username);
        if(user === null) return null;
        logger.log(`Retrieved data for user nickname=${username}`);
        this.set(user.id, user);
        return user;
    }

    async getById(id: string): Promise<TwitchUser | null> {
        const userFromCache = this.get(id);
        if(userFromCache !== null) {
            logger.log(`Found data for user id=${id} in cache`);
            return userFromCache;
        }
        // API Request
        const appApi = await APIClient.asApp();
        const user = await appApi.user.getById(id);
        if(user === null) return null;
        logger.log(`Retrieved data for user nickname=${id}`);
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