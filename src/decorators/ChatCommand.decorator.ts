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

// Decorator
import ChatCommandsService from "../services/ChatCommands.service";
import { ChatCommandDecoratorOptions } from '../types/ChatCommand.types';

// Decorator
export function ChatCommand(options: ChatCommandDecoratorOptions): ClassDecorator {
    return function (target: any) {
        const allOptions: Required<ChatCommandDecoratorOptions> = {
            name: options.name,
            keyword: options.keyword,
            aliases: options.aliases ?? [],
            transistent: options.transistent ?? false,
            ignoreCase: options.ignoreCase ?? true
        };

        ChatCommandsService.registerCommand(target, allOptions);
    };
}