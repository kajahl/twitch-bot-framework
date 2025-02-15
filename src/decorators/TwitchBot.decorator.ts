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
import { ITokenRepository } from '../storage/repository/Token.repository';
import { ChatCommandExecution } from '../types/ChatCommand.types';
import { ChatListenerExecution } from '../types/ChatListener.types';
import Container from 'typedi';
import ConfigService from '../services/Config.service';
import DINames from '../utils/DI.names';
import { LogLevel } from '../utils/Logger';

// Typy

export type ChannelProvider = new () => IChannelProvider;
export type TokenRepository = new () => ITokenRepository;

export interface ITwitchBotConfig {
    userId: string;
    clientId: string;
    clientSecret: string;
    channelProvider: ChannelProvider;
    tokenRepository: TokenRepository;
    commands: (new () => ChatCommandExecution)[];
    listeners: (new () => ChatListenerExecution)[];
    log: {
        levels: LogLevel[];
    }
}

export interface IChannelProvider {
    getChannelIds(): Promise<string[]> | string[]; // Strategy pattern
    onChannelsUpdated(callback: (channels: string[]) => void): Promise<void> | void; // Observer pattern
}

export function TwitchBot(config: ITwitchBotConfig): ClassDecorator {
    return (target: any) => {
        if (Container.has(DINames.ConfigService)) throw new Error(`You can only have one instance of bot`);
        Container.set(DINames.ConfigService, new ConfigService(config));
        Container.get(DINames.TwitchBotFramework);
    };
}