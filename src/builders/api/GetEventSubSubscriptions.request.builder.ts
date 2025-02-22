// ###

import { MappedTwitchEventId } from "../../types/EventSub.types";
import BaseRequestBuilder from "./Base.request.builder";
import { CreateEventSubSubscriptionResponse } from "./CreateEventSubSubscription.request.builder";

// Typy

export type GetEventSubSubscriptionsResponse = {
    data: CreateEventSubSubscriptionResponse['data'],
    total: number,
    total_cost: number,
    max_total_cost: number,
    pagination: {
        cursor: string
    }
}

// Builder

export default class GetEventSubSubscriptionsRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401];

    constructor() {
        super('GET', 'https://api.twitch.tv/helix/eventsub/subscriptions', {
            status: null,
            type: null,
            user_id: null,
            after: null
        }, {}, 'user_id');
    }

    public setStatus(status: string): this {
        this.config.params.status = status;
        return this;
    }

    public setType(type: MappedTwitchEventId): this {
        this.config.params.type = type;
        return this;
    }

    public setUserId(user_id: string): this {
        this.config.params.user_id = user_id;
        return this;
    }

    public setAfter(after: string): this {
        this.config.params.after = after;
        return this;
    }

    public checkTypes(): boolean {
        let optionsCounter = 0;
        if(!!this.config.params.status) optionsCounter++;
        if(!!this.config.params.type) optionsCounter++;
        if(!!this.config.params.user_id) optionsCounter++;
        if(optionsCounter > 1) throw new Error('Only one of the options can be set');
        return true;
    }
}