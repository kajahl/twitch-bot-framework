import { Inject, Service } from 'typedi';
import { IListenChannelsProvider, ListenChannelsCallback, ListenChannelSubscriptionResult } from '../types/ListenChannels.provider.types';
import DINames from '../utils/DI.names';
import { Logger, LoggerFactory } from '../utils/Logger';
import ConfigService from '../services/Config.service';
import { TListenChannelsProvider } from '../decorators/TwitchBot.decorator';

@Service(DINames.ListenChannelsProvider)
export default class ListenChannelsProvider implements IListenChannelsProvider {
    private readonly provider: IListenChannelsProvider;
    private readonly logger: Logger;
    private _lastChannelIds: string[] = [];

    constructor(
        private readonly channelProvider: TListenChannelsProvider,
        @Inject(DINames.ConfigService) private readonly config: ConfigService,
        @Inject(DINames.LoggerFactory) loggerFactory: LoggerFactory
    ) {
        this.logger = loggerFactory.createLogger('ListenChannels');
        this.provider = new this.channelProvider();
        this.setupRefreshInterval();
        this.setupApiCheckInterval();
        this.logger.debug('Initialized');
    }

    // Interval for refreshing channels
    private refreshInterval: NodeJS.Timeout | null = null;
    private setupRefreshInterval(): void {
        const refreshInterval = this.config.getConfig().listenChannels.refreshInterval;
        this.refreshInterval = setInterval(() => {
            this.logger.debug(`Interval for refreshing channels`);
            this.refreshChannels();
        }, refreshInterval);
    }

    // Interval for API check (TODO)
    private apiCheckInterval: NodeJS.Timeout | null = null;
    private setupApiCheckInterval(): void {
        const apiCheckDelay = this.config.getConfig().listenChannels.refreshInterval / 2;
        setTimeout(() => {
            if(this.apiCheckInterval) clearInterval(this.apiCheckInterval);
            const apiCheckInterval = this.config.getConfig().listenChannels.refreshInterval * 4;
            this.apiCheckInterval = setInterval(() => {
                this.logger.debug(`Interval for API check`);
                this.APICheckChannels();
            }, apiCheckInterval);
        }, apiCheckDelay);
    }

    /**
     * Get channel ids (including bot's user id)
     * @returns List of channel ids
     */
    async getChannelIds(): Promise<string[]> {
        const channels = await this.provider.getChannelIds();
        const botUserId = this.config.getConfig().userId;
        if(!channels.includes(botUserId)) 
            channels.push(botUserId);
        return channels;
    }

    /**
     * Refresh channels and emit event if there are any changes
     * @returns True if channels were updated, false otherwise
     */
    async refreshChannels(): Promise<boolean> {
        this.logger.debug('Refreshing channels');
        const channelIds = await this.getChannelIds();
        const lastChannelIds = this._lastChannelIds;

        const anyChanges =
            // Check if the length of the arrays is different
            channelIds.length !== lastChannelIds.length ||
            // Check if any of the channelIds is not in the lastChannelIds
            channelIds.some((channelId) => !lastChannelIds.includes(channelId)) ||
            // Check if any of the lastChannelIds is not in the channelIds
            lastChannelIds.some((channelId) => !channelIds.includes(channelId));

        if (!anyChanges) {
            this.logger.debug('No differences in channels');
            return false;
        }

        this.logger.debug('Detected differences in channels');
        this.emitChannelsUpdated(channelIds);
        return true;
    }

    private APICheckChannels(): void {
        // TODO : Implementacja sprawdzania poprawności lokalnego stanu "this._lastChannelIds" z wykorzystaniem API
        // Do ogarnięcia jak będzie builder dla API
    }

    /**
     * Handle failed subscriptions and unsubscriptions
     * @param failedSubscriptions List of failed subscriptions {@link ListenChannelSubscriptionResult}
     * @param failedUnsubscriptions List of failed unsubscriptions {@link ListenChannelSubscriptionResult}
     */
    handleFailedSubscriptions(failedSubscriptions: ListenChannelSubscriptionResult[], failedUnsubscriptions: ListenChannelSubscriptionResult[]): void {
        // https://dev.twitch.tv/docs/api/reference/#create-eventsub-subscription
        // Kody: (202/400/401/403/409/429)
        this._lastChannelIds = this._lastChannelIds.filter((channel) => !failedSubscriptions.map(f => f.channel).includes(channel));
        if (failedSubscriptions.length > 0) {
            const getDesc = (code: number) => {
                switch (code) {
                    case 400: return 'Bad request: Request was malformed or missing fields';
                    case 401: return 'Unauthorized: Access token is missing or invalid';
                    case 403: return 'Forbidden: Missing required scope';
                    case 409: return 'Conflict: Subscription with this conditions already exists';
                    case 429: return 'Too many requests: Exceeded subscription limit (type+condition combination)';
                    default: return 'Unknown';
                }
            };
            const lines = failedSubscriptions.map(fs => `${fs.channel} (${fs.code}: ${getDesc(fs.code)})`);
            this.logger.warn(`Failed subscriptions:`);
            lines.forEach((line) => this.logger.warn(`- ${line}`));
        }

        // https://dev.twitch.tv/docs/api/reference/#delete-eventsub-subscription
        // Kody: (204, 400, 401, 404)
        if (failedUnsubscriptions.length > 0) {
            const getDesc = (code: number) => {
                switch (code) {
                    case 400: return 'Bad request: Request was malformed or missing fields';
                    case 401: return 'Unauthorized: Access token is missing or invalid';
                    case 404: return 'Not found: Subscription not found';
                    default: return 'Unknown';
                }
            };
            const lines = failedUnsubscriptions.map(fs => `${fs.channel} (${fs.code}: ${getDesc(fs.code)})`);
            this.logger.warn(`Failed unsubscriptions:`);
            lines.forEach((line) => this.logger.warn(`- ${line}`));
        }
    }

    // Observer pattern
    private callbacks: ListenChannelsCallback[] = [];

    private emitChannelsUpdated(channels: string[]): void {
        const newChannels = channels.filter((channel) => !this._lastChannelIds.includes(channel));
        const removedChannels = this._lastChannelIds.filter((channel) => !channels.includes(channel));
        this._lastChannelIds = channels;
        this.logger.info(`Channels updated: All[${channels.length}] (New[${newChannels.length}], Removed[${removedChannels.length}])`);
        this.callbacks.forEach((callback) => callback(channels, removedChannels, newChannels));
    }

    onChannelsUpdated(callback: ListenChannelsCallback): void {
        this.callbacks.push(callback);
        this.logger.debug(`Added callback`);
    }

    offChannelsUpdated(callback: ListenChannelsCallback): void {
        this.callbacks = this.callbacks.filter((cb) => cb !== callback);
        this.logger.debug(`Removed callback`);
    }
}
