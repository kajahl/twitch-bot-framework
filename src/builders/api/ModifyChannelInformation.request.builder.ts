// https://dev.twitch.tv/docs/api/reference/#modify-channel-information

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type ModifyChannelInformationResponse = {
    data: {
        game_id: string;
        broadcaster_language: string;
        title: string;
        delay: number;
        content_classification_labels: {
            id: string;
            is_enabled: boolean;
        }[];
        is_branded_content: boolean;
    }[]
}

// Builder

export default class ModifyChannelInformationRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401, 403, 409, 500];

    constructor() {
        super('PATCH', 'channels', {
            broadcaster_id: null
        }, {
            game_id: null,
            broadcaster_language: null,
            title: null,
            delay: null,
            tags: null,
            content_classification_labels: null,
        }, 'broadcaster_id');
    }

    // TODO: Data

    public setBroadcasterId(broadcasterId: string): this {
        this.config.params.broadcaster_id = broadcasterId;
        return this;
    }

    public checkTypes(): boolean {
        if(this.config.params.broadcaster_id == null) throw new Error('Broadcaster ID is required');
        return true;
    }
}