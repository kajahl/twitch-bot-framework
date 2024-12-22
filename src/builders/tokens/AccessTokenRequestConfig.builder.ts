import axios, { AxiosRequestConfig } from "axios";

export default class AccessTokenRequestConfigBuilder {
    private config: AxiosRequestConfig = {
        url: 'https://id.twitch.tv/oauth2/token',
        method: 'POST',
        data: {
            client_id: null,
            client_secret: null,
            grant_type: null
        }
    };

    constructor() {}

    public setClientId(clientId: string): AccessTokenRequestConfigBuilder {
        this.config.data.client_id = clientId;
        return this;
    }

    public setClientSecret(clientSecret: string): AccessTokenRequestConfigBuilder {
        this.config.data.client_secret = clientSecret;
        return this;
    }

    public forClient(): AccessTokenRequestConfigBuilder {
        if(this.config.data.grant_type !== null) throw new Error('Grant type already set');
        this.config.data.grant_type = 'client_credentials';
        return this;
    }

    public forUser(refresh_token: string): AccessTokenRequestConfigBuilder {
        if(this.config.data.grant_type !== null) throw new Error('Grant type already set');
        this.config.data.grant_type = 'refresh_token';
        this.config.data.refresh_token = refresh_token;
        return this;
    }

    public build(): AxiosRequestConfig {
        if (this.config.data.client_id === null) throw new Error('Client ID is required');
        if (this.config.data.client_secret === null) throw new Error('Client Secret is required');
        if (this.config.data.grant_type === null) throw new Error('Grant type is required');
        return this.config;
    }
}