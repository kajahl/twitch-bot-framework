import { CacheOptions, FetchStrategy } from "../../types/Cache.types";
import { BaseCache } from "./BaseCache.strategy";
import { Logger, LoggerFactory } from "../../utils/Logger";

/**
 * Least Recently Used (LRU) Cache Strategy
 * @template T Type of the cache value
 */
export default class LRUCacheStrategy<T> extends BaseCache<T> {
    constructor(
        options: CacheOptions,
        fetchStrategy: FetchStrategy<T> | null,
        logger: Logger
    ) {
        super(options, fetchStrategy, logger);
    }

    protected async getCacheItem(key: string): Promise<T | null> {
        const item = this.cache.get(key);
        if (item === undefined) return null;

        const maxIndex = this.capacity - 1;
        const oldIndex = Array.from(this.cache.keys()).indexOf(key);

        // Move accessed item to the end to mark it as recently used
        this.cache.delete(key);
        this.cache.set(key, item);

        const newIndex = Array.from(this.cache.keys()).indexOf(key);
        this.logger.debug(`Moved cache item ${key} from index ${oldIndex}/${maxIndex} to ${newIndex}/${maxIndex}`);

        return item.value;
    }

    protected async evict(): Promise<void> {
        // Remove the least recently used item
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) {
            this.logger.debug(`Evicting cache item ${firstKey}`);
            this.cache.delete(firstKey);
        }
    }
}