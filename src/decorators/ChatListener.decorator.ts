/*

Dekorator do definiowania klas jako listenery czatu

Przykład użycia:

@ChatListener({
    name: string;
    transient?: boolean;
})

*/

import ChatListenersService from "../services/ChatListeners.service";
import { ChatListenerDecoratorOptions, ChatListenerInstance } from "../types/ChatListener.types";

// Decorator
export function ChatListener(options: ChatListenerDecoratorOptions): ClassDecorator {
    return function (target: any) {
        const allOptions: Required<ChatListenerDecoratorOptions> = {
            name: options.name,
            transient: options.transient ?? true
        };

        // Register the command in the container
        ChatListenersService.getChatListenersContainer().set({
            id: target,
            factory: () => new target(),
            transient: allOptions.transient,
            enabled: false // Default disabled (enable by setting in TwitchBotFramework)
        });

        const instance = ChatListenersService.getChatListenersContainer().get(target) as ChatListenerInstance;

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

        ChatListenersService.getListenersRegistry().register(target, allOptions, methods);
    };
}