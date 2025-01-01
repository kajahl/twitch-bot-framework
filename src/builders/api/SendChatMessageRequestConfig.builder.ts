import { AxiosRequestConfig } from "axios";
import TemplateBuilder from "../Template.builder";

export default class SendChatMessageRequestConfigBuilder extends TemplateBuilder<SendChatMessageResponse> {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 403, 422];

    constructor(useAppToken: boolean = false) {
        super('POST', 'https://api.twitch.tv/helix/chat/messages', {
            broadcaster_id: null,
            sender_id: null,
            message: null,
            reply_parent_message_id: null,
        }, () => useAppToken ? 'app' : this.config.data.sender_id as string);
    }

    // TODO: ClientID i BroadcasterID na podstawie nicków, a nie ID - ale:
    // 1. Wymaga to pobierania z cache mapy nick <-> id i/lub
    // 2. Wymaga to dodatkowego zapytania do API Twitcha (w przypadku braku danych w cache)
    public setBroadcasterId(broadcasterId: string): SendChatMessageRequestConfigBuilder {
        this.config.data.broadcaster_id = broadcasterId;
        return this;
    }

    public setSenderId(senderId: string): SendChatMessageRequestConfigBuilder {
        this.config.data.sender_id = senderId;
        return this;
    }

    public setMessage(message: string): SendChatMessageRequestConfigBuilder {
        this.config.data.message = message;
        return this;
    }

    public setReplyToMessageId(messageId: string | null): SendChatMessageRequestConfigBuilder {
        this.config.data.reply_parent_message_id = messageId;
        return this;
    }

    public build(): AxiosRequestConfig {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        if(this.config.headers.Authorization == null) throw new Error('Access token is required');
        if(this.config.headers["Client-Id"] == null) throw new Error('Client ID is required');
        if(this.config.data.broadcaster_id == null) throw new Error('Broadcaster ID is required');
        if(this.config.data.sender_id == null) throw new Error('Sender ID is required');
        if(this.config.data.message == null) throw new Error('Message is required');
        return this.config;
    }
}

export type SendChatMessageResponse = {
    data: {
        message_id: string;
        is_sent: boolean;
        drop_reason: {
            code: number;
            message: string;
        } | undefined;
    }[]
}