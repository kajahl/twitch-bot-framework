export interface IListenChannels {
    getChannelIds(): Promise<string[]> | string[];
}

export type ListenChannelsCallback = (channels: string[], removedChannels: string[], newChannels: string[]) => void;

export type ListenChannelSubscriptionResult = {
    success: boolean;
    channel: string;
    code: number;
    message?: string;
}