enum DINames {
    // Config
    ConfigService = 'CONFIG_SERVICE',

    // Logs
    LoggerFactory = 'LOGGER_FACTORY',

    // Services & Clients
    TokenService = 'TOKEN_SERVICE',
    RateLimiterService = 'RATE_LIMITER_SERVICE',
    EventSubClient = 'EVENT_SUB_CLIENT',
    APIClient = 'API_CLIENT',

    // Main class
    TwitchBotFramework = 'TWITCH_BOT_FRAMEWORK',

    // User-defined
    ListenChannelsProvider = 'LISTEN_CHANNELS_PROVIDER',
    ChannelOptionsProvider = 'CHANNEL_OPTIONS_PROVIDER',
    TokenRepository = 'TOKEN_REPOSITORY',
    UserDefinedListenChannelsProvider = 'USER_DEFINED_LISTEN_CHANNELS_PROVIDER',

    // Chat 
    ChatCommandsService = 'CHAT_COMMANDS_SERVICE',
    ChatListenersService = 'CHAT_LISTENERS_SERVICE',
    ChatDataInjectorService = 'CHAT_DATA_INJECTOR_SERVICE',

    // Cache-fetchers
    TwitchUserCacheFetchStrategy = 'TWITCH_USER_CACHE_FETCH_STRATEGY',

    // Cache
    TwitchUserCache = 'TWITCH_USER_CACHE',
}

export default DINames;