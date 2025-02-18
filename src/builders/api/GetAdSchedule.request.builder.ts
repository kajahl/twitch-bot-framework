// https://dev.twitch.tv/docs/api/reference/#get-ad-schedule

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type GetAdScheduleResponse = {
    data: {
        snooze_count: number;
        snooze_refresh_at: string;
        next_ad_at: string;
        duration: number;
        last_ad_at: string;
        preroll_free_time: number;
    }[]
}

// Builder

export default class GetAdScheduleRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 500];

    constructor() {
        super('GET', 'channels/ads', {
            broadcaster_id: null
        }, {}, 'broadcaster_id');
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