import 'reflect-metadata';
import { ChatCommandExecution } from '../types/ChatCommand.types';
import { ChatListenerExecution } from '../types/ChatListener.types';
import Container from 'typedi';
import ConfigService from '../services/Config.service';
import DINames from '../utils/DI.names';
import { LogLevel } from '../utils/Logger';
import TokenRepository from '../repositories/Token.repository';
import { ITokenRepository } from '../types/Token.repository.types';
import { IListenChannels } from '../types/ListenChannels.provider.types';
import { IChannelOptionsProvider } from '../types/ChannelOptions.provider';
import { ChannelOptionsProvider } from '../providers/ChannelOptions.provider';
import ChatCommandsService from '../services/ChatCommands.service';
import ChatListenersService from '../services/ChatListeners.service';

// Typy

export type ListenChannelsProvider = new () => IListenChannels;
export type TokenRepositoryProvider = new () => ITokenRepository;
export type TChannelOptionsProvider<T extends Record<string, any>> = new () => IChannelOptionsProvider<T>;

export interface ITwitchBotConfig<ExtendedChannelOptions extends Record<string, any> = Record<string, any>> {
    userId: string;
    clientId: string;
    clientSecret: string;
    listenChannels: {
        provider: ListenChannelsProvider;
        refreshInterval: number;
    };
    channelOptions: {
        provider: TChannelOptionsProvider<ExtendedChannelOptions>;
        cache: {
            enabled: boolean;
            ttl: number;
        }
    };
    tokenRepository: TokenRepositoryProvider;
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

        Container.set(DINames.ConfigService, new ConfigService(config));
        Container.set(DINames.TokenRepository, new TokenRepository(config.tokenRepository));
        Container.set(DINames.UserDefinedListenChannelsProvider, new config.listenChannels.provider());
        Container.set(DINames.ChannelOptionsProvider, new ChannelOptionsProvider(config.channelOptions.provider, Container.get(DINames.ConfigService), Container.get(DINames.LoggerFactory)));
        
        Container.set(DINames.ChatCommandsService, new ChatCommandsService(Container.get(DINames.ChannelOptionsProvider), Container.get(DINames.LoggerFactory)));
        Container.set(DINames.ChatListenersService, new ChatListenersService(Container.get(DINames.ChannelOptionsProvider), Container.get(DINames.LoggerFactory)));

        Container.get(DINames.TwitchBotFramework);
    };
}
