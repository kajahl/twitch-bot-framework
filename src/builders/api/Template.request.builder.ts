// ###

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type XXXResponse = {
    data: {
        
    }[]
}

// Builder

export default class XXXRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 1, 2, 3];

    constructor() {
        super('POST', 'XXX', {}, {}, null, null);
    }

    public setBroadcasterId(broadcasterId: string): this {
        this.config.data.broadcaster_id = broadcasterId;
        return this;
    }

    public checkTypes(): boolean {
        // TODO
        return true;
    }
}