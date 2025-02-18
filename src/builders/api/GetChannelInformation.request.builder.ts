// https://dev.twitch.tv/docs/api/reference/#get-channel-information

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type GetChannelInformationResponse = {
    data: {
        broadcaster_id: string;
        broadcaster_name: string;
        broadcaster_login: string;
        broadcaster_language: string;
        game_id: string;
        game_name: string;
        title: string;
        delay: number;
        tags: string[];
        content_classification_labels: string[];
        is_branded_content: boolean;
    }[]
}

// Builder

export default class GetChannelInformationRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401, 429, 500];

    constructor() {
        super('GET', 'channels', {
            broadcaster_id: null
        }, {}, 'broadcaster_id');
    }

    public setBroadcasterId(broadcasterId: string | string[]): this {
        this.config.data.broadcaster_id = broadcasterId;
        return this;
    }

    public checkTypes(): boolean {
        if(this.config.data.broadcaster_id == null) throw new Error('Broadcaster ID is required');
        return true;
    }
}