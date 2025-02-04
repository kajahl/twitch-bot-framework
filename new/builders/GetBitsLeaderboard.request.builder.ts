// https://dev.twitch.tv/docs/api/reference/#get-bits-leaderboard

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type GetBitsLeaderboardResponse = {
    data: {
        user_id: string;
        user_login: string;
        user_name: string;
        rank: number;
        score: number;
    }[],
    date_range: {
        started_at: string;
        ended_at: string;
    },
    total: number,
}

// Builder

export default class GetBitsLeaderboardRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401, 403];

    constructor() {
        super('GET', 'bits/leaderboard', {
            count: null,
            period: null,
            started_at: null,
            user_id: null,
        }, null);
    }

    public setCount(count: number): this {
        this.config.data.count = count;
        return this;
    }

    public setPeriod(period: string): this {
        this.config.data.period = period;
        return this;
    }

    public setStartedAt(started_at: string): this {
        this.config.data.started_at = started_at;
        return this;
    }

    public setUserId(user_id: string): this {
        this.config.data.user_id = user_id;
        return this;
    }

    public checkTypes(): boolean {
        if(this.config.data.broadcaster_id == null) throw new Error('Broadcaster ID is required');
        return true;
    }
}