import { Subscription } from "./Websocket.types";

// General response

export type GeneralResponseBody<T> = T;

export type GeneralResponseError = {
    error: string;
    status: number;
    message: string;
}

// Subscriptions

export type CreateSubscriptionResponse = {
    data: Subscription[];
    total: number;
    total_cost: number;
    max_total_cost: number;
}

export type GetSubscriptionsResponse = CreateSubscriptionResponse & Pagination;

export type DeleteSubscriptionResponse = {}

// Pagination

export type Pagination = {
    pagination: {
        cursor?: string;
    }
}
