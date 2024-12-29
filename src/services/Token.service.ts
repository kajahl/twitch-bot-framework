import axios from "axios";
import AccessTokenRequestConfigBuilder from "../builders/tokens/AccessTokenRequestConfig.builder";
import { AppToken, TokenRepository, UserToken } from "../storage/repository/Token.repository";
import DataStorage from "../storage/runtime/Data.storage";
import Logger from "../utils/Logger";
import TwtichPermissionScope from "../enums/TwitchPermissionScope.enum";
import UserCacheManager from "../cache/managers/UserCache.manager";

const logger = new Logger('TokenService');

export class TokenService {
    private static instance: TokenService;
    public static init(tokenRepository: TokenRepository): TokenService {
        TokenService.instance = new TokenService(tokenRepository);
        return TokenService.instance;
    }
    public static getInstance(): TokenService {
        return TokenService.instance;
    }

    private constructor(
        private tokenRepository: TokenRepository
    ) {}

    private isExpired(timestamp: number, expiresIn: number): boolean {
        const now = Date.now();
        const expiresAt = timestamp + expiresIn * 1000;
        return now >= expiresAt;
    }

    private _appTokenRequest : Promise<any> | null = null;
    public async getAppToken() : Promise<string> {
        const token = await this.tokenRepository.getAppToken();
        // If token is saved and is not expired: Return token
        if (token !== null && !this.isExpired(token.savedAt, token.expires_in)) {
            logger.log(`Successfully retrieved app token from storage`);
            return token.access_token;
        }

        // else: Generate new token
        logger.log(`AppToken is expired or not saved. Requesting new app access token...`);
        const data = DataStorage.getInstance();
        const accessTokenRequestConfig = new AccessTokenRequestConfigBuilder()
            .setClientId(data.clientId.get() as string)
            .setClientSecret(data.clientSecret.get() as string)
            .forClient()
            .build();

        this._appTokenRequest = this._appTokenRequest ?? axios.request(accessTokenRequestConfig);
        const response = await this._appTokenRequest;
       
        if(response.status !== 200) throw new Error('Failed to get app token');
        
        logger.log(`Successfully retrieved app token from Twitch API: ${response.data.access_token}`);
        const newToken: AppToken = {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
            savedAt: Date.now()
        };

        await this.tokenRepository.saveAppToken(newToken);
        this._appTokenRequest = null;

        return newToken.access_token;
    }

    private _userAccessTokenRequests : { [userId: string]: Promise<any> } = {};
    private async _getUserToken(userId: string) : Promise<UserToken | null> {
        const token = await this.tokenRepository.getUserAccessToken(userId);

        // If token is saved and is not expired: Return token
        if (token !== null && !this.isExpired(token.savedAt, token.expires_in)) {
            logger.log(`Successfully retrieved access token for user id=${userId} from storage`);
            return token;
        }

        // else: Check if refresh token is saved
        logger.log(`UserAccessToken for user=${userId} is expired or not saved. Checking if refresh token is saved...`);
        this.tokenRepository.removeUserAccessToken(userId);
        const refreshToken = await this.tokenRepository.getUserRefreshToken(userId);

        // If refresh token is not saved: Return null
        if (refreshToken === null) {
            logger.log(`No refresh token found for user (${userId})`);
            return null;
        }

        // else: Generate new token
        logger.log(`Found refresh token for user id=${userId}. Requesting new access token...`);
        const data = DataStorage.getInstance();
        const accessTokenRequestConfig = new AccessTokenRequestConfigBuilder()
            .setClientId(data.clientId.get() as string)
            .setClientSecret(data.clientSecret.get() as string)
            .forUser(refreshToken)
            .build();

        this._userAccessTokenRequests[userId] = this._userAccessTokenRequests[userId] ?? axios.request(accessTokenRequestConfig);
        const response = await this._userAccessTokenRequests[userId];

        // If response status is not 200: Remove refresh token and return null
        if(response.status !== 200) {
            logger.error(`Failed to get user id=${userId} token. Refresh token is invalid or user has revoked access.`);
            this.tokenRepository.removeUserRefreshToken(userId);
            return null;
        }

        // else: Save new token and return access token
        logger.log(`Successfully retrieved user id=${userId} token from Twitch API: ${response.data.access_token}`);
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

    public async getUserTokenById(userId: string): Promise<string | null> {
        const userToken = await this._getUserToken(userId);
        if(userToken === null) return null;
        return userToken.access_token
    }

    public async getUserTokenWithScopesById(userId: string, scope: TwtichPermissionScope[]): Promise<string | null> {
        const userToken = await this._getUserToken(userId);
        if(userToken === null) return null;
        for(const s of scope) {
            if(!userToken.scope.includes(s)) return null;
        }
        return userToken.access_token
    }

    public async getUserTokenByNickname(nickname: string): Promise<string | null> {
        const user = await UserCacheManager.getInstance().getByName(nickname);
        if(user === null) return null;
        return this.getUserTokenById(user.id);
    }

    public async getUserTokenWithScopesByNickname(nickname: string, scope: TwtichPermissionScope[]): Promise<string | null> {
        const user = await UserCacheManager.getInstance().getByName(nickname);
        if(user === null) return null;
        return this.getUserTokenWithScopesById(user.id, scope);
    }
    
}