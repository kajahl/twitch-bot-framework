export type ChannelBaseOptions = {
    prefix: string;
}

export type ChannelOptions<Extend extends Record<string, any>> = ChannelBaseOptions & Extend;

type TorPromiseT<T> = T | Promise<T>;

export interface IChannelOptionsProvider<Extend extends Record<string, any>> {
    getOptions(channelId: string): TorPromiseT<ChannelOptions<Extend>>;
    setOptions(channelId: string, options: ChannelOptions<Extend>): TorPromiseT<void>;
}