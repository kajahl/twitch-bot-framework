import {
    InMemoryTokenRepository,
    PingCommand,
    ExampleCommand,
    CounterListener,
    ShowMessageListener
} from './index';

import dotenv from 'dotenv';
import { IChannelProvider, TwitchBot } from './src/decorators/TwitchBot.decorator';
dotenv.config();

const clientId = process.env.CLIENT_ID as string;
const clientSecret = process.env.CLIENT_SECRET as string;
const userId = process.env.USER_ID as string;
const userRefreshToken = process.env.USER_REFRESH_TOKEN as string;


class ChannelProvider implements IChannelProvider {
    private channels: string[] = ['87576158', '82197170'];
    async getChannelIds(): Promise<string[]> {
        return this.channels;
    }
    async onChannelsUpdated(callback: (channels: string[]) => void): Promise<void> {
        setInterval(() => {
            this.channels = ['87576158', '82197170'];
            callback(this.channels);
        }, 10000);
    }
}

@TwitchBot({
    userId,
    clientId,
    clientSecret,
    channelProvider: ChannelProvider,
    tokenRepository: InMemoryTokenRepository,
    commands: [PingCommand, ExampleCommand],
    listeners: [CounterListener, ShowMessageListener]
})
class Bot {}