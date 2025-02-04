import { chatCommandsContainer, getAllKeywords } from "./decorators/ChatCommand.decorator";
import { chatListenersContainer } from "./decorators/ChatListener.decorator";
import { ITwitchBotConfig } from "./decorators/TwitchBot.decorator";

import Logger from "./utils/Logger";

const logger = new Logger('TwitchBotFramework');

export default class TwitchBotFramework {
    // private userCacheManager: UserCacheManager;
    constructor(
        private readonly options: ITwitchBotConfig
    ) {
        // Reflect.getMetadata('config', this);

        // Enable chat commands and listeners
        if(options.commands) {
            options.commands.forEach(command => chatCommandsContainer.enable(command));
        }

        if(options.listeners) {
            options.listeners.forEach(listener => chatListenersContainer.enable(listener));
        }

        // TODO: Change this
        getAllKeywords(); // Load command keywords to cache (throw error if at startup instad of runtime)
        
    }

    
}