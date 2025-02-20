import Container from "typedi";
import TwitchUserCache from "../cache/TwitchUser.cache";
import DINames from "../utils/DI.names";
import { ITwitchUser, IPartialTwitchUser } from "../types/twitch/TwitchUser.types";

export default class TwitchUser {
    private readonly cache: TwitchUserCache = Container.get(DINames.TwitchUserCache);
    private cachedUser: ITwitchUser | null = null;

    constructor(private readonly id: string) {}

    private async getCachedUser(): Promise<ITwitchUser | null> {
        if (!this.cachedUser) {
            this.cachedUser = await this.cache.get(this.id);
        }
        return this.cachedUser;
    }

    getId(): string {
        return this.id;
    }

    async getLogin(): Promise<string | null> {
        const user = await this.getCachedUser();
        return user ? user.login : null;
    }

    async getDisplayName(): Promise<string | null> {
        const user = await this.getCachedUser();
        return user ? user.display_name : null;
    }

    async getType(): Promise<string | null> {
        const user = await this.getCachedUser();
        return user ? user.type : null;
    }

    async getBroadcasterType(): Promise<string | null> {
        const user = await this.getCachedUser();
        return user ? user.broadcaster_type : null;
    }

    async getDescription(): Promise<string | null> {
        const user = await this.getCachedUser();
        return user ? user.description : null;
    }

    async getProfileImageUrl(): Promise<string | null> {
        const user = await this.getCachedUser();
        return user ? user.profile_image_url : null;
    }

    async getOfflineImageUrl(): Promise<string | null> {
        const user = await this.getCachedUser();
        return user ? user.offline_image_url : null;
    }

    async getEmail(): Promise<string | null> {
        const user = await this.getCachedUser();
        return user ? user.email : null;
    }
}