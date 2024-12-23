import { AppToken, TokenRepository, UserToken } from "../repository/Token.repository";
import dotenv from 'dotenv';
import DataStorage from "../runtime/Data.storage";
dotenv.config();

export default class InMemoryTokenRepository implements TokenRepository {
    private appAccessToken: AppToken | null = null;
    private userAccessTokens: Map<string, UserToken> = new Map();
    private userRefreshTokens: Map<string, string> = new Map();

    constructor() {
        const userId = DataStorage.getInstance().userId.get();
        if(userId === null) throw new Error('User id is not set');
        const userRefreshToken = process.env.USER_REFRESH_TOKEN;
        if(userRefreshToken === undefined) throw new Error('User refresh token is not set');
        this.userRefreshTokens.set(userId, userRefreshToken);
    }

    getAppToken(): Promise<AppToken | null> {
        return Promise.resolve(this.appAccessToken);
    }

    saveAppToken(token: AppToken): Promise<void> {
        this.appAccessToken = token;
        return Promise.resolve();
    }

    getUserAccessToken(userId: string): Promise<UserToken | null> {
        return Promise.resolve(this.userAccessTokens.get(userId) || null);
    }

    saveUserAccessToken(userId: string, token: UserToken): Promise<void> {
        this.userAccessTokens.set(userId, token);
        return Promise.resolve();
    }

    removeUserAccessToken(userId: string): Promise<void> {
        this.userAccessTokens.delete(userId);
        return Promise.resolve();
    }

    getUserRefreshToken(userId: string): Promise<string | null> {
        return Promise.resolve(this.userRefreshTokens.get(userId) || null);
    }

    removeUserRefreshToken(userId: string): Promise<void> {
        this.userRefreshTokens.delete(userId);
        return Promise.resolve();
    }
}