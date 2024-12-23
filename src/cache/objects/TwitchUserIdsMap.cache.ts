import { LRUCache } from "../models/LRUCache.storage";

export default class TwitchUserIdsMapCache extends LRUCache<UsernameWithId> {
    private static instance: TwitchUserIdsMapCache;
    public static getInstance(): TwitchUserIdsMapCache {
        if (!TwitchUserIdsMapCache.instance) TwitchUserIdsMapCache.instance = new TwitchUserIdsMapCache();
        return TwitchUserIdsMapCache.instance;
    }
    private constructor() {
        super({ ttl: 0 });
    }

    getByName(username: string): UsernameWithId | null {
        return this.get(username);
    }

    getById(id: string): UsernameWithId | null {
        for (const item of this.cache.values()) {
            if (item.value.id === id) {
                return item.value;
            }
        }
        return null;
    }
}

export type UsernameWithId = {
    username: string;
    id: string;
}