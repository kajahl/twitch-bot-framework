// https://dev.twitch.tv/docs/api/reference/#get-cheermotes

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type GetCheermotesResponse = {
    data: {
        prefix: string;
        tiers: {
            min_bits: number;
            id: string;
            color: string;
            images: Record<any, any>;
            can_cheer: boolean;
            show_in_bits_card: boolean;
        }[];
    }[],
    type: string;
    order: number;
    last_updated: string;
    is_charitable: boolean;
}

// Builder

export default class GetCheermotesRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 1, 2, 3];

    constructor() {
        super('GET', 'https://api.twitch.tv/helix/bits/cheermotes', {
            broadcaster_id: null
        }, {}, 'broadcaster_id');
    }

    public setBroadcasterId(broadcasterId: string): this {
        this.config.data.broadcaster_id = broadcasterId;
        return this;
    }

    public checkTypes(): boolean {
        return true;
    }
}