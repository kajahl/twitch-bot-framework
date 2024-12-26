import { AxiosRequestConfig } from "axios";
import TemplateBuilder from "../Template.builder";

export default class DeleteChatMessageRequestConfigBuilder extends TemplateBuilder<{}>{
    correctResponseCodes: number[] = [204];
    errorResponseCodes: number[] = [400, 401, 403, 404];

    private broadcaster_id: string | null = null;
    private moderator_id: string | null = null;
    private message_id: string | null = null;

    constructor() {
        super('DELETE', 'https://api.twitch.tv/helix/moderation/chat');
    }

    public setBroadcasterId(broadcasterId: string): DeleteChatMessageRequestConfigBuilder {
        this.broadcaster_id = broadcasterId;
        return this;
    }

    public setModeratorId(moderatorId: string | null): DeleteChatMessageRequestConfigBuilder {
        this.moderator_id = moderatorId;
        return this;
    }

    /**
     * (Optional) The ID of the message to delete. If message_id is not specified, all messages from the specified chat are deleted.
     * @param messageId Message ID
     * @returns DeleteChatMessageRequestConfigBuilder
     */
    public setMessageId(messageId: string | null): DeleteChatMessageRequestConfigBuilder {
        this.message_id = messageId;
        return this;
    }

    public build(): AxiosRequestConfig {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        if(this.config.headers.Authorization == null) throw new Error('Access token is required');
        if(this.config.headers["Client-Id"] == null) throw new Error('Client ID is required');
        if(this.broadcaster_id == null) throw new Error('Broadcaster ID is required');
        if(this.moderator_id == null) throw new Error('Moderator ID is required');
        const queryParams = [
            `broadcaster_id=${this.broadcaster_id}`,
            `moderator_id=${this.moderator_id}`
        ];
        if (this.message_id != null) queryParams.push(`message_id=${this.message_id}`);
        this.config.url += `?${queryParams.join('&')}`;
        return this.config;
    }
}