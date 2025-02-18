import { AxiosRequestConfig } from "axios";

export default class ValidateTokenRequestBuilder {
    private config: AxiosRequestConfig = {
        url: 'https://id.twitch.tv/oauth2/validate',
        method: 'GET',
        headers: {
            Authorization: null
        }
    };

    constructor() {}

    setAccessToken(accessToken: string): this {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `OAuth ${accessToken}`;
        return this;
    }

    build(): AxiosRequestConfig {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        if (this.config.headers.Authorization === null) throw new Error('Access Token is required');
        return this.config;
    }
}