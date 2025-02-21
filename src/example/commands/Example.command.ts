import { ChatCommand } from "../../decorators/ChatCommand.decorator";
import { BroadcasterData, ChannelOptions, Mess, MessageUser, OptionsProvider, Raw } from "../../decorators/ChatData.decorators";
import { ChatterUser, PartialTwitchUser } from "../../objects/TwitchUser.object";
import { ChannelOptionsProvider } from "../../providers/ChannelOptions.provider";
import { ChatCommandExecution, ChatCommandExecutionGuard, ChatCommandExecutionGuardAvaliableResults, ChatCommandPostExecution, ChatCommandPreExecution } from "../../types/ChatCommand.types";
import { ChannelOptionsExtend } from "../../../local";
import { TwitchChatMessage } from "../../objects/ChatMessage.object";


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

    async execution(
        @OptionsProvider() provider: ChannelOptionsProvider<ChannelOptionsExtend>,
        @ChannelOptions() options: ChannelOptionsExtend,
        @BroadcasterData() broadcasterData: PartialTwitchUser,
        @Mess() message: TwitchChatMessage
    ): Promise<void> {
        console.log('Execution logic');
        await message.reply(`Example command executed ${options.eXampleExecutionCounter} times.`);
        console.log(options);
        provider.setChannelOptions(broadcasterData.getId(), {
            ...options,
            eXampleExecutionCounter: options.eXampleExecutionCounter + 1
        })
    }

    async postExecution(): Promise<void> {
        console.log('Post-execution logic');
    }
}