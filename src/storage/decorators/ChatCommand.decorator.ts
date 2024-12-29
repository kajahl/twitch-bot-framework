import { ChatCommandExecution, ChatCommandInstance, ChatCommandDecoratorOptions } from "../../types/ChatCommand.types";
import ChannelChatMessageEventData from "../../types/EventSub_Events/ChannelChatMessageEventData.types";
import Logger from "../../utils/Logger";

const logger = new Logger('ChatCommandDecorator');

// CommandsContainer
type ChatCommandFactory = () => any;

type CommandEntry = {
    id: any;
    factory: ChatCommandFactory;
    transient: boolean;
}

export class ChatCommandsContainer {
    private static instance: ChatCommandsContainer;
    private registry: Map<any, CommandEntry> = new Map();

    private constructor() {}

    public static getInstance(): ChatCommandsContainer {
        if (!ChatCommandsContainer.instance) {
            ChatCommandsContainer.instance = new ChatCommandsContainer();
        }
        return ChatCommandsContainer.instance;
    }

    public set(entry: CommandEntry): void {
        this.registry.set(entry.id, entry);
    }

    public get(id: any): any {
        const entry = this.registry.get(id);
        if (!entry) {
            throw new Error(`No entry found for id=${id}`);
        }
        return entry.transient ? entry.factory() : entry.factory();
    }
}

const chatCommandsContainer = ChatCommandsContainer.getInstance();

// CommandRegistry
export type ChatCommandRegistryEntry = {
    target: new () => ChatCommandInstance;
    options: Required<ChatCommandDecoratorOptions>;
    methods: (keyof ChatCommandInstance)[];
}

class ChatCommandRegistry {
    private static registry: ChatCommandRegistryEntry[] = [];

    public static register(target: new () => ChatCommandInstance, options: Required<ChatCommandDecoratorOptions>, methods: (keyof ChatCommandInstance)[]): void {
        this.registry.push({ target, options, methods });
    }

    public static getRegisteredCommands(): ChatCommandRegistryEntry[] {
        return this.registry;
    }

    public static getCommandRecord(commandName: string): ChatCommandRegistryEntry | undefined {
        return this.registry.find((command) => command.options.commandName.toLowerCase() === commandName.toLowerCase());
    }
}

// Decorator
export function ChatCommand(options: ChatCommandDecoratorOptions): ClassDecorator {
    logger.log(`Registering command ${options.commandName}`);

    return function (target: any) {
        const allOptions: Required<ChatCommandDecoratorOptions> = {
            commandName: options.commandName,
            keyword: options.keyword ?? '',
            anyMessage: options.anyMessage ?? false,
            transistent: options.transistent ?? false,
            ignorePrefix: options.ignorePrefix ?? false,
            ignoreCase: options.ignoreCase ?? true
        };

        // Register the command in the container
        chatCommandsContainer.set({
            id: target,
            factory: () => new target(),
            transient: allOptions.transistent
        });

        const instance = chatCommandsContainer.get(target) as ChatCommandInstance;

        // Check if the command implements the required methods
        if (typeof instance.execution !== 'function') {
            throw new Error(`Klasa ${target.name} musi implementować metodę execution!`);
        }

        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).map(m => {
            const methodName = m as keyof ChatCommandInstance;
            if (m === 'constructor') return undefined;
            if (typeof instance[methodName] !== 'function') return undefined;
            return m;
        }).filter(m => m !== undefined) as (keyof ChatCommandInstance)[];

        ChatCommandRegistry.register(target, allOptions, methods);
    };
}

// Handler
const prefix = '!';
function getKeywords() {
    const commands = ChatCommandRegistry.getRegisteredCommands();
    return commands.map(command => {
        let keyword = command.options.keyword.toLowerCase();
        if (!command.options.ignorePrefix) keyword = prefix + keyword;
        return keyword;
    });
}

export function CommandHandler(data: ChannelChatMessageEventData): void {
    const message = data.message.text;
    const messageParts = message.split(' ');
    console.log(messageParts);

    // TODO: Implement command handler

}