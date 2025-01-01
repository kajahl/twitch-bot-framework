import UserCacheManager from "./cache/managers/UserCache.manager";
import APIClient from "./clients/Api.client";
import EventSubClient from "./clients/EventSub.client";
import { TokenService } from "./services/Token.service";
import { chatCommandsContainer, getAllKeywords } from "./storage/decorators/ChatCommand.decorator";
import { chatListenersContainer } from "./storage/decorators/ChatListener.decorator";
import { StaticChannels } from "./storage/predefined/StaticChannels.repository";
import { ListenChannelsRepository } from "./storage/repository/ListenChannels.repository";
import { TokenRepository } from "./storage/repository/Token.repository";
import DataStorage from "./storage/runtime/Data.storage";
import { ChatCommandExecution } from "./types/ChatCommand.types";
import { ChatListenerExecution } from "./types/ChatListener.types";
import Logger from "./utils/Logger";

export type TwitchBotFrameworkOptions = {
    bot: {
        userId: string;
        clientId: string;
        clientSecret: string;
    },
    channels: ChannelsOptions, 
    chat: ChatOptions,
    repository: {
        tokenClass: new () => TokenRepository;
    }
};

type ChannelsOptions = {
    refreshInterval?: number;
} & (
    { 
        listenChannelsClass: new () => ListenChannelsRepository;
        listenChannels?: never;
    } | { 
        listenChannels: string[]; 
        listenChannelsClass?: never;
    }
);

type ChatOptions = {
    commands?: (new () => ChatCommandExecution)[];
    listeners?: (new () => ChatListenerExecution)[];
}

const logger = new Logger('TwitchBotFramework');

export default class TwitchBotFramework {
    private tokenService: TokenService;
    private eventSubClient: EventSubClient;
    private userCacheManager: UserCacheManager;

    private listenChannelsRepository: ListenChannelsRepository;
    private channelRefreshInterval: number = 1000 * 60 * 1; // Default: 1 minute

    constructor(
        private readonly options: TwitchBotFrameworkOptions
    ) {
        // Init data storage
        const data = DataStorage.getInstance();
        data.clientId.set(options.bot.clientId);
        data.clientSecret.set(options.bot.clientSecret);
        data.userId.set(options.bot.userId);

        // Enable chat commands and listeners
        if(options.chat.commands) {
            options.chat.commands.forEach(command => chatCommandsContainer.enable(command));
        }

        if(options.chat.listeners) {
            options.chat.listeners.forEach(listener => chatListenersContainer.enable(listener));
        }

        // Init data
        this.channelRefreshInterval = options.channels.refreshInterval || this.channelRefreshInterval;
        getAllKeywords(); // Load command keywords to cache (throw error if at startup instad of runtime)
        
        // Init repositories
        const tokenRepository = new options.repository.tokenClass();
        if(options.channels.listenChannelsClass !== undefined) {
            this.listenChannelsRepository = new options.channels.listenChannelsClass();
        } else {
            this.listenChannelsRepository = StaticChannels.of(options.channels.listenChannels);
        }

        // Init others
        this.tokenService = TokenService.init(tokenRepository);
        this.userCacheManager = UserCacheManager.init(this.tokenService);
        this.eventSubClient = EventSubClient.init(this.tokenService);

        // Setup events
        this.setupChatListeners();

        // Connect
        this.eventSubClient.websocket.connect();
    }

    private channelRefreshTimeout: NodeJS.Timeout | null = null;
    private channelList: string[] = [];
    private async setupChatListeners() {
        if(this.channelRefreshTimeout) {
            clearTimeout(this.channelRefreshTimeout);
            this.channelRefreshTimeout = null;
        }
        const channels = await this.listenChannelsRepository.getChannelIds();
        if(!channels.includes(this.options.bot.userId)) {
            channels.push(this.options.bot.userId);
        }
        logger.log(`Checking listeners for channels=${channels.join(',')}`);
        const channelsToSubscribe = channels.filter(channel => !this.channelList.includes(channel));
        const channelsToUnsubscribe = this.channelList.filter(channel => !channels.includes(channel));

        const subscribePromises = channelsToSubscribe.map(async channel => {
            logger.log(`Subscribing to chat events for channel=${channel}...`);
            const promise = this.eventSubClient.listenChat(channel);
            promise.then((data) => {
                logger.log(`Successfully subscribed to chat events for channel=${channel}`);
            }).catch((err) => {
                logger.error(`Failed to subscribe to chat events for channel=${channel} - ${err}`);
            });
            return promise;
        });
        
        const unsubscribePromises = channelsToUnsubscribe.map(async channel => {
            logger.log(`Unsubscribing from chat events for channel=${channel}...`);
            const promise = this.eventSubClient.unlistenChat(channel);
            promise.then((data) => {
                logger.log(`Successfully unsubscribed from chat events for channel=${channel}`);
            }).catch((err) => {
                logger.error(`Failed to unsubscribe from chat events for channel=${channel} - ${err}`);
            });
            return promise;
        });

        await Promise.all([...subscribePromises, ...unsubscribePromises]).catch((err) => {
            logger.error(`Failed to setup chat listeners - ${err}`);
        });

        this.channelList = channels;
        this.channelRefreshTimeout = setTimeout(() => this.setupChatListeners().catch(e => logger.error(e)), this.channelRefreshInterval);
    }

    async getBotAPI() {
        return APIClient.asUserId(this.options.bot.userId);
    }
}