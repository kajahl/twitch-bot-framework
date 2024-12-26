import { AxiosRequestConfig } from "axios";
import TwitchEventId from "../../enums/TwitchEventId.enum";

/* 
Related docs:
https://dev.twitch.tv/docs/eventsub/manage-subscriptions/#subscribing-to-events
*/

export default class CreateEventSubscriptionRequestConfigBuilder {
    private config: AxiosRequestConfig = {
        url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
        method: 'POST',
        headers: {
            Authorization: null,
            "Client-Id": null,
            "Content-Type": "application/json"
        },
        data: {
            type: null,
            version: null,
            condition: {},
            transport: {
                method: 'websocket',
                session_id: null
            }
        }
    }

    constructor() {}

    public setAccessToken(accessToken: string): CreateEventSubscriptionRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
    }

    public setClientId(clientId: string): CreateEventSubscriptionRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers["Client-Id"] = clientId;
        return this;
    }

    public setType(type: TwitchEventId): CreateEventSubscriptionRequestConfigBuilder {
        this.config.data.type = type;
        return this;
    }

    public setVersion(version: 1 | 2 ): CreateEventSubscriptionRequestConfigBuilder {
        this.config.data.version = version;
        return this;
    }

    public setCondition(condition: any): CreateEventSubscriptionRequestConfigBuilder {
        this.config.data.condition = condition;
        return this;
    }

    public setSessionId(sessionId: string): CreateEventSubscriptionRequestConfigBuilder {
        this.config.data.transport.session_id = sessionId;
        return this;
    }

    public build(): AxiosRequestConfig {
        if(this.config.headers == null) throw new Error('Headers are required');
        if(this.config.headers.Authorization == null) throw new Error('Access token is required');
        if(this.config.headers["Client-Id"] == null) throw new Error('Client ID is required');
        if(this.config.data.type == null) throw new Error('Type is required');
        if(this.config.data.version == null) throw new Error('Version is required');
        if(this.config.data.transport.session_id == null) throw new Error('Session ID is required');
        return this.config;
    }
}