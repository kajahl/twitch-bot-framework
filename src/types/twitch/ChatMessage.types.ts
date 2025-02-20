import { IPrefixObject } from "../Utils.types";

export type IChatMessage = {
    message_id: string;
    message: Message;
    message_type: MessageType;
    cheer?: Cheer;
    reply?: Reply;
    channel_points_custom_reward_id?: string;
}

export type Message = {
    text: string;
    fragments: MessageFragment[];
};

export type MessageFragment = {
    type: MessageFramgentType;
    text: string;
    cheermote?: Cheermote;
    emote?: Emote;
    mention?: Mention;
};

export enum MessageFramgentType {
    Text = 'text',
    Cheermote = 'cheermote',
    Emote = 'emote',
    Mention = 'mention',
}

/**
 * Cheermote object
 * e.g.: Cheer100 -> { prefix: 'Cheer', bits: 100, tier: 1 }
 */
export type Cheermote = {
    prefix: string;
    bits: number;
    tier: number;
}

export type Emote = {
    id: string;
    emote_set_id: string;
    owner_id: string;
    format: string;
}

export type Mention = {
    user_id: string;
    user_login: string;
    user_name: string;   
}

export enum MessageType {
    ChannelPointsHighlighted = 'channel_points_highlighted',
    ChannelPointsSubOnly = 'channel_points_sub_only',
    UserIntro = 'user_intro',
    PowerUpsMessageEffect = 'power_ups_message_effect',
    PowerUpsGigantifiedEmote = 'power_ups_gigantified_emote',
}

export type Cheer = {
    bits: number;
}

export type Reply = {
    parent_message_id: string;
    parent_message_body: string;
    thread_message_id: string;
} & IPrefixObject<'parent', Mention> & IPrefixObject<'thread', Mention>; 