/*

Dekorator do definiowania klas jako boty Twitcha

Przykład użycia:

@TwitchBot({
    userId: string;
    clientId: string;
    clientSecret: string;
    channelProvider: IChannelProvider;
    commands: [],
    listeners: [],
})

interface IChannelProvider {
    getChannels(): string[]; # Strategy pattern
    onChannelsUpdated(callback: (channels: string[]) => void): void; # Observer pattern
}

Dodatkowe rzeczy do przemyślenia:
- CommandPrefixProvider - dostarcza prefix komendy dla danego kanału

*/

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

// Typy

export type ListenChannelsProvider = new () => IListenChannels;
export type TokenRepositoryProvider = new () => ITokenRepository;

export interface ITwitchBotConfig {
    userId: string;
    clientId: string;
    clientSecret: string;
    listenChannels: {
        provider: ListenChannelsProvider;
        refreshInterval: number;
    }
    tokenRepository: TokenRepositoryProvider;
    commands: (new () => ChatCommandExecution)[];
    listeners: (new () => ChatListenerExecution)[];
    log: {
        levels: LogLevel[];
    }
}

export function TwitchBot(config: ITwitchBotConfig): ClassDecorator {
    return (target: any) => {
        if (Container.has(DINames.ConfigService)) throw new Error(`You can only have one instance of bot`);
        Container.set(DINames.ConfigService, new ConfigService(config));
        Container.set(DINames.TokenRepository, new TokenRepository(config.tokenRepository));
        Container.set(DINames.UserDefinedListenChannelsProvider, new config.listenChannels.provider());
        Container.get(DINames.TwitchBotFramework);
    };
}