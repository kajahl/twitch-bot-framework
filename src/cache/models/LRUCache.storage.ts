import { Cache, CacheItem, CacheOptions } from "./Cache.storage";

export class LRUCache<T> implements Cache<T> {
    protected cache: Map<string, CacheItem<T>> = new Map();
    private maxSize: number;
    private ttl: number;

    constructor(options: CacheOptions = {}) {
        this.maxSize = options.maxSize || Infinity;
        this.ttl = options.ttl || 0;
    }

    private isExpired(item: CacheItem<T>): boolean {
        return this.ttl > 0 && Date.now() > item.expiry;
    }

    get(key: string, ignoreTTL: boolean = false): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (!ignoreTTL && this.isExpired(item)) {
            this.cache.delete(key);
            return null;
        }

        // Move accessed item to the end to mark it as recently used
        this.cache.delete(key);
        this.cache.set(key, item);

        return item.value;
    }

    values(ignoreTTL: boolean = false): T[] {
        return Array.from(this.cache.values())
            .filter(item => ignoreTTL || !this.isExpired(item))
            .map(item => item.value);
    }

    set(key: string, value: T, options: CacheOptions = {}): void {
        const ttl = options.ttl !== undefined ? options.ttl : this.ttl;
        const expiry = ttl > 0 ? Date.now() + ttl * 1000 : Infinity;

        if (this.cache.size >= this.maxSize) {
            // Remove the least recently used item
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, { value, expiry });
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}