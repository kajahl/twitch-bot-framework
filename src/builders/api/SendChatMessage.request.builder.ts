import BaseRequestBuilder from "./Base.request.builder";

// Typy

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

// Builder

export default class SendChatMessageRequestConfigBuilder extends BaseRequestBuilder {
    correctResponseCodes: number[] = [200];
    errorResponseCodes: number[] = [400, 403, 422];

    constructor() {
        super('POST', 'https://api.twitch.tv/helix/chat/messages', {}, {
            broadcaster_id: null,
            sender_id: null,
            message: null,
            reply_parent_message_id: null,
        }, null, 'sender_id');
    }

    public setBroadcasterId(broadcasterId: string): this {
        this.config.data.broadcaster_id = broadcasterId;
        return this;
    }

    public setSenderId(senderId: string): this {
        this.config.data.sender_id = senderId;
        return this;
    }

    public setMessage(message: string): this {
        this.config.data.message = message;
        return this;
    }

    public setReplyToMessageId(messageId: string | null): this {
        this.config.data.reply_parent_message_id = messageId;
        return this;
    }

    public checkTypes(): boolean {
        if(this.config.data.broadcaster_id == null) throw new Error('Broadcaster ID is required');
        if(this.config.data.sender_id == null) throw new Error('Sender ID is required');
        if(this.config.data.message == null) throw new Error('Message is required');
        return true;
    }
}