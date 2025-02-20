import {ChatMessage, TwitchChatMessage} from "../objects/ChatMessage.object";
import TwitchUser from "../objects/TwitchUser.object";
import ChannelChatMessageEventData from "./EventSub_Events/ChannelChatMessageEventData.types";

export enum ChatDataType {
    RAW = 'RAW_DATA', // Raw event data

    SENDER = 'SENDER', // Sender of the message (data type: TwitchUser)
    BROADCASTER = 'BROADCASTER', // Broadcaster of the channel (data type: TwitchUser)

    MESSAGE_DATA = 'MESSAGE_DATA', // Message object (data type: ChatMessage)
    MESSAGE = 'MESSAGE', // Message content (data type: TwitchChatMessage)
}

export type ChatDataTypeMap = {
    [ChatDataType.RAW]: ChannelChatMessageEventData;
    [ChatDataType.SENDER]: TwitchUser; // Assuming chatter_user_id is a string
    [ChatDataType.BROADCASTER]: TwitchUser; // Assuming broadcaster_user_id is a string
    [ChatDataType.MESSAGE_DATA]: ChatMessage;
    [ChatDataType.MESSAGE]: TwitchChatMessage;
};