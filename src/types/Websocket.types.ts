export enum WebsocketMessageType {
    Welcome = 'session_welcome',
    KeepAlive = 'session_keepalive',
    Notification = 'notification',
    Reconnect = 'session_reconnect',
    Revocation = 'revocation',
    Close = 'close',
}

export type WebsocketMessage<Payload> = {
    metadata: {
        message_id: string;
        message_type: string;
        message_timestamp: string;
    };
    payload: Payload;
};

export type WelcomePayload = {
    session: {
        id: string;
        status: string;
        connected_at: string;
        keepalive_timeout_seconds: number;
        reconnect_url: string;
    };
};

export type NotificationPayload<T = any> = {
    subscription: Subscription;
    event: T;
};

export type RevocationPayload = {
    subscription: Subscription;
};

export type Subscription = {
    id: string;
    status: string;
    type: string;
    version: string;
    cost: number;
    condition: Record<string, any>;
    transport: {
        method: string;
        session_id: string;
    };
    created_at: string;
};
