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
            logins: [],
            ids: []
        });
    }

    public addUserId(userId: string): this {
        this.config.data.ids.push(userId);
        return this;
    }

    public addLogin(login: string): this {
        this.config.data.logins.push(login);
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
        if(this.config.data.logins.length + this.config.data.ids.length > this.maxLoginsAndIds) return false;
        return true;
    }
}