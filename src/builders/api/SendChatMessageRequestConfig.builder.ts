import { AxiosRequestConfig } from "axios";

export default class SendChatMessageRequestConfigBuilder {
    private config: AxiosRequestConfig = {
        url: 'https://api.twitch.tv/helix/chat/messages',
        method: 'POST',
        headers: {
            Authorization: null,
            "Client-Id": null,
            "Content-Type": "application/json"
        },
        data: {
            broadcaster_id: null,
            sender_id: null,
            message: null
        }
    }

    constructor() {}

    public setAccessToken(accessToken: string): SendChatMessageRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
    }

    public setClientId(clientId: string): SendChatMessageRequestConfigBuilder {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers["Client-Id"] = clientId;
        return this;
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