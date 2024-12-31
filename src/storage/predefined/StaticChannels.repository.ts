import { ListenChannelsRepository } from "../repository/ListenChannels.repository";

export class StaticChannels {
    static of(channels: string[]): ListenChannelsRepository {
        return {
            async getChannelIds(): Promise<string[]> {
                return channels;
            }
        };
    }
}