type ChannelChatMessageEventData = {
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    chatter_user_id: string;
    chatter_user_login: string;
    chatter_user_name: string;
    message_id: string;
    message: Message;
    color: string;
    badges: Badge[];
    message_type: string;
    cheer: any;
    reply: any;
    channel_points_custom_reward_id: any;
    channel_points_animation_id: any;
};
export default ChannelChatMessageEventData;

export type Message = {
    text: string;
    fragments: MessageFragment[];
};

export type MessageFragment = {
    type: string;
    text: string;
    cheermote: any;
    emote: any;
    mention: any;
};

export type Badge = {
    set_id: string;
    id: string;
    info: string;
};

export enum BadgeSetId {
    Moderator = 'moderator',
    Subscriber = 'subscriber',
    SubGifter = 'sub-gifter',
    // TODO: Implement more badge set IDs
}