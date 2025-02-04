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
import TwitchBotFramework from '../TwitchBotFramework';
import { ChatCommandExecution } from '../types/ChatCommand.types';
import { ChatListenerExecution } from '../types/ChatListener.types';
import Container from 'typedi';
import EventSubClient from '../clients/EventSub.client';
import { RegisterServicePerInstance } from './InstanceService.decorator';
import { TokenService } from '../services/Token.service';
import UserCacheManager from '../cache/managers/UserCache.manager';
import APIClient from '../clients/Api.client';

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
}

export interface IChannelProvider {
    getChannelIds(): Promise<string[]> | string[]; // Strategy pattern
    onChannelsUpdated(callback: (channels: string[]) => void): Promise<void> | void; // Observer pattern
}

// Funkcje

const BotInstanceContainer = Container.of('BotInstance');

export function TwitchBot(config: ITwitchBotConfig): ClassDecorator {
    return (target: any) => {
        console.log(`[TwitchBotDecorator] Registering bot instance for UserId=${config.userId}`);
        Reflect.defineMetadata('config', config, target);

        // Cannot have multiple instances of the same bot
        if (BotInstanceContainer.has(config.userId)) {
            throw new Error(`Bot instance for userId ${config.userId} already exists.`);
        }

        // Register the bot instance
        const instance = new TwitchBotFramework(config);
        BotInstanceContainer.set(config.userId, instance);

        // Register the services (per instance)
        const userId = config.userId;

        const servicesToRegister = [
            TokenService,
            APIClient,
            EventSubClient,
            UserCacheManager
        ]

        servicesToRegister.forEach(service => RegisterServicePerInstance(target, service));
    };
}