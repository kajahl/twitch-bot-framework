import { AxiosRequestConfig } from "axios";

export default class RevokeTokenRequestConfigBuilder {
    private config: AxiosRequestConfig = {
        url: 'https://id.twitch.tv/oauth2/revoke',
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
            client_id: null,
            token: null
        }
    }

    constructor() {}

    public setClientId(clientId: string): RevokeTokenRequestConfigBuilder {
        this.config.data.client_id = clientId;
        return this;
    }

    public setToken(token: string): RevokeTokenRequestConfigBuilder {
        this.config.data.token = token;
        return this;
    }

    public build(): any {
        if (this.config.data.client_id === null) throw new Error('Client ID is required');
        if (this.config.data.token === null) throw new Error('Token is required');
        return this.config;
    }
}