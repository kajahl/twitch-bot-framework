import { AxiosRequestConfig } from "axios";

/* 
Related docs:
https://dev.twitch.tv/docs/eventsub/manage-subscriptions/#getting-the-list-of-events-you-subscribe-to
*/

export default class SubscribedEventListRequestConfigBuilder {
    private config: AxiosRequestConfig = {
        url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
        method: 'GET',
        headers: {
            Authorization: null,
            "Client-Id": null
        }
    }

    constructor() {}

    public setAccessToken(accessToken: string): SubscribedEventListRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
    }

    public setClientId(clientId: string): SubscribedEventListRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers["Client-Id"] = clientId;
        return this;
    }

    public build(): AxiosRequestConfig {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        if(this.config.headers.Authorization == null) throw new Error('Access token is required');
        if(this.config.headers["Client-Id"] == null) throw new Error('Client ID is required');
        return this.config;
    }
}