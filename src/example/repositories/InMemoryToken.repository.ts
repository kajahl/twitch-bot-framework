import { AppToken, ITokenRepository, UserToken } from "../../types/Token.repository.types";
import dotenv from 'dotenv';
dotenv.config();

export default class InMemoryTokenRepository implements ITokenRepository {
    private appAccessToken: AppToken | null = null;
    private userAccessTokens: Map<string, UserToken> = new Map();
    private userRefreshTokens: Map<string, string> = new Map();

    constructor() {
        const userId = process.env.USER_ID;
        const userRefreshToken = process.env.USER_REFRESH_TOKEN;
        if(!userId || !userRefreshToken) throw new Error('USER_ID and USER_REFRESH_TOKEN environment variables must be set if using InMemoryTokenRepository');
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