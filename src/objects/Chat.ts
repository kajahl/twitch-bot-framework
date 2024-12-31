import axios from "axios";
import SendChatMessageRequestConfigBuilder, { SendChatMessageResponse } from "../builders/api/SendChatMessageRequestConfig.builder";
import UserCacheManager, { TwitchUser } from "../cache/managers/UserCache.manager";
import DataStorage from "../storage/runtime/Data.storage";
import { TokenService } from "../services/Token.service";
import DeleteChatMessageRequestConfigBuilder, { DeleteChatMessageResponse } from "../builders/api/DeleteChatMessageRequestConfig.builder";

export default class Chat {
    /**
     * Static method to create Chat object by User ID
     * @param broadcasterUserId Broadcaster User ID (Chat owner)
     * @param userId User ID (Chat participant) - Default: Bot User ID
     * @returns Chat object
     * @throws Error if User not found by ID
     */
    static async byId(broadcasterUserId: string, userId: string = DataStorage.getInstance().userId.get() as string) {
        const broadcasterUser = await UserCacheManager.getInstance().getById(broadcasterUserId);
        if(broadcasterUser === null) throw new Error(`Chat not found for User with id=${broadcasterUserId}`);
        const user = await UserCacheManager.getInstance().getById(userId);
        if(user === null) throw new Error(`Chat not found for User with id=${userId}`);
        return new Chat(broadcasterUser.id, user.id);
    }

    /**
     * Static method to create Chat object by User Login
     * @param broadcasterLogin User Login (Chat owner)
     * @param userId User ID (Chat participant) - Default: Bot User ID
     * @returns Chat object
     * @throws Error if User not found by Login
     */
    static async byLogin(broadcasterLogin: string, userId: string = DataStorage.getInstance().userId.get() as string) {
        const broadcasterUserId = await UserCacheManager.getInstance().findIdByUsername(broadcasterLogin);
        if(broadcasterUserId === null) throw new Error(`Chat not found for User with login=${broadcasterLogin}`);
        return Chat.byId(broadcasterUserId, userId);
    }

    private constructor(
        private broadcasterUserId: string,
        private userId: string
    ) {}
    
    /**
     * Send, reply and delete chat messages
     */
    get message() {
        return {
            /**
             * Send chat message
             * @param message Message content
             * @param replyToMessageId Message ID to reply to
             * @returns SendChatMessageResponse
             */
            send: async (message: string, replyToMessageId: string | null = null): Promise<SendChatMessageResponse> => {
                // Tokeny:
                // - UserAccessToken + (user:write:chat) [Chatting user]
                // - AppAccessToken + (user:bot) [Chatting user / Not broadcaster or moderator]
                // - AppAccessToken + (channel:bot) [Broadcaster or moderator]
                // TEMP: Używamy UserAccessToken
                const token = await TokenService.getInstance().getUserTokenById(this.userId);
                if(!token) throw new Error(`Failed to get user token for user id=${this.userId}`);
                const data = await new SendChatMessageRequestConfigBuilder()
                    .setClientId(DataStorage.getInstance().clientId.get() as string)
                    .setAccessToken(token)
                    .setBroadcasterId(this.broadcasterUserId)
                    .setSenderId(this.userId)
                    .setMessage(message)
                    .setReplyToMessageId(replyToMessageId)
                    .make();
                return data;
            },
            /**
             * Delete chat message
             * @param messageId Message ID
             * @returns DeleteChatMessageResponse
             */
            delete: async (messageId: string | null = null): Promise<DeleteChatMessageResponse> => {
                const token = await TokenService.getInstance().getUserTokenById(this.userId);
                if(!token) throw new Error(`Failed to get user token for user id=${this.userId}`);
                const data = new DeleteChatMessageRequestConfigBuilder()
                    .setAccessToken(token)
                    .setBroadcasterId(this.broadcasterUserId)
                    .setModeratorId(this.userId)
                    .setMessageId(messageId)
                    .make();
                return data;
            }
        }
    }

    // get vip() {
    //     return {
    //         add: async () => {},
    //         list: async () => {},
    //         remove: async () => {}
    //     }
    // }

    // get moderator() {
    //     return {
    //         add: async () => {},
    //         list: async () => {},
    //         remove: async () => {}
    //     }
    // }

    // get poll() {
    //     return {
    //         get: async () => {},
    //         create: async () => {},
    //         end: async () => {}
    //     }
    // }

    // get ban() {
    //     return {
    //         add: async () => {},
    //         list: async () => {},
    //         remove: async () => {}
    //     }
    // }
}