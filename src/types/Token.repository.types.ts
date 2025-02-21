/*
TokenRepository is responsible for obtaining and saving access tokens for applications and users during the application's operation. 

Przy inicjalizacji frameworka dostaje dane: clientId, clientSecret

Zarządznie tokenami aplikacji:
1) Pobieranie tokenu aplikacji - może zwrócić objekt AppToken, może zwrócić null
2) Zapisywanie tokenu aplikacji - zapisuje token aplikacji w repozytorium
w przypadku zwrócenia null przez (1) TokenService wygeneruje nowy AppToken i zapisze go w repozytorium (2)
w przypadku zwrócenia AppToken przez (1) TokenService sprawdzi czy token nie wygasł, jeśli tak to wygeneruje nowy token i zapisze go w repozytorium (2)

Zarządzanie tokenami użytkowników:
1) Pobieranie tokenu użytkownika - może zwrócić objekt UserToken, może zwrócić null
2) Zapisywanie tokenu użytkownika - zapisuje token użytkownika w repozytorium
3) Pobieranie refreshToken użytkownika - może zwrócić string, może zwrócić null
- w przypadku zwrócenia null przez (1) TokenService spróbuje pozyskać refresh token przez (3) oraz zapisać go w repozytorium (2)
- w przypadku zwrócenia UserToken przez (1) TokenService sprawdzi czy token nie wygasł, jeśli tak to spróbuje odświeżyć token za pomocą refreshToken i zapisze go w repozytorium (2)
- istnieje również możliwość, że refreshToken / accessToken mimo tego że nie wygasł, to użytkownik de-autoryzował aplikacje - wtedy należy usunąć accessToken jeżeli istnieje oraz refreshToken z repozytorium, aby nie próbować odświeżać tokenu
*/

import TwtichPermissionScope from "../enums/TwitchPermissionScope.enum";

export interface ITokenRepository {
    // App / Client
    getAppToken(): Promise<AppToken | null>;
    saveAppToken(token: AppToken): Promise<void>;
    // User - Access
    getUserAccessToken(userId: string): Promise<UserToken | null>;
    saveUserAccessToken(userId: string, token: UserToken): Promise<void>;
    removeUserAccessToken(userId: string): Promise<void>;
    // User - Refresh
    getUserRefreshToken(userId: string): Promise<string | null>;
    removeUserRefreshToken(userId: string): Promise<void>;
};

type TokenSaveTimestamp = {
    savedAt: number;
}

export type AppToken = {
    access_token: string;
    expires_in: number;
} & TokenSaveTimestamp;

export type UserToken = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string[];
} & TokenSaveTimestamp;

export type UsableAppToken = { token: string; isApp: true; userId?: never, scopes?: never };
export type UsableUserToken = { token: string; isApp: false; userId: string, scopes?: never };
export type UsableUserTokenWithScopes = { token: string; isApp: false; userId: string, scopes: TwtichPermissionScope[] };
export type UsableToken = UsableAppToken | UsableUserToken | UsableUserTokenWithScopes;
