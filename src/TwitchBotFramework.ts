import 'reflect-metadata';
import { Inject, Service } from 'typedi';
import { chatCommandsContainer, getAllKeywords } from './decorators/ChatCommand.decorator';
import { chatListenersContainer } from './decorators/ChatListener.decorator';
import { TokenService } from './services/Token.service';
import EventSubClient from './clients/EventSub.client';
import DINames from './utils/DI.names';
import ConfigService from './services/Config.service';
import { Logger, LoggerFactory } from './utils/Logger';
import APIClient from './clients/Api.client';

@Service(DINames.TwitchBotFramework)
export default class TwitchBotFramework {
    private readonly logger: Logger;

    constructor(
        @Inject(DINames.ConfigService) readonly config: ConfigService,
        @Inject(DINames.TokenService) readonly tokenService: TokenService,
        @Inject(DINames.EventSubClient) readonly eventSubClient: EventSubClient,
        @Inject(DINames.APIClient) readonly apiClient: APIClient,
        @Inject(DINames.LoggerFactory) loggerFactory: LoggerFactory
    ) {
        this.logger = loggerFactory.createLogger('TwitchBotFramework');
        const options = config.getConfig();
        // Enable chat commands and listeners
        if (options.commands) {
            options.commands.forEach((command) => {
                chatCommandsContainer.enable(command);
            });
        }
        if (options.listeners) {
            options.listeners.forEach((listener) => {
                chatListenersContainer.enable(listener);
            });
        }

        // TODO: Change this
        getAllKeywords(); // Load command keywords to cache (throw error if at startup instad of runtime)

        this.logger.debug('Initialized');
    }
}
