import { TokenRepositoryProvider } from "../decorators/TwitchBot.decorator";
import { AppToken, ITokenRepository, UserToken } from "../types/Token.repository.types";

export default class TokenRepository implements ITokenRepository {
    private tokenRepository: ITokenRepository;
    constructor(
        userDefinedTokenRepository: TokenRepositoryProvider
    ) {
        this.tokenRepository = new userDefinedTokenRepository();
    }

    // App / Client
    getAppToken(): Promise<AppToken | null> {
        return this.tokenRepository.getAppToken();
    }

    saveAppToken(token: AppToken): Promise<void> {
        return this.tokenRepository.saveAppToken(token);
    }

    // User - Access
    getUserAccessToken(userId: string): Promise<UserToken | null> {
        return this.tokenRepository.getUserAccessToken(userId);
    }

    saveUserAccessToken(userId: string, token: UserToken): Promise<void> {
        return this.tokenRepository.saveUserAccessToken(userId, token);
    }

    removeUserAccessToken(userId: string): Promise<void> {
        return this.tokenRepository.removeUserAccessToken(userId);
    }

    // User - Refresh
    getUserRefreshToken(userId: string): Promise<string | null> {
        return this.tokenRepository.getUserRefreshToken(userId);
    }
    
    removeUserRefreshToken(userId: string): Promise<void> {
        return this.tokenRepository.removeUserRefreshToken(userId);
    }
}