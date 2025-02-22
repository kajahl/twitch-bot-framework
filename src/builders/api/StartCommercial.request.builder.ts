// https://dev.twitch.tv/docs/api/reference/#start-commercial

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type StartCommercialResponse = {
    data: {
        length: number;
        message: string;
    }[],
    retry_after: number;
}

// Builder

export default class StartCommercialRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401, 404, 429];

    constructor() {
        super('POST', 'https://api.twitch.tv/helix/channels/commercial', {}, {
            broadcaster_id: null,
            length: null,
        }, null, 'broadcaster_id');
    }

    public setBroadcasterId(broadcasterId: string): this {
        this.config.data.broadcaster_id = broadcasterId;
        return this;
    }

    public setLength(length: number): this {
        this.config.data.length = length;
        return this;
    }

    public checkTypes(): boolean {
        if(this.config.data.broadcaster_id == null) throw new Error('Broadcaster ID is required');
        if(this.config.data.length == null) throw new Error('Length is required');
        return true;
    }
}