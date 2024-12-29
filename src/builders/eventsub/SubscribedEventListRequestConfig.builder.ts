import axios, { AxiosRequestConfig } from "axios";
import { CreateSubscriptionResponse, GeneralResponseBody, GetSubscriptionsResponse } from "../../types/APIClient.types";
import { MappedTwitchEventId } from "../../types/EventSub.types";

/* 
Related docs:
https://dev.twitch.tv/docs/eventsub/manage-subscriptions/#getting-the-list-of-events-you-subscribe-to
*/

export default class SubscribedEventListRequestConfigBuilder {
    private config: AxiosRequestConfig = {
        url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
        method: 'GET',
        headers: {
            Authorization: null,
            "Client-Id": null
        }
    }

    private first: number = 100;
    private after: string = '';
    private before: string = '';
    private type: MappedTwitchEventId | null = null;
    constructor() {}

    public setAccessToken(accessToken: string): this {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
    }

    public setClientId(clientId: string): this {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers["Client-Id"] = clientId;
        return this;
    }

    public setType(type: MappedTwitchEventId | null): this {
        this.type = type;
        return this;
    }

    public setFirst(first: number): this {
        if(first < 1 || first > 100) throw new Error('First must be between 1 and 100');
        this.first = first;
        return this;
    }

    public setAfter(after: string): this {
        this.after = after;
        return this;
    }

    public setBefore(before: string): this {
        this.before = before;
        return this;
    }

    public build(): AxiosRequestConfig {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        if(this.config.headers.Authorization == null) throw new Error('Access token is required');
        if(this.config.headers["Client-Id"] == null) throw new Error('Client ID is required');
        const queryParams: string[] = [];
        if(this.type) queryParams.push(`type=${this.type}`);
        if(this.first) queryParams.push(`first=${this.first}`);
        if(this.after) queryParams.push(`after=${this.after}`);
        if(this.before) queryParams.push(`before=${this.before}`);
        this.config.url += `?${queryParams.join('&')}`;
        return this.config;
    }

    public async make(): Promise<CreateSubscriptionResponse> {
        const allData: CreateSubscriptionResponse[] = [];
        let lastCursor: string | undefined = '';

        const fetchData = async (): Promise<void> => {
            const requestConfig = this.build();
            const response = await axios.request<GetSubscriptionsResponse>(requestConfig);
            if (response.status !== 200) throw new Error(`Failed to get subscribed events`);

            const data = response.data;
            allData.push(data);

            const cursor = data.pagination?.cursor;
            if (cursor && cursor !== lastCursor) {
                lastCursor = cursor;
                this.setAfter(cursor);
                await fetchData();
            }
        };

        await fetchData();

        const allDataFlat = allData.flatMap((data) => data.data);
        const total = Math.max(...allData.flatMap((data) => data.total));
        const total_cost = Math.max(...allData.flatMap((data) => data.total_cost));
        const max_total_cost = Math.max(...allData.flatMap((data) => data.max_total_cost));
        return {
            data: allDataFlat,
            total,
            total_cost,
            max_total_cost
        };
    }
}