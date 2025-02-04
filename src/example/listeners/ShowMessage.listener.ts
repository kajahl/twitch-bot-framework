import { ChatListener } from "../../decorators/ChatListener.decorator";
import { ChatCommandExecutionData } from "../../types/ChatCommand.types";
import { ChatListenerExecution } from "../../types/ChatListener.types";

@ChatListener({
    name: 'ShowMessage',
    transient: true
})
export default class ShowMessageListener implements ChatListenerExecution {
    async execution(data: ChatCommandExecutionData): Promise<void> {
        console.log(`#${data.event.broadcaster_user_login} | ${data.event.chatter_user_login}: ${data.event.message.text}`);
    }
}