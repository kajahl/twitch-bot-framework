import { Inject } from "typedi";
import { ChannelOptions, IChannelOptionsProvider } from "../types/ChannelOptions.provider";
import DINames from "../utils/DI.names";
import ConfigService from "../services/Config.service";
import { Logger, LoggerFactory } from "../utils/Logger";
import { TChannelOptionsProvider } from "../decorators/TwitchBot.decorator";

export class ChannelOptionsProvider<T extends Record<string, any> = {}> {
    private provider: IChannelOptionsProvider<T>;
    private logger: Logger;

    constructor(
        private readonly optionsProvider: TChannelOptionsProvider<T>,
        @Inject(DINames.ConfigService) private readonly configService: ConfigService,
        @Inject(DINames.LoggerFactory) private readonly loggerFactory: LoggerFactory
    ) {
        this.logger = this.loggerFactory.createLogger('ChannelOptionsProvider');
        this.provider = new this.optionsProvider();
        // TODO: Cache
        this.logger.debug('Initialized');
    }

    private async getOptions(channelId: string): Promise<ChannelOptions<T>> {
        const optionsFromProvider = await this.provider.getOptions(channelId);
        return optionsFromProvider;
    }

    private saveOptions(channelId: string, options: ChannelOptions<T>): void {
        this.provider.setOptions(channelId, options);
    }

    /**
     * Get channel options (get options from cache or provider defined by user)
     * @param channelId ChannelId
     * @returns ChannelOptions Record {@link ChannelOptionsRecord}
     */
    getChannelOptions(channelId: string): ChannelOptions<T> | Promise<ChannelOptions<T>> {
        this.logger.debug(`Getting channel options for channel ${channelId}`);
        return this.getOptions(channelId);
    }

    setChannelOptions(channelId: string, options: ChannelOptions<T>): void {
        this.logger.debug(`Setting channel options for channel ${channelId}`);
        this.saveOptions(channelId, options);
    }
}