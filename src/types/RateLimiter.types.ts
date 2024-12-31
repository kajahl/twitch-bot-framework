export enum RequestPriority {
    Realtime = 50,
    High = 40,
    Medium = 30,
    Low = 20,
    Insignificant = 10
}

export type RequestQueueItem = {
    sendRequest: () => void;
    priority: RequestPriority;
    id: number;
}

export type TwitchRatelimitState = {
    limit: number;
    remaining: number;
    reset: number;
};
