/*

Dekorator do definiowania klas jako listenery czatu

Przykład użycia:

@ChatListener({
    name: string;
    transient?: boolean;
})

*/

import { GeneralContainer, GeneralFactory, GeneralRegistry } from "../types/Decorator.storage.types";
import { ChatListenerDecoratorOptions, ChatListenerExecution, ChatListenerInstance } from "../types/ChatListener.types";
import ChannelChatMessageEventData from "../types/EventSub_Events/ChannelChatMessageEventData.types";
import {Logger} from "../utils/Logger";


// Typy

// Funkcje

const logger = new Logger('ChatListenerDecorator');

export const chatListenersContainer = GeneralContainer.getInstance<GeneralFactory, ChatListenerExecution>();
const chatListenerRegistry = GeneralRegistry.getInstance<ChatListenerInstance, ChatListenerDecoratorOptions>();


// Decorator
export function ChatListener(options: ChatListenerDecoratorOptions): ClassDecorator {
    logger.log(`Registering listener ${options.name}`);

    return function (target: any) {
        const allOptions: Required<ChatListenerDecoratorOptions> = {
            name: options.name,
            transient: options.transient ?? true
        };

        // Register the command in the container
        chatListenersContainer.set({
            id: target,
            factory: () => new target(),
            transient: allOptions.transient,
            enabled: false // Default disabled (enable by setting in TwitchBotFramework)
        });

        const instance = chatListenersContainer.get(target) as ChatListenerInstance;

        // Check if the command implements the required methods
        if (typeof instance.execution !== 'function') {
            throw new Error(`Listener ${target.name} does not implement the required method 'execution'`);
        }

        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).map(m => {
            const methodName = m as keyof ChatListenerInstance;
            if (m === 'constructor') return undefined;
            if (typeof instance[methodName] !== 'function') return undefined;
            return m;
        }).filter(m => m !== undefined) as (keyof ChatListenerInstance)[];

        chatListenerRegistry.register(target, allOptions, methods);
    };
}

export function ListenerHandler(data: ChannelChatMessageEventData): void {
    const listeners = chatListenerRegistry.getRegisteredEntries();
    listeners.forEach(listener => {
        let instance: ChatListenerInstance;
        try {
            instance = chatListenersContainer.get(listener.target, true);
        } catch (error) {
            return;
        }
        
        try {
            instance.execution({ event: data });
        } catch (error) {
            logger.error(`Error while executing listener ${listener.options.name}: ${error}`);
        }
    });
}