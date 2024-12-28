import axios from "axios";
import GetUsersRequestConfigBuilder from "../builders/api/GetUsersRequestConfig.builder";
import DataStorage from "../storage/runtime/Data.storage";

export default class APIClient {
    private data: DataStorage;
    constructor(
        private token: string
    ) {
        this.data = DataStorage.getInstance();
    }

    get user() {
        return {
            get: async (params: { ids?: string[], logins?: string[] }) : Promise<any> => {
                const requestConfig = new GetUsersRequestConfigBuilder()
                    .setClientId(this.data.clientId.get() as string)
                    .setAccessToken(this.token)
                    .addLogins(params.logins || [])
                    .addUserIds(params.ids || [])
                    .build();
                const response = await axios.request<ResponseBody<User>>(requestConfig);
                if(response.status !== 200) throw new Error(`Failed to get users by params=${JSON.stringify(params)}`);
                const data = response.data.data;
                return data;
            },
            getById: async (id: string) : Promise<any> => {
                const requestConfig = new GetUsersRequestConfigBuilder()
                    .setClientId(this.data.clientId.get() as string)
                    .setAccessToken(this.token)
                    .addUserId(id)
                    .build();
                const response = await axios.request<ResponseBody<User>>(requestConfig);
                if(response.status !== 200) throw new Error(`Failed to get users id=${id}`);
                const data = response.data.data;
                if(data.length === 0) throw new Error(`User not found by id=${id}`);
                if(data.length > 1) throw new Error(`Multiple users found by id=${id}`);
                return data[0];
            },
            getByLogin: async (login: string) : Promise<any> => {
                const requestConfig = new GetUsersRequestConfigBuilder()
                    .setClientId(this.data.clientId.get() as string)
                    .setAccessToken(this.token)
                    .addLogin(login)
                    .build();
                const response = await axios.request<ResponseBody<User>>(requestConfig);
                if(response.status !== 200) throw new Error(`Failed to get user by login=${login}`);
                const data = response.data.data;
                if(data.length === 0) throw new Error(`User not found by login=${login}`);
                if(data.length > 1) throw new Error(`Multiple users found by login=${login}`);
                return data[0];
            },
        }
    }
}

// Temp location
export type ResponseBody<T> = {
    data: T[];
}

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
}