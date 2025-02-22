import 'reflect-metadata';
import { Inject } from 'typedi';
import { TokenService } from './services/Token.service';
import EventSubClient from './clients/EventSub.client';
import DINames from './utils/DI.names';
import ConfigService from './services/Config.service';
import { Logger, LoggerFactory } from './utils/Logger';
import APIClient from './clients/Api.client';
import ChatCommandsService from './services/ChatCommands.service';
import ChatListenersService from './services/ChatListeners.service';

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
                ChatCommandsService.getChatCommandsContainer().enable(command);
            });
        }
        if (options.listeners) {
            options.listeners.forEach((listener) => {
                ChatListenersService.getChatListenersContainer().enable(listener);
            });
        }

        this.logger.debug('Initialized');
    }
}
