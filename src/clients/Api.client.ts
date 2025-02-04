import GetUsersRequestConfigBuilder from '../builders/api/GetUsersRequestConfig.builder';
import { TokenService } from '../services/Token.service';
import GetModeratorsRequestConfigBuilder from '../builders/api/GetModeratorsRequestConfig.builder';
import RateLimiterService from '../services/RateLimiter.service';
import { TwitchUser } from '../cache/managers/UserCache.manager';
import TwitchBotFramework from '../TwitchBotFramework';
import { getServiceInstance, InstanceService } from '../decorators/InstanceService.decorator';

/*

APIClient służy TYLKO do wywołań z tokenem userId (czyli użytkownika bota) lub tokenem aplikacji (czyli klienta).

*/

@InstanceService()
export default class APIClient {
    private clientId: string;
    private userId: string;
    private tokenService: TokenService;

    private constructor(
        private readonly botInstance: TwitchBotFramework
    ) {
        const options = Reflect.getMetadata('config', botInstance);
        this.clientId = options.clientId;
        this.userId = options.userId;
        this.tokenService = getServiceInstance(TokenService, this.userId)
    }

    private async getAppAccessToken() : Promise<string> {
        return this.tokenService.getAppToken();
    }

    private async getUserAccessToken() : Promise<string | null> {
        return this.tokenService.getUserTokenById(this.userId);
    }

    get user() {
        return {
            get: async (params: { ids?: string[]; logins?: string[] }): Promise<TwitchUser[]> => {
                const token = await this.getAppAccessToken();
                const data = await new GetUsersRequestConfigBuilder()
                    .setClientId(this.clientId)
                    .setAccessToken(token)
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

    // async getModerators(channelId: string) {
    //     if(!this.isUserToken) throw new Error('User token is required');
    //     // TODO: Pagination
    //     const data = await new GetModeratorsRequestConfigBuilder()
    //         .setAccessToken(this.token)
    //         .setClientId(this.data.clientId.get() as string)
    //         .setBroadcasterId(channelId)
    //         .setUserId(this.userId)
    //         .make();
    //     return data;
    // }
}

// Temp location
export type ResponseBody<T> = {
    data: T[];
};