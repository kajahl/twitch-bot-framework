import { AxiosRequestConfig } from "axios";

export default class DeleteEventSubscriptionRequestConfigBuilder {
    private config: AxiosRequestConfig = {
        url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
        method: 'DELETE',
        headers: {
            Authorization: null,
            "Client-Id": null,
            "Content-Type": "application/json"
        }
    }

    constructor() {}
    private subscriptionId: string | null = null;

    public setAccessToken(accessToken: string): DeleteEventSubscriptionRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
    }

    public setClientId(clientId: string): DeleteEventSubscriptionRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers["Client-Id"] = clientId;
        return this;
    }

    public setSubscriptionId(id: string): DeleteEventSubscriptionRequestConfigBuilder {
        if(this.subscriptionId != null) throw new Error('Subscription ID has already been set');
        this.subscriptionId = id;
        return this;
    }

    public build(): AxiosRequestConfig {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        if(this.config.headers.Authorization == null) throw new Error('Access token is required');
        if(this.config.headers["Client-Id"] == null) throw new Error('Client ID is required');
        if(this.subscriptionId == null) throw new Error('Subscription ID is required');
        this.config.url += `?id=${this.subscriptionId}`;
        return this.config;
    }
}