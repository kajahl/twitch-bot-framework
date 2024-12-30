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
        console.log(`Pong! (no. ${++this.executionCounter})`);
    }
}