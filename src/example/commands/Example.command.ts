import { ChatCommand } from "../../decorators/ChatCommand.decorator";
import { MessageUser, Raw } from "../../decorators/ChatData.decorators";
import { ChatterUser } from "../../objects/TwitchUser.object";
import { ChatCommandExecution, ChatCommandExecutionGuard, ChatCommandExecutionGuardAvaliableResults, ChatCommandPostExecution, ChatCommandPreExecution } from "../../types/ChatCommand.types";
import ChannelChatMessageEventData from "../../types/EventSub_Events/ChannelChatMessageEventData.types";

@ChatCommand({ 
    name: 'example',
    keyword: 'eXample',
    ignoreCase: false
})
export default class ExampleCommand implements ChatCommandExecutionGuard, ChatCommandPreExecution, ChatCommandExecution, ChatCommandPostExecution {
    async guard(@MessageUser() user: ChatterUser): Promise<ChatCommandExecutionGuardAvaliableResults> {
        if(user.isBroadcaster() || user.isModerator() || user.isVIP()) return { canAccess: true };
        return { canAccess: false, message: "You must be a broadcaster, moderator or VIP to use this command." };
    }

    async preExecution(): Promise<void> {
        console.log('Pre-execution logic');
    }

    async execution(): Promise<void> {
        console.log('Execution logic');
    }

    async postExecution(): Promise<void> {
        console.log('Post-execution logic');
    }
}