import axios from "axios";
import { Logger, LoggerFactory } from "../utils/Logger";
import TwtichPermissionScope from "../enums/TwitchPermissionScope.enum";
import { Inject, Service } from "typedi";
import { ITwitchBotConfig } from "../decorators/TwitchBot.decorator";
import ConfigService from "./Config.service";
import DINames from "../utils/DI.names";
import TokenRepository from "../repositories/Token.repository";
import { AppToken, UsableAppToken, UsableToken, UsableUserToken, UsableUserTokenWithScopes, UserToken } from "../types/Token.repository.types";
import AccessTokenRequestBuilder from "../builders/auth/AccessToken.request.builder";

@Service(DINames.TokenService)
export class TokenService {
    private readonly clientSecret: string;
    private readonly clientId: string;
    private readonly logger: Logger;

    constructor(
        @Inject(DINames.ConfigService) readonly config: ConfigService,
        @Inject(DINames.TokenRepository) private readonly tokenRepository: TokenRepository,
        @Inject(DINames.LoggerFactory) private readonly loggerFactory: LoggerFactory
    ) {
        this.logger = loggerFactory.createLogger('TokenService');
        const options : ITwitchBotConfig = config.getConfig();
        this.clientId = options.clientId;
        this.clientSecret = options.clientSecret;
        this.logger.debug(`Initialized`);
    }

    private isExpired(timestamp: number, expiresIn: number): boolean {
        const now = Date.now();
        const expiresAt = timestamp + expiresIn * 1000;
        return now >= expiresAt;
    }

    private _appTokenRequest : Promise<any> | null = null;
    public async getAppToken() : Promise<UsableAppToken> {
        const token = await this.tokenRepository.getAppToken();
        // If token is saved and is not expired: Return token
        if (token !== null && !this.isExpired(token.savedAt, token.expires_in)) {
            this.logger.info(`Successfully retrieved app token from storage`);
            return {
                token: token.access_token,
                isApp: true
            };
        }

        // else: Generate new token
        this.logger.log(`AppToken is expired or not saved. Requesting new app access token...`);
        const accessTokenRequestConfig = new AccessTokenRequestBuilder()
            .setClientId(this.clientId)
            .setClientSecret(this.clientSecret)
            .forClient()
            .build();

        this._appTokenRequest = this._appTokenRequest ?? axios.request(accessTokenRequestConfig);
        const response = await this._appTokenRequest;
       
        if(response.status !== 200) throw new Error('Failed to get app token');
        
        this.logger.info(`Successfully retrieved app token from Twitch API: ${this.logger.censor(response.data.access_token)}`);
        const newToken: AppToken = {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
            savedAt: Date.now()
        };

        await this.tokenRepository.saveAppToken(newToken);
        this._appTokenRequest = null;

        return {
            token: newToken.access_token,
            isApp: true
        };
    }

    private _userAccessTokenRequests : { [userId: string]: Promise<any> } = {};
    private async _getUserToken(userId: string) : Promise<UserToken | null> {
        const token = await this.tokenRepository.getUserAccessToken(userId);

        // If token is saved and is not expired: Return token
        if (token !== null && !this.isExpired(token.savedAt, token.expires_in)) {
            this.logger.info(`Successfully retrieved access token for user id=${userId} from storage`);
            return token;
        }

        // else: Check if refresh token is saved
        this.logger.warn(`UserAccessToken for user=${userId} is expired or not saved. Checking if refresh token is saved...`);
        this.tokenRepository.removeUserAccessToken(userId);
        const refreshToken = await this.tokenRepository.getUserRefreshToken(userId);

        // If refresh token is not saved: Return null
        if (refreshToken === null) {
            this.logger.info(`No refresh token found for user (${userId})`);
            return null;
        }

        // else: Generate new token // Return existing request
        if(this._userAccessTokenRequests[userId] == undefined) {
            this.logger.info(`Found refresh token for user id=${userId}. Requesting new access token...`);
            const accessTokenRequestConfig = new AccessTokenRequestBuilder()
                .setClientId(this.clientId)
                .setClientSecret(this.clientSecret)
                .forUser(refreshToken)
                .build();
            this._userAccessTokenRequests[userId] = axios.request(accessTokenRequestConfig);
        } else {
            this.logger.debug(`Found existing request for user id=${userId}. Waiting for response...`);
        }
        const response = await this._userAccessTokenRequests[userId];

        // If response status is not 200: Remove refresh token and return null
        if(response.status !== 200) {
            this.logger.error(`Failed to get user id=${userId} token. Refresh token is invalid or user has revoked access.`);
            this.tokenRepository.removeUserRefreshToken(userId);
            return null;
        }

        // else: Save new token and return access token
        this.logger.info(`Successfully retrieved user id=${userId} token from Twitch API: ${this.logger.censor(response.data.access_token)}`);
        const newToken: UserToken = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expires_in: response.data.expires_in,
            scope: response.data.scope,
            savedAt: Date.now()
        };

        await this.tokenRepository.saveUserAccessToken(userId, newToken);
        delete this._userAccessTokenRequests[userId];

        return newToken;
    }

    public async getUserTokenObjectById(userId: string): Promise<UserToken | null> {
        const userToken = await this._getUserToken(userId);
        if(userToken === null) return null;
        return userToken
    }

    public async getUserTokenById(userId: string): Promise<UsableUserToken | null> {
        const userToken = await this._getUserToken(userId);
        if(userToken === null) return null;
        return {
            token: userToken.access_token,
            isApp: false,
            userId: userId
        }
    }

    public async getUserTokenWithScopesById(userId: string, scope: TwtichPermissionScope[] = []): Promise<UsableUserTokenWithScopes | null> {
        const userToken = await this._getUserToken(userId);
        if(userToken === null) return null;
        for(const s of scope) {
            if(!userToken.scope.includes(s)) return null;
        }
        return {
            token: userToken.access_token,
            isApp: false,
            userId: userId,
            scopes: userToken.scope as TwtichPermissionScope[]
        }
    }

    // public async getUserTokenByNickname(nickname: string): Promise<string | null> {
    //     const user = await UserCacheManager.getInstance().getByName(nickname);
    //     if(user === null) return null;
    //     return this.getUserTokenById(user.id);
    // }

    // public async getUserTokenWithScopesByNickname(nickname: string, scope: TwtichPermissionScope[]): Promise<string | null> {
    //     const user = await UserCacheManager.getInstance().getByName(nickname);
    //     if(user === null) return null;
    //     return this.getUserTokenWithScopesById(user.id, scope);
    // }
    
}