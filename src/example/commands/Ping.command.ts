import Container from "typedi";
import { ChatCommand } from "../../decorators/ChatCommand.decorator";
import { ChatCommandExecution, ChatCommandExecutionData, ChatCommandExecutionGuard } from '../../types/ChatCommand.types';
import DINames from "../../utils/DI.names";
import APIClient from "../../clients/Api.client";

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

        console.log(await API.getUserByLogin('habot_twitch'));

        API.sendMessage(event.broadcaster_user_id, `Pong!`, event.message_id);
    }
}