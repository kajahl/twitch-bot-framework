import { Subscription } from "./Websocket.types";

// General response

export type GeneralResponseBody<T> = {
    data: T[];
}

export type GeneralResponseError = {
    error: string;
    status: number;
    message: string;
}

// Messages

export type SendMessageResponse = {
    message_id: string;
    is_sent: boolean;
    drop_reason: string;
}

export type DeleteMessageResponse = {}

// Subscriptions

export type CreateSubscriptionResponse = {
    data: Subscription[];
    total: number;
    total_cost: number;
    max_total_cost: number;
}

export type GetSubscriptionsResponse = CreateSubscriptionResponse & {
    pagination: {};
}

export type DeleteSubscriptionResponse = {} | {
    error: string;
    status: number;
    message: string;
}