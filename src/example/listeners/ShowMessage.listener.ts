import { BroadcasterData, MessageData, MessageUser, Raw, SenderData } from "../../decorators/ChatData.decorators";
import { ChatListener } from "../../decorators/ChatListener.decorator";
import { ChatMessage } from "../../objects/ChatMessage.object";
import { ChatterUser, PartialTwitchUser } from "../../objects/TwitchUser.object";
import { ChatListenerExecution } from "../../types/ChatListener.types";
import ChannelChatMessageEventData from "../../types/EventSub_Events/ChannelChatMessageEventData.types";

@ChatListener({
    name: 'ShowMessage',
    transient: true
})
export default class ShowMessageListener implements ChatListenerExecution {
    async execution(
        @SenderData() sender: PartialTwitchUser,
        @BroadcasterData() broadcaster: PartialTwitchUser,
        @MessageData() message: ChatMessage,
        @MessageUser() chatter: ChatterUser 
    ): Promise<void> {
        console.log(chatter.getBadges());
        console.log(`#${broadcaster.getUsername()} | ${sender.getUsername()}: ${message.getText()}`);
    }
}