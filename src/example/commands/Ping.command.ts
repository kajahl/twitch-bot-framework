import Container from "typedi";
import { ChatCommand } from "../../decorators/ChatCommand.decorator";
import { ChatCommandExecution, ChatCommandExecutionData, ChatCommandExecutionGuard } from '../../types/ChatCommand.types';
import DINames from "../../utils/DI.names";
import APIClient from "../../clients/Api.client";
import TwitchUserCache from "../../cache/TwitchUser.cache";

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

    async execution(data: ChatCommandExecutionData): Promise<void> {
        const API = Container.get(DINames.APIClient) as APIClient;
        const { event } = data;

        // console.log(await API.getUserByLogin('habot_twitch'));
        const TwitchUserCache = Container.get(DINames.TwitchUserCache) as TwitchUserCache;
        console.log(await TwitchUserCache.get('1128565145').then(u => u.login ? u.login : 'not found'));
        console.log(await TwitchUserCache.get('474118438').then(u => u.login ? u.login : 'not found'));
        console.log(await TwitchUserCache.get('87576158').then(u => u.login ? u.login : 'not found'));
        console.log(await TwitchUserCache.get('474118438').then(u => u.login ? u.login : 'not found'));

        API.sendMessage(event.broadcaster_user_id, `Pong!`, event.message_id);
    }
}