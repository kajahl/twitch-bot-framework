/*

Dekorator do definiowania klas jako komendy czatu

Przykład użycia:

@ChatCommand({
    name: string;
    keyword: string;
    aliases?: string[];
    ignorePrefix?: boolean;
    ignoreCase?: boolean;
    transistent?: boolean;
})

*/

import { GeneralContainer, GeneralFactory, GeneralRegistry, GeneralRegistryEntry } from "../types/Decorator.storage.types";
import { ChatCommandDecoratorOptions, ChatCommandExecution, ChatCommandInstance } from "../types/ChatCommand.types";
import ChannelChatMessageEventData from "../types/EventSub_Events/ChannelChatMessageEventData.types";
import {Logger} from "../utils/Logger";

// Typy

// Funkcje

const logger = new Logger('ChatCommandDecorator');

export const chatCommandsContainer = GeneralContainer.getInstance<GeneralFactory, ChatCommandExecution>();
const chatCommandRegistry = GeneralRegistry.getInstance<ChatCommandInstance, ChatCommandDecoratorOptions>();

// Decorator
export function ChatCommand(options: ChatCommandDecoratorOptions): ClassDecorator {
    logger.log(`Registering command ${options.name}`);

    return function (target: any) {
        const allOptions: Required<ChatCommandDecoratorOptions> = {
            name: options.name,
            keyword: options.keyword,
            aliases: options.aliases ?? [],
            transistent: options.transistent ?? false,
            ignorePrefix: options.ignorePrefix ?? false,
            ignoreCase: options.ignoreCase ?? true
        };

        // Register the command in the container
        chatCommandsContainer.set({
            id: target,
            factory: () => new target(),
            transient: allOptions.transistent,
            enabled: false // Default disabled (enable by setting in TwitchBotFramework)
        });

        const instance = chatCommandsContainer.get(target) as ChatCommandInstance;

        // Check if the command implements the required methods
        if (typeof instance.execution !== 'function') {
            throw new Error(`Command ${options.name} does not implement the required method 'execution'`);
        }

        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).map(m => {
            const methodName = m as keyof ChatCommandInstance;
            if (m === 'constructor') return undefined;
            if (typeof instance[methodName] !== 'function') return undefined;
            return m;
        }).filter(m => m !== undefined) as (keyof ChatCommandInstance)[];

        chatCommandRegistry.register(target, allOptions, methods);
    };
}

// Handler
const prefix = '!';

// Keyword Command map
type Map = {
    keywords: string[];
    entry: GeneralRegistryEntry<ChatCommandInstance, ChatCommandDecoratorOptions>;
}[];

function getKeywordsCommandMap() : Map {
    const commands = chatCommandRegistry.getRegisteredEntries();
    const map = commands.map(entry => {
        return {
            keywords: getKeywords(entry),
            entry,
        }
    });
    return map;
}

// Keywords

function detectDuplicates(keywords: string[]): boolean {
    const uniqueKeywords = new Set(keywords);
    return keywords.length != uniqueKeywords.size;
}

// Keywords are static and can be cached at first run
const allKeywords : string[] = [];
export function getAllKeywords() {
    const commands = chatCommandRegistry.getRegisteredEntries();
    // If keywords are already cached, return them
    if(allKeywords.length != 0 && commands.length != 0) return allKeywords;
    // If not, cache them and return
    const keywords = commands.map(c => getKeywords(c)).flat();
    if(detectDuplicates(keywords)) throw new Error(`Keywords are duplicated between commands`);
    allKeywords.push(...keywords);
    return allKeywords;
}

function getKeywords(entry: GeneralRegistryEntry<ChatCommandInstance, ChatCommandDecoratorOptions>) {
    const keywords = [entry.options.keyword, ...entry.options.aliases].map(keyword => {
        if(entry.options.ignoreCase) keyword = keyword.toLowerCase();
        if(!entry.options.ignorePrefix) keyword = `${prefix}${keyword}`;
        return keyword;
    }); 
    if(detectDuplicates(keywords)) throw new Error(`Keywords are duplicated in command '${entry.options.name}'`);
    return keywords;
}

export async function CommandHandler(data: ChannelChatMessageEventData): Promise<void> {
    const keywords = getAllKeywords();

    const message = data.message.text;
    const messageParts = message.split(' ');
    
    const commandKeyword = messageParts[0];
    const commandKeywordLower = commandKeyword.toLowerCase();

    if(
        !keywords.includes(commandKeyword) &&
        !keywords.includes(commandKeywordLower)
    ) return;

    const map = getKeywordsCommandMap();
    const command = map.find(m => m.keywords.includes(commandKeyword) || m.keywords.includes(commandKeywordLower));
    if(!command) return;

    let instance: ChatCommandInstance;
    try {
        instance = chatCommandsContainer.get(command.entry.target, true) as ChatCommandInstance;
    } catch (error) {
        return;
    }
    const methods = command.entry.methods;

    try {
        if(methods.includes('guard')) {
            const guardResult = await instance.guard({ event: data });
            if(!guardResult.canAccess) {
                logger.log(`Guard failed for command ${command.entry.options.name} for user ${data.chatter_user_login} in channel ${data.broadcaster_user_login}`);
                // const chat = await Chat.byId(data.broadcaster_user_id);
                // chat.message.send(`@${data.chatter_user_login}, ${guardResult.message}`, data.message_id);
                return;
            }
        }
    
        if(methods.includes('preExecution')) {
            await instance.preExecution({ event: data });
        }
    
        await instance.execution({ event: data });
    
        if(methods.includes('postExecution')) {
            await instance.postExecution({ event: data });
        }
    } catch (error) {
        logger.error(`Error while executing command ${command.entry.options.name}: ${error}`);
    }
}