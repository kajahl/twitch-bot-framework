import { InMemoryTokenRepository, PingCommand, ExampleCommand, CounterListener, ShowMessageListener } from './index';

import dotenv from 'dotenv';
import { TwitchBot } from './src/decorators/TwitchBot.decorator';
import { LogLevel } from './src/utils/Logger';
import { IListenChannels } from './src/types/ListenChannels.provider.types';
import { IChannelOptionsProvider, ChannelOptions } from './src/types/ChannelOptions.provider';
dotenv.config();

const clientId = process.env.CLIENT_ID as string;
const clientSecret = process.env.CLIENT_SECRET as string;
const userId = process.env.USER_ID as string;
const userRefreshToken = process.env.USER_REFRESH_TOKEN as string;

class ListenChannelsProvider implements IListenChannels {
    private i = 0;
    private channels: string[] = ['87576158', '82197170'];
    async getChannelIds(): Promise<string[]> {
        return this.i++ % 2 == 0 ? this.channels : [];
    }
}

export type ChannelOptionsExtend = ChannelOptions<{
    otherOption: string;
}>;

class ChannelOptionsProvider implements IChannelOptionsProvider<ChannelOptionsExtend> {
    async getOptions(channelId: string): Promise<ChannelOptionsExtend> {
        return {
            prefix: channelId === '87576158' ? '#' : '!',
            otherOption: 'test',
        };
    }

    async setOptions(channelId: string, options: ChannelOptionsExtend): Promise<void> {}
}

@TwitchBot({
    userId,
    clientId,
    clientSecret,
    listenChannels: {
        provider: ListenChannelsProvider,
        refreshInterval: 30000,
    },
    channelOptions: {
        provider: ChannelOptionsProvider,
        cache: {
            enabled: true,
            ttl: 60000,
        },
    },
    tokenRepository: InMemoryTokenRepository,
    commands: [PingCommand, ExampleCommand],
    listeners: [CounterListener, ShowMessageListener],
    log: {
        levels: [LogLevel.INFO, LogLevel.NORMAL, LogLevel.ERROR, LogLevel.WARN, LogLevel.DEBUG],
    },
})
class Bot {}
