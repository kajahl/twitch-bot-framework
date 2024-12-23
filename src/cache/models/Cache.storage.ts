// Cache.ts
export type CacheOptions = {
    ttl?: number; // Time to live in seconds, 0 means no TTL
    maxSize?: number; // Maximum number of records
}

export type CacheItem<T> = {
    value: T;
    expiry: number; // Expiry timestamp in milliseconds
}

export type Cache<T> = {
    get(key: string): T | null;
    set(key: string, value: T, options?: CacheOptions): void;
    delete(key: string): void;
    clear(): void;
}

