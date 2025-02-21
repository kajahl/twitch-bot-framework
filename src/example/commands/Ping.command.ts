import { ChatCommand } from "../../decorators/ChatCommand.decorator";
import { Message } from "../../decorators/ChatData.decorators";
import { TwitchChatMessage } from "../../objects/ChatMessage.object";
import { ChatCommandExecution } from '../../types/ChatCommand.types';

@ChatCommand({
    name: 'ping',
    keyword: 'ping',
    aliases: ['p'],
    transistent: false,
})
export default class PingCommand implements ChatCommandExecution {
    async execution(
        @Message() message: TwitchChatMessage,
    ): Promise<void> {
        message.reply(`Pong!`);
    }
}