import GetUsersRequestConfigBuilder from '../builders/api/GetUsersRequestConfig.builder';
import DataStorage from '../storage/runtime/Data.storage';
import { TokenService } from '../services/Token.service';
import GetModeratorsRequestConfigBuilder from '../builders/api/GetModeratorsRequestConfig.builder';
import RateLimiterService from '../services/RateLimiter.service';
import { TwitchUser } from '../cache/managers/UserCache.manager';

export default class APIClient {
    static async asUserId(userId: string) {
        const tokenService = TokenService.getInstance();
        const userToken = await tokenService.getUserTokenById(userId);
        if (!userToken) throw new Error(`User token not found by userId=${userId}`);
        return new APIClient(userToken, true, userId);
    }

    static async asApp() {
        const tokenService = TokenService.getInstance();
        const appToken = await tokenService.getAppToken();
        return new APIClient(appToken, false);
    }

    private data: DataStorage;
    private constructor(
        private token: string,
        private isUserToken: boolean = false,
        private userId: string = '',
    ) {
        this.data = DataStorage.getInstance();
    }

    private getRateLimiter() {
        return this.isUserToken ? RateLimiterService.forUser(this.userId) : RateLimiterService.forApp();
    }

    get user() {
        return {
            get: async (params: { ids?: string[]; logins?: string[] }): Promise<TwitchUser[]> => {
                const data = await new GetUsersRequestConfigBuilder()
                    .setClientId(this.data.clientId.get() as string)
                    .setAccessToken(this.token)
                    .addLogins(params.logins || [])
                    .addUserIds(params.ids || [])
                    .make();
                return data.data;
            },
            getById: async (id: string): Promise<TwitchUser> => {
                const data = await this.user.get({ ids: [id] });
                if (data.length === 0) throw new Error(`User not found by id=${id}`);
                if (data.length > 1) throw new Error(`Multiple users found by id=${id}`);
                return data[0];
            },
            getByLogin: async (login: string): Promise<TwitchUser> => {
                const data = await this.user.get({ logins: [login] });
                if (data.length === 0) throw new Error(`User not found by id=${login}`);
                if (data.length > 1) throw new Error(`Multiple users found by id=${login}`);
                return data[0];
            },
        };
    }

    async getModerators(channelId: string) {
        if(!this.isUserToken) throw new Error('User token is required');
        // TODO: Pagination
        const data = await new GetModeratorsRequestConfigBuilder()
            .setAccessToken(this.token)
            .setClientId(this.data.clientId.get() as string)
            .setBroadcasterId(channelId)
            .setUserId(this.userId)
            .make();
        return data;
    }
}

// Temp location
export type ResponseBody<T> = {
    data: T[];
};