import { ChatListenerDecoratorOptions, ChatListenerExecution, ChatListenerInstance } from "../../types/ChatListener.types";
import ChannelChatMessageEventData from "../../types/EventSub_Events/ChannelChatMessageEventData.types";
import Logger from "../../utils/Logger";
import { GeneralContainer, GeneralFactory, GeneralRegistry } from "./../runtime/Decorator.storage";

const logger = new Logger('ChatListenerDecorator');

// type ChatListenerFactory = () => any;

// type ChatListenerEntry = {
//     id: any;
//     factory: ChatListenerFactory;
//     instance?: ChatListenerExecution;
//     transient: boolean;
// }

// export class ChatListenersContainer {
//     private static instance: ChatListenersContainer;
//     private registry: Map<any, ChatListenerEntry> = new Map();

//     private constructor() {}

//     public static getInstance(): ChatListenersContainer {
//         if (!ChatListenersContainer.instance) {
//             ChatListenersContainer.instance = new ChatListenersContainer();
//         }
//         return ChatListenersContainer.instance;
//     }

//     public set(entry: ChatListenerEntry): void {
//         this.registry.set(entry.id, entry);
//     }

//     public get(id: any): any {
//         const entry = this.registry.get(id);
//         if (!entry) throw new Error(`No entry found for id=${id}`);
//         if (!entry.transient && !entry.instance) entry.instance = entry.factory();
//         return entry.transient ? entry.factory() : entry.instance;
//     }
// }

// export type ChatListenerRegistryEntry = {
//     target: new () => ChatListenerInstance;
//     options: Required<ChatListenerDecoratorOptions>;
//     methods: (keyof ChatListenerInstance)[];
// }

// class ChatListenerRegistry {
//     private static registry: ChatListenerRegistryEntry[] = [];

//     public static register(target: new () => ChatListenerInstance, options: Required<ChatListenerDecoratorOptions>, methods: (keyof ChatListenerInstance)[]): void {
//         this.registry.push({ target, options, methods });
//     }

//     public static getRegisteredListeners(): ChatListenerRegistryEntry[] {
//         return this.registry;
//     }

//     public static getListenerRecord(name: string): ChatListenerRegistryEntry | undefined {
//         return this.registry.find((listener) => listener.options.name.toLowerCase() === name.toLowerCase());
//     }
// }


const chatListenersContainer = GeneralContainer.getInstance<GeneralFactory, ChatListenerExecution>();
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
            transient: allOptions.transient
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
        const instance = chatListenersContainer.get(listener.target);
        
        try {
            instance.execution({ event: data });
        } catch (error) {
            logger.error(`Error while executing listener ${listener.options.name}: ${error}`);
        }
    });
}