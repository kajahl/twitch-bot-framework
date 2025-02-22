import 'reflect-metadata';
import { ChatCommandExecution } from '../types/ChatCommand.types';
import { ChatListenerExecution } from '../types/ChatListener.types';
import Container from 'typedi';
import ConfigService from '../services/Config.service';
import DINames from '../utils/DI.names';
import { LoggerFactory, LogLevel } from '../utils/Logger';
import TokenRepository from '../repositories/Token.repository';
import { ITokenRepository } from '../types/Token.repository.types';
import { IListenChannelsProvider } from '../types/ListenChannels.provider.types';
import { IChannelOptionsProvider } from '../types/ChannelOptions.provider';
import { ChannelOptionsProvider } from '../providers/ChannelOptions.provider';
import ChatCommandsService from '../services/ChatCommands.service';
import ChatListenersService from '../services/ChatListeners.service';
import TwitchUserCache from '../cache/TwitchUser.cache';
import TwitchUserCacheFetchStrategy from '../cache/fetchers/TwitchUser.cache.fetch.strategy';
import ChatDataInjectorService from '../services/ChatDataInjector.service';
import RateLimiterService from '../services/RateLimiter.service';
import TwitchBotFramework from '../TwitchBotFramework';
import ListenChannelsProvider from '../providers/ListenChannels.provider';
import APIClient from '../clients/Api.client';
import EventSubClient from '../clients/EventSub.client';
import { TokenService } from '../services/Token.service';

// Typy

export type TListenChannelsProvider = new () => IListenChannelsProvider;
export type TTokenRepositoryProvider = new () => ITokenRepository;
export type TChannelOptionsProvider<T extends Record<string, any>> = new () => IChannelOptionsProvider<T>;

export interface ITwitchBotConfig<ExtendedChannelOptions extends Record<string, any> = Record<string, any>> {
    userId: string;
    clientId: string;
    clientSecret: string;
    listenChannels: {
        provider: TListenChannelsProvider;
        refreshInterval: number;
    };
    channelOptions: {
        provider: TChannelOptionsProvider<ExtendedChannelOptions>;
    };
    tokenRepository: TTokenRepositoryProvider;
    commands: (new () => ChatCommandExecution)[];
    listeners: (new () => ChatListenerExecution)[];
    log: {
        levels: LogLevel[];
    };
}

export function TwitchBot(config: ITwitchBotConfig): ClassDecorator {
    return (target: any) => {
        if (Container.has(DINames.ConfigService)) throw new Error(`You can only have one instance of bot`);
        if (config.listenChannels.refreshInterval < 10000) throw new Error(`Refresh interval must be at least 10000 ms`);

        // Basic

        Container.set(DINames.ConfigService, new ConfigService(config));
        Container.set(DINames.LoggerFactory, new LoggerFactory(Container.get(DINames.ConfigService)));

        // Tokens

        Container.set(DINames.TokenRepository, new TokenRepository(config.tokenRepository));
        Container.set(DINames.TokenService, new TokenService(Container.get(DINames.ConfigService), Container.get(DINames.TokenRepository), Container.get(DINames.LoggerFactory)));

        // API

        Container.set(DINames.APIClient, new APIClient(Container.get(DINames.ConfigService), Container.get(DINames.TokenService), Container.get(DINames.LoggerFactory)));

        // Providers 

        Container.set(DINames.ListenChannelsProvider, new ListenChannelsProvider(config.listenChannels.provider, Container.get(DINames.ConfigService), Container.get(DINames.LoggerFactory)));
        Container.set(DINames.ChannelOptionsProvider, new ChannelOptionsProvider(config.channelOptions.provider, Container.get(DINames.ConfigService), Container.get(DINames.LoggerFactory)));
        
        // RateLimiter

        Container.set(DINames.RateLimiterService, new RateLimiterService(Container.get(DINames.LoggerFactory)));

        // Chat

        Container.set(DINames.ChatDataInjectorService, new ChatDataInjectorService(Container.get(DINames.LoggerFactory)));
        Container.set(DINames.ChatCommandsService, new ChatCommandsService(Container.get(DINames.APIClient), Container.get(DINames.ChannelOptionsProvider), Container.get(DINames.ChatDataInjectorService), Container.get(DINames.LoggerFactory)));
        Container.set(DINames.ChatListenersService, new ChatListenersService(Container.get(DINames.ChatDataInjectorService), Container.get(DINames.LoggerFactory)));

        // General - Events
                
        Container.set(DINames.EventSubClient, new EventSubClient(
            Container.get(DINames.ConfigService),
            Container.get(DINames.TokenService),
            Container.get(DINames.ListenChannelsProvider),
            Container.get(DINames.ChatCommandsService),
            Container.get(DINames.ChatListenersService),
            Container.get(DINames.LoggerFactory)
        ));

        // Fetch strategies for Cache

        Container.set(DINames.TwitchUserCacheFetchStrategy, new TwitchUserCacheFetchStrategy(Container.get(DINames.APIClient)));

        // Cache

        Container.set(DINames.TwitchUserCacheFetchStrategy, new TwitchUserCacheFetchStrategy(Container.get(DINames.APIClient)));
        Container.set(DINames.TwitchUserCache, new TwitchUserCache(Container.get(DINames.TwitchUserCacheFetchStrategy), Container.get(DINames.LoggerFactory)))

        // Main

        Container.set(DINames.TwitchBotFramework, new TwitchBotFramework(
            Container.get(DINames.ConfigService),
            Container.get(DINames.TokenService), 
            Container.get(DINames.EventSubClient),
            Container.get(DINames.APIClient),
            Container.get(DINames.LoggerFactory)
        ));
        Container.get(DINames.TwitchBotFramework);
    };
}
