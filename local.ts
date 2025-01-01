import TwitchBotFramework, {
    ListenChannelsRepository,
    InMemoryTokenRepository,
    PingCommand,
    ExampleCommand,
    CounterListener,
    ShowMessageListener
} from './index.ts';

import dotenv from 'dotenv';
dotenv.config();

const clientId = process.env.CLIENT_ID as string;
const clientSecret = process.env.CLIENT_SECRET as string;
const userId = process.env.USER_ID as string;
const userRefreshToken = process.env.USER_REFRESH_TOKEN as string;

// ListenChannelsRepository

class ListenedChannels implements ListenChannelsRepository {
    private channels: string[] = ['87576158', '82197170'];
    async getChannelIds(): Promise<string[]> {
        return this.channels;
    }
}

// END ListenChannelsRepository

const app = new TwitchBotFramework({
    bot: {
        userId,
        clientId,
        clientSecret
    },
    channels: {
        listenChannelsClass: ListenedChannels,
        // listenChannels: ['87576158']
    },
    chat: {
        commands: [PingCommand, ExampleCommand],
        listeners: [ShowMessageListener]
    },
    repository: {
        tokenClass: InMemoryTokenRepository
    }
});