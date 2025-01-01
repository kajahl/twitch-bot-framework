import { AxiosRequestConfig } from "axios";
import { Pagination } from "../../types/APIClient.types";
import TemplateBuilder from "../Template.builder";

export default class GetModeratorsRequestConfigBuilder extends TemplateBuilder<GetModeratorsResponse> {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401];

    constructor() {
        super('GET', 'https://api.twitch.tv/helix/moderation/moderators', {
            broadcaster_id: null,
            user_id: null,
            after: null,
            first: null
        }, () => this.config.data.user_id);
    }

    public setBroadcasterId(broadcasterId: string): GetModeratorsRequestConfigBuilder {
        this.config.data.broadcaster_id = broadcasterId;
        return this;
    }

    public setUserId(userId: string): GetModeratorsRequestConfigBuilder {
        this.config.data.user_id = userId;
        return this;
    }

    public setAfter(after: string): GetModeratorsRequestConfigBuilder {
        this.config.data.after = after;
        return this;
    }

    public setFirst(first: number): GetModeratorsRequestConfigBuilder {
        this.config.data.first = first;
        return this;
    }

    public build(): AxiosRequestConfig {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        if(this.config.headers.Authorization == null) throw new Error('Access token is required');
        if(this.config.headers["Client-Id"] == null) throw new Error('Client ID is required');
        if(this.config.data.broadcaster_id == null) throw new Error('Broadcaster ID is required');
        if(this.config.data.user_id == null) throw new Error('User ID is required');
        return this.config;
    }

}

export type GetModeratorsResponse = {
    data: {
        user_id: string;
        user_login: string;
        user_name: string;
    }[]
} & Pagination;