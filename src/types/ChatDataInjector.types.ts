import {ChatMessage, TwitchChatMessage} from "../objects/ChatMessage.object";
import {ChatterUser, PartialTwitchUser, TwitchUser} from "../objects/TwitchUser.object";
import ChannelChatMessageEventData from "./EventSub_Events/ChannelChatMessageEventData.types";
import { Badge } from "./twitch/TwitchUser.types";

export enum ChatDataType {
    RAW = 'RAW_DATA', // Raw event data

    SENDER_DATA = 'SENDER_DATA', // Sender object (data type: PartialTwitchUser)
    SENDER = 'SENDER', // Sender of the message (data type: TwitchUser)
    MESSAGE_USER = 'MESSAGE_USER', // Badges of the sender (data type: ChatterUser)

    BROADCASTER_DATA = 'BROADCASTER_DATA', // Broadcaster object (data type: PartialTwitchUser)
    BROADCASTER = 'BROADCASTER', // Broadcaster of the channel (data type: TwitchUser)

    MESSAGE_DATA = 'MESSAGE_DATA', // Message object (data type: ChatMessage)
    MESSAGE = 'MESSAGE', // Message content (data type: TwitchChatMessage)
}

export type ChatDataTypeMap = {
    [ChatDataType.RAW]: ChannelChatMessageEventData;

    [ChatDataType.SENDER_DATA]: PartialTwitchUser;
    [ChatDataType.SENDER]: TwitchUser;
    [ChatDataType.MESSAGE_USER]: ChatterUser;

    [ChatDataType.BROADCASTER_DATA]: PartialTwitchUser;
    [ChatDataType.BROADCASTER]: TwitchUser;

    [ChatDataType.MESSAGE_DATA]: ChatMessage;
    [ChatDataType.MESSAGE]: TwitchChatMessage;
};