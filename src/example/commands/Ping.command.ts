import Container from "typedi";
import { ChatCommand } from "../../decorators/ChatCommand.decorator";
import { ChatCommandExecution, ChatCommandExecutionData, ChatCommandExecutionGuard } from '../../types/ChatCommand.types';
import DINames from "../../utils/DI.names";
import APIClient from "../../clients/Api.client";
import { Broadcaster, Message, MessageData, Sender } from "../../decorators/ChatData.decorators";
import TwitchUser from "../../objects/TwitchUser.object";
import {ChatMessage, TwitchChatMessage} from "../../objects/ChatMessage.object";

@ChatCommand({
    name: 'ping',
    keyword: 'PinG',
    aliases: ['P'],
    transistent: false,
})
export default class PingCommand implements ChatCommandExecutionGuard, ChatCommandExecution {
    guard(): { canAccess: true } {
        return { canAccess: true };
    }

    async execution(
        _:any, 
        @Sender() sender: TwitchUser, 
        @Message() message: TwitchChatMessage,
        @Broadcaster() channel: TwitchUser,
        @MessageData() messageData: ChatMessage,
    ): Promise<void> {
        // const API = Container.get(DINames.APIClient) as APIClient;
        // const { event } = data;

        // console.log(await API.getUserByLogin('habot_twitch'));
        // const TwitchUserCache = Container.get(DINames.TwitchUserCache) as TwitchUserCache;
        // console.log(await TwitchUserCache.get('1128565145').then(u => u.login ? u.login : 'not found'));
        // console.log(await TwitchUserCache.get('474118438').then(u => u.login ? u.login : 'not found'));
        // console.log(await TwitchUserCache.get('87576158').then(u => u.login ? u.login : 'not found'));
        // console.log(await TwitchUserCache.get('474118438').then(u => u.login ? u.login : 'not found'));

        // API.sendMessage(event.broadcaster_user_id, `Pong!`, event.message_id);
        // console.log('Pong!', channel, sender);
        // API.sendMessage(channel.getId(), `Pong! ${sender}`, _.message_id);
        message.reply(`Pong!`);
    }
}