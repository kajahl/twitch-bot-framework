// ###

import TwitchEventId from "../../enums/TwitchEventId.enum";
import { MappedTwitchEventId, TwitchEventData } from "../../types/EventSub.types";
import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type CreateEventSubSubscriptionResponse = {
    data: {
        id: string;
        status: string;
        type: string;
        version: string;
        condition: Record<string, any>;
        created_at: string;
        transport: {
            method: string;
            session_id: string;
        },
        connected_at: string;
        cost: number;
    }[],
    total: number,
    total_cost: number,
    max_total_cost: number
}

// Builder

export default class CreateEventSubSubscriptionRequestConfigBuilder<T extends MappedTwitchEventId> extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401, 403, 409, 429];

    constructor() {
        super('POST', 'https://api.twitch.tv/helix/eventsub/subscriptions', {}, {
            type: null,
            version: null,
            condition: {},
            transport: {
                method: 'websocket',
                session_id: null
            }
        });
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

    public checkTypes(): boolean {
        if(this.config.data.type == null) throw new Error('Type is required');
        if(this.config.data.version == null) throw new Error('Version is required');
        if(this.config.data.transport.session_id == null) throw new Error('Session ID is required');
        if(Object.keys(this.config.data.condition).length == 0) throw new Error('Condition is required');
        return true;
    }
}