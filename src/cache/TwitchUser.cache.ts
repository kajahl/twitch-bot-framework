import { Inject, Service } from "typedi";
import DINames from "../utils/DI.names";
import TwitchUserCacheFetchStrategy from "./fetchers/TwitchUser.cache.fetch.strategy";
import LRUCacheStrategy from "./strategies/LRUCache.strategy";
import { LoggerFactory } from "../utils/Logger";
import { ITwitchUser } from "../types/twitch/TwitchUser.types";

export default class TwitchUserCache extends LRUCacheStrategy<ITwitchUser> {
    constructor(
        @Inject(DINames.TwitchUserCacheFetchStrategy) fetchStrategy: TwitchUserCacheFetchStrategy,
        @Inject(DINames.LoggerFactory) loggerFactory: LoggerFactory
    ) {
        super({
            maxSize: 1000,
            ttl: 60,
            cleanupInterval: 10
        }, fetchStrategy, loggerFactory.createLogger('TwitchUserCache'));
    }
}