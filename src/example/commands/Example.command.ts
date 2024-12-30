import { ChatCommand } from "../../storage/decorators/ChatCommand.decorator";
import { ChatCommandExecution, ChatCommandExecutionData, ChatCommandExecutionGuard, ChatCommandExecutionGuardAvaliableResults, ChatCommandPostExecution, ChatCommandPreExecution } from "../../types/ChatCommand.types";

@ChatCommand({ 
    name: 'example',
    keyword: 'eXample',
    ignoreCase: false
})
export default class ExampleCommand implements ChatCommandExecutionGuard, ChatCommandPreExecution, ChatCommandExecution, ChatCommandPostExecution {
    async guard(data: ChatCommandExecutionData): Promise<ChatCommandExecutionGuardAvaliableResults> {
        if(data.event.badges.some(predicate => predicate.set_id === 'moderator')) return { canAccess: true };
        return { canAccess: false, message: "You are not a moderator" };
    }

    async preExecution(data: ChatCommandExecutionData): Promise<void> {
        console.log('Pre-execution logic');
    }

    async execution(data: ChatCommandExecutionData): Promise<void> {
        console.log('Execution logic');
    }

    async postExecution(data: ChatCommandExecutionData): Promise<void> {
        console.log('Post-execution logic');
    }
}