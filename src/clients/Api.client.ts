import axios from 'axios';
import GetUsersRequestConfigBuilder from '../builders/api/GetUsersRequestConfig.builder';
import DataStorage from '../storage/runtime/Data.storage';
import { TokenService } from '../services/Token.service';
import GetModeratorsRequestConfigBuilder from '../builders/api/GetModeratorsRequestConfig.builder';

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

    get user() {
        return {
            get: async (params: { ids?: string[]; logins?: string[] }): Promise<any> => {
                const requestConfig = new GetUsersRequestConfigBuilder()
                    .setClientId(this.data.clientId.get() as string)
                    .setAccessToken(this.token)
                    .addLogins(params.logins || [])
                    .addUserIds(params.ids || [])
                    .build();
                const response = await axios.request<ResponseBody<User>>(requestConfig);
                if (response.status !== 200) throw new Error(`Failed to get users by params=${JSON.stringify(params)}`);
                const data = response.data.data;
                return data;
            },
            getById: async (id: string): Promise<any> => {
                const requestConfig = new GetUsersRequestConfigBuilder()
                    .setClientId(this.data.clientId.get() as string)
                    .setAccessToken(this.token)
                    .addUserId(id)
                    .build();
                const response = await axios.request<ResponseBody<User>>(requestConfig);
                if (response.status !== 200) throw new Error(`Failed to get users id=${id}`);
                const data = response.data.data;
                if (data.length === 0) throw new Error(`User not found by id=${id}`);
                if (data.length > 1) throw new Error(`Multiple users found by id=${id}`);
                return data[0];
            },
            getByLogin: async (login: string): Promise<any> => {
                const requestConfig = new GetUsersRequestConfigBuilder()
                    .setClientId(this.data.clientId.get() as string)
                    .setAccessToken(this.token)
                    .addLogin(login)
                    .build();
                const response = await axios.request<ResponseBody<User>>(requestConfig);
                if (response.status !== 200) throw new Error(`Failed to get user by login=${login}`);
                const data = response.data.data;
                if (data.length === 0) throw new Error(`User not found by login=${login}`);
                if (data.length > 1) throw new Error(`Multiple users found by login=${login}`);
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

export type User = {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email?: string;
    created_at: string;
};
