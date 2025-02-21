export type ChannelBaseOptions = {
    prefix: string;
}

export type TChannelOptions<Extend extends Record<string, any>> = ChannelBaseOptions & Extend;

type TorPromiseT<T> = T | Promise<T>;

export interface IChannelOptionsProvider<Extend extends Record<string, any>> {
    getOptions(channelId: string): TorPromiseT<TChannelOptions<Extend>>;
    setOptions(channelId: string, options: TChannelOptions<Extend>): TorPromiseT<void>;
}