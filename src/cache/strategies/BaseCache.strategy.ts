import { Cache, CacheItem, CacheOptions, FetchStrategy } from "../../types/Cache.types";
import { Logger } from "../../utils/Logger";


export abstract class BaseCache<ItemType> implements Cache<ItemType> {
    protected cache: Map<string, CacheItem<ItemType>> = new Map();
    private maxSize: number;
    private ttl: number;

    private cleanup: NodeJS.Timeout | null = null;
    private cleanupInterval: number;

    constructor(
        options: CacheOptions,
        protected fetchStrategy: FetchStrategy<ItemType> | null,
        protected logger: Logger
    ) {
        this.maxSize = options.maxSize || Infinity;
        this.ttl = options.ttl || 0;
        this.cleanupInterval = options.cleanupInterval || 0;

        if(this.ttl < 0) throw new Error('TTL must be greater than or equal to 0');
        if(this.maxSize <= 0) throw new Error('Max size must be greater than 0');
        if(this.cleanupInterval < 0) throw new Error('Cleanup interval must be greater than or equal to 0');

        // There is no need to run cleanup if there is no TTL
        if(this.ttl == 0 && this.cleanupInterval > 0) throw new Error('Cleanup interval must be 0 if TTL is 0');

        if (this.cleanupInterval > 0) {
            this.cleanup = setInterval(() => this.removeExpired(), this.cleanupInterval * 1000);
        }

        this.logger.debug(`Cache initialized with maxSize=${this.maxSize}, ttl=${this.ttl}, cleanupInterval=${this.cleanupInterval}`);
    }

    get capacity(): number {
        return this.maxSize;
    }

    protected abstract getCacheItem(key: string): Promise<ItemType | null>;
    protected abstract evict(): void;

    /**
     * Check if the cache item is expired
     * @param item Cache item
     * @returns True if the item is expired
     */
    private isExpired(key: string): boolean {
        const item = this.cache.get(key);
        return item !== undefined && this.ttl > 0 && Date.now() > item.expiry;
    }

    /**
     * Get the cache item
     * @param key Key of the cache item
     * @param ignoreTTL Ignore TTL (default: false)
     * @returns Cache item or null if not found (cache or fetchStrategy if defined) or expired
     */
    async get(key: string): Promise<ItemType | null> {
        this.logger.debug(`Getting cache item ${key}`);
        if (this.isExpired(key)) {
            this.logger.debug(`Cache item ${key} is expired - ereasing`);
            this.cache.delete(key);
            return this.fetchItem(key);
        }

        const item = await this.getCacheItem(key);

        if (item === null) {
            this.logger.debug(`Key ${key} not found in cache.`);
            return this.fetchItem(key);
        }

        return item;
    }

    private async fetchItem(key: string): Promise<ItemType | null> {
        if(this.fetchStrategy === null) {
            this.logger.warn(`Fetch strategy not defined for key ${key}`);
            return null;
        } 

        this.logger.debug(`Fetching item for key ${key}`);
        const value = await this.fetchStrategy.fetch(key);
        if (value !== null) {
            this.logger.debug(`Fetched item for key ${key} from strategy`);
            this.setCacheItem(key, value);
            return value;
        }

        this.logger.debug(`Item for key ${key} not found in strategy`);
        return null;
    }

    protected setCacheItem(key: string, value: ItemType, options: CacheOptions = {}): void {
        const ttl = options.ttl !== undefined ? options.ttl : this.ttl;
        const expiry = ttl > 0 ? Date.now() + ttl * 1000 : Infinity;

        // Evict the item (defined by strategy) if the cache is full
        if (this.cache.size >= this.maxSize) {
            this.logger.debug(`Cache is full - evicting item`);
            this.evict();
        }

        this.cache.set(key, { value, expiry });
    }

    protected clear(): void {
        this.logger.debug('Clearing cache');
        this.cache.clear();
        if(this.cleanup) clearInterval(this.cleanup);
        this.cleanup = setInterval(() => this.removeExpired(), this.cleanupInterval * 1000);
    }

    protected removeExpired(): void {
        this.logger.debug('Removing expired items from cache');
        for (const [key, _] of this.cache.entries()) {
            if (this.isExpired(key)) {
                this.cache.delete(key);
                this.logger.debug(`Removed expired item ${key}`);
            }
        }
    }
}
