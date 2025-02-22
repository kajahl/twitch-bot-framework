import { IChatMessage } from "../twitch/ChatMessage.types";
import { IBroadcasterUser, IChatterUser } from "../twitch/TwitchUser.types";

type ChannelChatMessageEventData = IChatterUser & IBroadcasterUser & IChatMessage;
export default ChannelChatMessageEventData;
