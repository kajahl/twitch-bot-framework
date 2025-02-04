// https://dev.twitch.tv/docs/api/reference/#get-channel-editors

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type GetChannelEditorsResponse = {
    data: {
        user_id: string;
        user_name: string;
        created_at: string;
    }[]
}

// Builder

export default class GetChannelEditorsRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401];

    constructor() {
        super('POST', 'channels/editors', {
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