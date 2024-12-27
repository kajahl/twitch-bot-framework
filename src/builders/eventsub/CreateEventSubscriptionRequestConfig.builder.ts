import { AxiosRequestConfig } from "axios";
import TwitchEventId from "../../enums/TwitchEventId.enum";
import { MappedTwitchEventId, TwitchEventData } from "../../types/EventSub.types";

/* 
Related docs:
https://dev.twitch.tv/docs/eventsub/manage-subscriptions/#subscribing-to-events
*/

export default class CreateEventSubscriptionRequestConfigBuilder<T extends MappedTwitchEventId> {
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

    constructor(type: T) {}

    public setAccessToken(accessToken: string): this {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
    }

    public setClientId(clientId: string): this {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers["Client-Id"] = clientId;
        return this;
    }

    public setType(type: TwitchEventId): this {
        this.config.data.type = type;
        return this;
    }

    public setVersion(version: TwitchEventData<T>['version']): this {
        this.config.data.version = version;
        return this;
    }

    public setCondition(condition: TwitchEventData<T>['condition']): this {
        this.config.data.condition = condition;
        return this;
    }

    public setSessionId(sessionId: string): this {
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