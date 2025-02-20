import Container from "typedi";
import { Cheer, IChatMessage, MessageFragment, MessageFramgentType, Reply } from "../types/twitch/ChatMessage.types";
import DINames from "../utils/DI.names";
import APIClient from "../clients/Api.client";
import ChannelChatMessageEventData from "../types/EventSub_Events/ChannelChatMessageEventData.types";
import TwitchUser from "./TwitchUser.object";

export class ChatMessage {
    constructor(protected readonly data: IChatMessage) {}

    getId(): string {
        return this.data.message_id;
    }

    getText(): string {
        return this.data.message.text;
    }

    getFragments(): MessageFragment[] {
        return this.data.message.fragments;
    }

    getTextFragments(): MessageFragment[] {
        return this.getFragments().filter(fragment => fragment.type === MessageFramgentType.Text);
    }

    getCheermoteFragments(): MessageFragment[] {
        return this.getFragments().filter(fragment => fragment.type === MessageFramgentType.Cheermote);
    }

    getEmoteFragments(): MessageFragment[] {
        return this.getFragments().filter(fragment => fragment.type === MessageFramgentType.Emote);
    }

    getMentionFragments(): MessageFragment[] {
        return this.getFragments().filter(fragment => fragment.type === MessageFramgentType.Mention);
    }

    getMessageType(): string {
        return this.data.message_type;
    }

    isCheer(): boolean {
        return this.data.cheer !== undefined;
    }

    getBits(): number {
        return this.data.cheer?.bits || 0;
    }

    getCheer(): Cheer | undefined {
        return this.data.cheer;
    }

    isReply(): boolean {
        return this.data.reply !== undefined;
    }

    getReply(): Reply | undefined {
        return this.data.reply;
    }

    getChannelPointsCustomRewardId(): string | undefined {
        return this.data.channel_points_custom_reward_id;
    }
}

export class TwitchChatMessage extends ChatMessage {
    private readonly api: APIClient = Container.get(DINames.APIClient);

    constructor(protected readonly data: ChannelChatMessageEventData) {
        super(data);
    }

    getSenderId(): string {
        return this.data.chatter_user_id;
    }

    getSender(): TwitchUser {
        return new TwitchUser(this.getSenderId());
    }

    getBroadcasterId(): string {
        return this.data.broadcaster_user_id;
    }

    getBroadcaster(): TwitchUser {
        return new TwitchUser(this.getBroadcasterId());
    }

    async reply(text: string): Promise<void> {
        await this.api.sendMessage(this.getBroadcasterId(), text, this.getId());
    }
}