import { IPrefixObject } from "../Utils.types";

export type IPartialTwitchUser = {
    id: string;
    login: string;
    display_name: string;
}

export type IPrefixUser<Prefix extends string> = IPrefixObject<Prefix, IPartialTwitchUser>;

export type IChatterUser = IPrefixUser<'chatter_user'> & {
    color: string;
    badges: Badge[];
}

export type IBroadcasterUser = IPrefixUser<'broadcaster_user'>;

export type ITwitchUser = IPartialTwitchUser & {
    type: TwitchUserType;
    broadcaster_type: TwitchUserBroadcasterType;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    email: string;
};

export enum TwitchUserType {
    Admin = 'admin',
    GlobalMod = 'global_mod',
    Staff = 'staff',
    Normal = '',
}

export enum TwitchUserBroadcasterType {
    Affiliate = 'affiliate',
    Partner = 'partner',
    Normal = '',
}

export type Badge = {
    set_id: BadgeSetId;
    id: string;
    info: string;
};

export enum BadgeSetId {
    Moderator = 'moderator',
    Subscriber = 'subscriber',
    SubGifter = 'sub-gifter',
    // TODO: Implement more badge set IDs
}