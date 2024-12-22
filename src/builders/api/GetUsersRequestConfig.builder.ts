import { AxiosRequestConfig } from "axios";

export default class GetUsersRequestConfigBuilder {
    private config: AxiosRequestConfig = {
        url: 'https://api.twitch.tv/helix/users',
        method: 'GET',
        headers: {
            Authorization: null,
            "Client-Id": null,
            "Content-Type": "application/json"
        }
    }

    constructor() {}
    private logins: string[] = [];
    private userIds: string[] = [];

    private maxLoginsAndIds = 100;
    private getLoginsAndIdsSum(): number {
        return this.logins.length + this.userIds.length;
    }
    private canAddLoginOrId(): boolean {
        return this.getLoginsAndIdsSum() <= this.maxLoginsAndIds;
    }

    public setAccessToken(accessToken: string): GetUsersRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
    }

    public setClientId(clientId: string): GetUsersRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers["Client-Id"] = clientId;
        return this;
    }

    public addUserId(userId: string): GetUsersRequestConfigBuilder {
        if(!this.canAddLoginOrId()) throw new Error('Max logins and ids reached');
        this.userIds.push(userId);
        return this;
    }

    public addLogin(login: string): GetUsersRequestConfigBuilder {
        if(!this.canAddLoginOrId()) throw new Error('Max logins and ids reached');
        this.logins.push(login);
        return this;
    }

    public addUserIds(userIds: string[]): GetUsersRequestConfigBuilder {
        for(const userId of userIds) {
            this.addUserId(userId);
        }
        return this;
    }

    public addLogins(logins: string[]): GetUsersRequestConfigBuilder {
        for(const login of logins) {
            this.addLogin(login);
        }
        return this;
    }

    public build(): AxiosRequestConfig {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        if(this.config.headers.Authorization === null) throw new Error('Access Token is required');
        if(this.config.headers["Client-Id"] === null) throw new Error('Client ID is required');
        if(this.getLoginsAndIdsSum() === 0) throw new Error('At least one login or id is required');
        // Logins and ids should be added to the query string id=123&id=456&login=login1&login=login2
        const queryParams = [
            ...this.userIds.map(id => `id=${id}`),
            ...this.logins.map(login => `login=${login}`)
        ];
        this.config.url += `?${queryParams.join('&')}`;
        return this.config;
    }
}