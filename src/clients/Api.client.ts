import axios from "axios";
import GetUsersRequestConfigBuilder from "../builders/api/GetUsersRequestConfig.builder";
import DataStorage from "../storage/runtime/Data.storage";
import TwitchEventId from "../enums/TwitchEventId.enum";
import DeleteEventSubscriptionRequestConfigBuilder from "../builders/eventsub/DeleteEventSubscriptionRequestConfig.builder";
import SubscribedEventListRequestConfigBuilder from "../builders/eventsub/SubscribedEventListRequestConfig.builder";
import { CreateSubscriptionResponse, DeleteSubscriptionResponse, GetSubscriptionsResponse } from "../types/APIClient.types";
import CreateEventSubscriptionRequestConfigBuilder from "../builders/eventsub/CreateEventSubscriptionRequestConfig.builder";

export default class APIClient {
    private data: DataStorage;
    constructor(
        private token: string
    ) {
        this.data = DataStorage.getInstance();
    }

    get events() {
        return {
            subscribe: async (type: TwitchEventId, version: 1 | 2, condition: any) : Promise<CreateSubscriptionResponse> => {
                const requestConfig = new CreateEventSubscriptionRequestConfigBuilder()
                    .setAccessToken(this.token)
                    .setClientId(this.data.clientId.get() as string)
                    .setSessionId(DataStorage.getInstance().websocketId.get() as string)
                    .setType(type)
                    .setVersion(version)
                    .setCondition(condition)
                    .build();
                const response = await axios.request<CreateSubscriptionResponse>(requestConfig);
                if(response.status !== 202) throw new Error(`Failed to subscribe to event type=${type}`);
                return response.data;
            },
            unsubscribe: async (id: string) : Promise<DeleteSubscriptionResponse> => {
                const requestConfig = new DeleteEventSubscriptionRequestConfigBuilder()
                    .setAccessToken(this.token)
                    .setClientId(this.data.clientId.get() as string)
                    .setSubscriptionId(id)
                    .build();
                const response = await axios.request<DeleteSubscriptionResponse>(requestConfig);
                if(response.status !== 204) throw new Error(`Failed to unsubscribe from event id=${id}`);
                return response.data;
            },
            list: async (showUnactive: boolean = false) : Promise<GetSubscriptionsResponse> => {
                const requestConfig = new SubscribedEventListRequestConfigBuilder()
                    .setAccessToken(this.token)
                    .setClientId(this.data.clientId.get() as string)
                    .build();
                const response = await axios.request<GetSubscriptionsResponse>(requestConfig);
                if(response.status !== 200) throw new Error(`Failed to get event subscriptions`);
                return {
                    ...response.data,
                    data: showUnactive ? response.data.data : response.data.data.filter(sub => sub.status === 'enabled')
                };
            }
        }
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