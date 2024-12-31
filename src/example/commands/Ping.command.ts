import Chat from '../../objects/Chat';
import { ChatCommand } from '../../storage/decorators/ChatCommand.decorator';
import { ChatCommandExecution, ChatCommandExecutionData, ChatCommandExecutionGuard } from '../../types/ChatCommand.types';

@ChatCommand({
    name: 'ping',
    keyword: 'PinG',
    aliases: ['P'],
    transistent: false,
})
export default class PingCommand implements ChatCommandExecutionGuard, ChatCommandExecution {
    private executionCounter: number = 0;

    guard(): { canAccess: true } {
        return { canAccess: true };
    }

    async execution(data: ChatCommandExecutionData): Promise<void> {
        const chat = await Chat.byId(data.event.broadcaster_user_id);
        chat.message.send(`Pong! (no. ${++this.executionCounter})`);
    }
}