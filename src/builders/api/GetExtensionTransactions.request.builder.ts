// https://dev.twitch.tv/docs/api/reference/#get-extension-transactions

import BaseRequestBuilder from "./Base.request.builder";

// Typy

export type GetExtensionTransactionsResponse = {
    data: {
        id: string;
        timestamp: string;
        broadcaster_id: string;
        broadcaster_login: string;
        broadcaster_name: string;
        user_id: string;
        user_login: string;
        user_name: string;
        product_type: string;
        product_data: {
            sku: string;
            cost: {
                amount: number;
                type: string;
            },
            inDevelopment: boolean;
            displayName: string;
            expiration: string;
            broadcast: boolean;
        };
    }[],
    pagination: {
        cursor: string;
    }
}

// Builder

export default class GetExtensionTransactionsRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 401, 404];

    constructor() {
        super('GET', 'https://api.twitch.tv/helix/extensions/transactions', {
            extension_id: null,
            id: null,
            after: null,
            first: null,
        });
    }

    public setExtensionId(extension_id: string): this {
        this.config.data.extension_id = extension_id;
        return this;
    }

    public setId(id: string | string[]): this {
        this.config.data.id = id;
        return this;
    }

    public setAfter(after: string): this {
        this.config.data.after = after;
        return this;
    }

    public setFirst(first: number): this {
        this.config.data.first = first;
        return this;
    }

    public checkTypes(): boolean {
        if(this.config.data.extension_id == null) throw new Error('Extension ID is required');
        return true;
    }
}