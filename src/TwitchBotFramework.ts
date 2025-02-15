import 'reflect-metadata';
import { Inject, Service } from 'typedi';
import { chatCommandsContainer, getAllKeywords } from './decorators/ChatCommand.decorator';
import { chatListenersContainer } from './decorators/ChatListener.decorator';
import Logger from './utils/Logger';
import { TokenService } from './services/Token.service';
import EventSubClient from './clients/EventSub.client';
import DINames from './utils/DI.names';
import ConfigService from './services/Config.service';

const logger = new Logger('TwitchBotFramework');

@Service(DINames.TwitchBotFramework)
export default class TwitchBotFramework {
    constructor(
        @Inject(DINames.ConfigService) private readonly config: ConfigService,
        @Inject(DINames.TokenService) private tokenService: TokenService,
        @Inject(DINames.EventSubClient) private eventSubClient: EventSubClient
    ) {
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
    }
}
