import Container from 'typedi';
import TwitchUserCache from '../cache/TwitchUser.cache';
import DINames from '../utils/DI.names';
import { ITwitchUser, IPartialTwitchUser, IChatterUser, Badge, BadgeSetId } from '../types/twitch/TwitchUser.types';

export class PartialTwitchUser {
    constructor(private readonly data: IPartialTwitchUser) {}

    getId(): string {
        return this.data.id;
    }

    getLogin(): string {
        return this.data.login;
    }

    getUsername(): string {
        return this.data.name;
    }
}

export class ChatterUser {
    constructor(private readonly data: IChatterUser) {}

    getId(): string {
        return this.data.chatter_user_id;
    }

    getLogin(): string {
        return this.data.chatter_user_login;
    }

    getUsername(): string {
        return this.data.chatter_user_name;
    }

    getColor(): string {
        return this.data.color;
    }

    getBadges(): Badge[] {
        return this.data.badges;
    }

    hasBadge(setId: BadgeSetId): boolean {
        return this.getBadges().some((badge) => badge.set_id === setId);
    }

    // Broadcaster, Moderator, VIP

    isBroadcaster(): boolean {
        return this.hasBadge(BadgeSetId.Broadcaster);
    }

    isModerator(): boolean {
        return this.hasBadge(BadgeSetId.Moderator);
    }

    isVIP(): boolean {
        return this.hasBadge(BadgeSetId.Vip);
    }

    // Subscriber

    isSubscriber(): boolean {
        return this.hasBadge(BadgeSetId.Subscriber);
    }

    getSubscriberMonths(): number {
        const badge = this.getBadges().find((badge) => badge.set_id === BadgeSetId.Subscriber);
        if (badge == null) return 0;
        const months = parseInt(badge.info);
        return isNaN(months) ? 0 : months;
    }

    // SubGifter

    isSubGifter(): boolean {
        return this.hasBadge(BadgeSetId.SubGifter);
    }

    /**
     * Returns the number of gifted subscriptions (From badge, not real data)
     * @returns {number} The number of gifted subscriptions
     */
    getGiftedSubs(): number {
        const badge = this.getBadges().find((badge) => badge.set_id === BadgeSetId.SubGifter);
        if (badge == null) return 0;
        const subs = parseInt(badge.set_id);
        return isNaN(subs) ? 0 : subs;
    }

    // BitsGifter

    isBitsGift(): boolean {
        return this.hasBadge(BadgeSetId.BitsGifter);
    }

    /**
     * Returns the number of gifted bits (From badge, not real data)
     * @returns {number} The number of gifted bits
     */
    getGiftedBits(): number {
        const badge = this.getBadges().find((badge) => badge.set_id === BadgeSetId.BitsGifter);
        if (badge == null) return 0;
        const subs = parseInt(badge.set_id);
        return isNaN(subs) ? 0 : subs;
    }
}

export class TwitchUser {
    private readonly cache: TwitchUserCache = Container.get(DINames.TwitchUserCache);

    constructor(private readonly id: string) {}

    private async getCachedUser(): Promise<ITwitchUser | null> {
        return await this.cache.get(this.id);
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
