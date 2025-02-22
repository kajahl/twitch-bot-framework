import { TokenService } from '../services/Token.service';
import { Inject, Service } from 'typedi';
import DINames from '../utils/DI.names';
import ConfigService from '../services/Config.service';
import { Logger, LoggerFactory } from '../utils/Logger';
import GetUsersRequestBuilder, { GetUsersResponse } from '../builders/api/GetUsers.request.builder';
import MakeRequest from '../builders/Make.request';
import SendChatMessageRequestConfigBuilder, { SendChatMessageResponse } from '../builders/api/SendChatMessage.request.builder';
import FulfillRequest from '../builders/Fulfill.request';
import { UsableAppToken, UsableUserToken } from '../types/Token.repository.types';

/*

APIClient służy TYLKO do wywołań z tokenem userId (czyli użytkownika bota) lub tokenem aplikacji (czyli klienta).

*/

export default class APIClient {
    private clientId: string;
    private userId: string;
    private readonly logger: Logger;

    constructor(
        @Inject(DINames.ConfigService) readonly config: ConfigService,
        @Inject(DINames.TokenService) private readonly tokenService: TokenService,
        @Inject(DINames.LoggerFactory) readonly loggerFactory: LoggerFactory
    ) {
        this.logger = loggerFactory.createLogger('APIClient');
        const options = config.getConfig();
        this.clientId = options.clientId;
        this.userId = options.userId;
        this.logger.debug('Initialized');
    }

    private async getAppAccessToken(): Promise<UsableAppToken> {
        this.logger.debug('Getting app access token');
        return await this.tokenService.getAppToken();
    }

    private async getUserAccessToken(): Promise<UsableUserToken> {
        this.logger.debug('Getting user access token');
        const token = await this.tokenService.getUserTokenById(this.userId);
        if (token == null) {
            throw new Error('BotUser access token not found. Check your configuration (If TokenRepository has access to BotUser refresh token).');
        }
        return token;
    }

    // **************************************
    // *                                    *
    // *     DIRECT TWITCH API CALLS        *
    // *                                    *
    // **************************************

    async getUsers(params: { ids?: string[]; logins?: string[] }): Promise<GetUsersResponse['data']> {
        // const token = await this.getAppAccessToken();
        const request = new GetUsersRequestBuilder()
            .addLogins(params.logins || [])
            .addUserIds(params.ids || [])
            // .setClientId(this.clientId)
            // .setAccessToken(token);
        const fulfilledRequest = await FulfillRequest(request);
        const response = await MakeRequest<GetUsersResponse>(fulfilledRequest);
        return response.data;
    }

    /**
     * Sends a message to the chat
     * @param channelId Channel ID to send the message to
     * @param message Message to send
     * @param replyToMessageId ID of the message to reply to (optional)
     */
    async sendMessage(channelId: string, message: string, replyToMessageId?: string): Promise<void> {
        // App access token can be used when: 
        // - The broadcaster (channelId) must have authorized the app with the channel:bot scope or the sender must be a moderator in the broadcaster's channel.
        //      (1. Auth APP with channel:bot scope) // (2. BotUser must be a moderator in the broadcaster's channel)
        // TODO: Cache mod + token info // + TryCatch: If request with app token fails, delete cache data and try again with user token
        // For now: Use user token
        const token = await this.getUserAccessToken();
        const requestConfig = new SendChatMessageRequestConfigBuilder()
            .setClientId(this.clientId)
            .setAccessToken(token)
            .setSenderId(this.userId)
            .setBroadcasterId(channelId)
            .setMessage(message);
        if (replyToMessageId) requestConfig.setReplyToMessageId(replyToMessageId);
        await MakeRequest<SendChatMessageResponse>(requestConfig);
        return;
    }

    // **************************************
    // *                                    *
    // *            API CLIENT              *
    // *                                    *
    // **************************************

    /**
     * Get user by id
     * @param id User ID
     * @returns User data
     * @throws Error if user not found or multiple users found
     */
    async getUserById(id: string): Promise<GetUsersResponse['data'][0]> {
        const data = await this.getUsers({ ids: [id] });
        if (data.length === 0) throw new Error(`User not found by id=${id}`);
        if (data.length > 1) throw new Error(`Multiple users found by id=${id}`);
        return data[0];
    }

    async getUserByLogin(login: string): Promise<GetUsersResponse['data'][0]> {
        const data = await this.getUsers({ logins: [login] });
        if (data.length === 0) throw new Error(`User not found by id=${login}`);
        if (data.length > 1) throw new Error(`Multiple users found by id=${login}`);
        return data[0];
    }
}