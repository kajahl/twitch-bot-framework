// https://dev.twitch.tv/docs/api/reference/#snooze-next-ad

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type SnoozeNextAdResponse = {
    data: {
        snooze_count: number;
        snooze_refresh_at: string;
        next_ad_at: string;
    }[]
}

// Builder

export default class SnoozeNextAdRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 429, 500];

    constructor() {
        super('POST', 'channels/ads/schedule/snooze', {
            broadcaster_id: null
        }, 'broadcaster_id');
    }

    public setBroadcasterId(broadcasterId: string): this {
        this.config.data.broadcaster_id = broadcasterId;
        return this;
    }

    public checkTypes(): boolean {
        if(this.config.data.broadcaster_id == null) throw new Error('Broadcaster ID is required');
        return true;
    }
}