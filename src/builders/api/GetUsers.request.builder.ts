// ###

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type GetUsersResponse = {
    data: {
        id: string;
        login: string;
        display_name: string;
        type: 'admin' | 'global_mod' | 'staff' | '';
        broadcaster_type: 'partner' | 'affiliate' | '';
        description: string;
        profile_image_url: string;
        offline_image_url: string;
        email?: string;
        created_at: string;
    }[]
}

// Builder

export default class GetUsersRequestBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401];

    constructor() {
        super('GET', 'https://api.twitch.tv/helix/users', {
            login: [],
            id: []
        });
    }

    public addUserId(userId: string): this {
        this.config.params.id.push(userId);
        return this;
    }

    public addLogin(login: string): this {
        this.config.params.login.push(login);
        return this;
    }

    public addUserIds(userIds: string[]): this {
        for(const userId of userIds) {
            this.addUserId(userId);
        }
        return this;
    }

    public addLogins(logins: string[]): this {
        for(const login of logins) {
            this.addLogin(login);
        }
        return this;
    }

    private readonly maxLoginsAndIds = 100;
    public checkTypes(): boolean {
        const loginLength = this.config.params.login ? this.config.params.login.length : 0;
        const idLength = this.config.params.id ? this.config.params.id.length : 0;
        if(loginLength === 0 && idLength === 0) throw new Error('At least one login or id is required');
        if(loginLength + idLength > this.maxLoginsAndIds) throw new Error(`Maximum of ${this.maxLoginsAndIds} logins and ids combined. ${loginLength} logins and ${idLength} ids provided`);
        return true;
    }
}