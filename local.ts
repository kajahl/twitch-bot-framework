import dotenv from 'dotenv';
import { TwitchBot } from './src/decorators/TwitchBot.decorator';
import { LogLevel } from './src/utils/Logger';
import { IListenChannelsProvider } from './src/types/ListenChannels.provider.types';
import { IChannelOptionsProvider, ChannelOptions } from './src/types/ChannelOptions.provider';
import InMemoryTokenRepository from './src/example/repositories/InMemoryToken.repository';
import PingCommand from './src/example/commands/Ping.command';
import ExampleCommand from './src/example/commands/Example.command';
import CounterListener from './src/example/listeners/Counter.listener';
import ShowMessageListener from './src/example/listeners/ShowMessage.listener';

dotenv.config();

const clientId = process.env.CLIENT_ID as string;
const clientSecret = process.env.CLIENT_SECRET as string;
const userId = process.env.USER_ID as string;
const userRefreshToken = process.env.USER_REFRESH_TOKEN as string;

class ListenChannelsProvider implements IListenChannelsProvider {
    private i = 0;
    private channels: string[] = ['87576158', '474118438', '66250925', '82197170', '58462752'];
    async getChannelIds(): Promise<string[]> {
        // return this.i++ % 2 == 0 ? this.channels : [];
        return this.channels;
    }
}

export type ChannelOptionsExtend = ChannelOptions<{
    eXampleExecutionCounter: number;
}>;

class ChannelOptionsProvider implements IChannelOptionsProvider<ChannelOptionsExtend> {
    private readonly baseOptions: ChannelOptionsExtend = {
        prefix: '!',
        eXampleExecutionCounter: 0,
    }
    private readonly changedOptions = new Map<string, ChannelOptionsExtend>();

    async getOptions(channelId: string): Promise<ChannelOptionsExtend> {
        if(this.changedOptions.has(channelId)) {
            return this.changedOptions.get(channelId) as ChannelOptionsExtend;
        }
        return this.baseOptions;
    }

    async setOptions(channelId: string, options: ChannelOptionsExtend): Promise<void> {
        this.changedOptions.set(channelId, options);
    }
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
    },
    tokenRepository: InMemoryTokenRepository,
    commands: [PingCommand, ExampleCommand],
    listeners: [CounterListener, ShowMessageListener],
    log: {
        levels: [LogLevel.INFO, LogLevel.NORMAL, LogLevel.ERROR, LogLevel.WARN] //, LogLevel.DEBUG],
    },
})
class Bot {}
