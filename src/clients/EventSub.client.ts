import axios from 'axios';
import CreateEventSubscriptionRequestConfigBuilder from '../builders/eventsub/CreateEventSubscriptionRequestConfig.builder';
import TwitchEventId from '../enums/TwitchEventId.enum';
import { TokenService } from '../services/Token.service';
import { MappedTwitchEventId, TwitchEventData } from '../types/EventSub.types';
import { Logger, LoggerFactory } from '../utils/Logger';
import WebsocketClient from './Websocket.client';
import { CreateSubscriptionResponse, DeleteSubscriptionResponse } from '../types/APIClient.types';
import SubscribedEventListRequestConfigBuilder from '../builders/eventsub/SubscribedEventListRequestConfig.builder';
import DeleteEventSubscriptionRequestConfigBuilder from '../builders/eventsub/DeleteEventSubscriptionRequestConfig.builder';
import TwtichPermissionScope from '../enums/TwitchPermissionScope.enum';
import { IChannelProvider } from '../decorators/TwitchBot.decorator';
import { Inject, Service } from 'typedi';
import DINames from '../utils/DI.names';
import ConfigService from '../services/Config.service';

@Service(DINames.EventSubClient)
export default class EventSubClient {
    private readonly clientId: string;
    private readonly userId: string;
    private readonly logger: Logger;
    private websocketClient: WebsocketClient;
    private channelProvider: IChannelProvider;

    private constructor(
        @Inject(DINames.ConfigService) private readonly config: ConfigService,
        @Inject(DINames.TokenService) private readonly tokenService: TokenService,
        @Inject(DINames.LoggerFactory) private readonly loggerFactory: LoggerFactory
    ) {
        this.logger = loggerFactory.createLogger('EventSubClient');
        const options = config.getConfig();
        this.clientId = options.clientId;
        this.userId = options.userId;
        this.websocketClient = new WebsocketClient(this, this.onWebsocketConnected.bind(this), this.onWebsocketDisconnected.bind(this), this.loggerFactory);
        
        this.channelProvider = new options.channelProvider();
        this.logger.debug('Initialized');
    }

    // Komunikacja z websocketem
    private weboscketSessionId: string | null = null;
    private async onWebsocketConnected(sessionId: string) {
        this.weboscketSessionId = sessionId;
        this.setupChatListeners();
    }
    private async onWebsocketDisconnected() {
        this.weboscketSessionId = null;
    }

    // Obsługa kanałów

    private channelList: string[] = [];
    private async setupChatListeners() {
        const options = this.config.getConfig();

        const channels = await this.channelProvider.getChannelIds();
        if(!channels.includes(options.userId)) {
            channels.push(options.userId);
        }

        this.logger.info(`Checking listeners for channels=${channels.join(',')}`);
        const channelsToSubscribe = channels.filter(channel => !this.channelList.includes(channel));
        const channelsToUnsubscribe = this.channelList.filter(channel => !channels.includes(channel));

        const subscribePromises = channelsToSubscribe.map(async channel => {
            this.logger.info(`Subscribing to chat events for channel=${channel}...`);
            const promise = this.listenChat(channel);
            promise.then((data) => {
                this.logger.info(`Successfully subscribed to chat events for channel=${channel}`);
            }).catch((err) => {
                this.logger.error(`Failed to subscribe to chat events for channel=${channel} - ${err}`);
            });
            return promise;
        });
        
        const unsubscribePromises = channelsToUnsubscribe.map(async channel => {
            this.logger.info(`Unsubscribing from chat events for channel=${channel}...`);
            const promise = this.unlistenChat(channel);
            promise.then((data) => {
                this.logger.info(`Successfully unsubscribed from chat events for channel=${channel}`);
            }).catch((err) => {
                this.logger.error(`Failed to unsubscribe from chat events for channel=${channel} - ${err}`);
            });
            return promise;
        });

        await Promise.all([...subscribePromises, ...unsubscribePromises]).catch((err) => {
            this.logger.error(`Failed to setup chat listeners - ${err}`);
        });

        this.channelList = channels;
    }

    /**
     * Subscribes to an event
     * @param type Event type {@link TwitchEventId}
     * @param condition Event condition {@link TwitchEventData}
     * @param version Event version
     * @param token Access token
     * @returns Result {@link CreateSubscriptionResponse}
     * @throws Error if subscription failed
     */
    private async subscribe<T extends MappedTwitchEventId>(
        type: T, 
        condition: TwitchEventData<T>['condition'], 
        version: TwitchEventData<T>['version'],
        token: string
    ) {
        if(!this.weboscketSessionId) throw new Error('Websocket session ID not found');
        const requestConfig = new CreateEventSubscriptionRequestConfigBuilder(type)
            .setClientId(this.clientId)
            .setAccessToken(token)
            .setType(type)
            .setCondition(condition)
            .setVersion(version)
            .setSessionId(this.weboscketSessionId)
            .build();
        const response = await axios.request<CreateSubscriptionResponse>(requestConfig);
        if (response.status !== 202) {
            const errorMessage = `Failed to subscribe to event ${type} with condition ${JSON.stringify(condition)}`
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        this.logger.debug(`New subscription (${response.data.data[0].id}) to event ${type} with condition ${JSON.stringify(condition)}`);
        return response.data;
    }

    private async list(token: string, type: MappedTwitchEventId | null = null) {
        const data = await new SubscribedEventListRequestConfigBuilder()
            .setClientId(this.clientId)
            .setAccessToken(token)
            .setType(type)
            .make();
        return data;
    }

    /**
     * Unsuscribe from an event
     * @param id Subscription ID
     * @returns Result {@link DeleteSubscriptionResponse}
     * @throws Error if unsubscription failed
     */
    private async unsubscribe(
        id: string,
        token: string
    ) {
        const requestConfig = new DeleteEventSubscriptionRequestConfigBuilder()
            .setClientId(this.clientId)
            .setAccessToken(token)
            .setSubscriptionId(id)
            .build();
        const response = await axios.request<DeleteSubscriptionResponse>(requestConfig);
        if (response.status !== 204) {
            const errorMessage = `Failed to unsubscribe from event ${id}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        this.logger.debug(`Unsubscribed from event ${id}`);
        return response.data;
    }

    // Specyfic methods for events

    /**
     * Subscribes to chat events
     * //TODO
     */
    async listenChat(channelId: string, asUserId: string = this.userId) {
        const userTokenObject = await this.tokenService.getUserTokenObjectById(asUserId);
        if(!userTokenObject) throw new Error('User token not found');
        /*
        Zależnie od scopeów:
            user:read:chat - Czytanie dowolnego czatu z użyciem tokenu użytkownika
            user:bot - Czytanie dowolnego czatu z użyciem tokenu aplikacji
            channel:bot - Czytanie czatu, gdzie użytkownik jest moderatorem/właścicielem z użyciem tokenu aplikacji
        Jeżeli użytkownik (userId) jest zwykłym uczestnikiem czatu, można użyć:
            (1) user:bot + appAccessToken
            (2) user:read:chat + userAccessToken
        Jeżeli użytkownik (userId) jest moderatorem/właścicielem czatu, można użyć:
            (1) channel:bot + appAccessToken
            (2 - chyba) user:read:chat + userAccessToken
        ALE najlepiej rozwiązać to tak - użytkownik, który jest botem MUSI mieć scope user:bot i channel:bot
        */
        if(!userTokenObject.scope.includes(TwtichPermissionScope.UserBot)) {
            const errorMessage = `User token does not have required scope user:bot (avaliable scopes: ${userTokenObject.scope.join(', ')})`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        if(!userTokenObject.scope.includes(TwtichPermissionScope.ChannelBot)) {
            const errorMessage = `User token does not have required scope channel:bot (avaliable scopes: ${userTokenObject.scope.join(', ')})`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        return this.subscribe(TwitchEventId.ChannelChatMessage, {
            broadcaster_user_id: channelId,
            user_id: asUserId
        }, 1, userTokenObject.access_token);
    }

    /**
     * Unsubscribes from chat events
     * //TODO
     */
    async unlistenChat(channelId: string, asUserId: string = this.userId) {
        const userTokenObject = await this.tokenService.getUserTokenObjectById(asUserId);
        if(!userTokenObject) throw new Error('User token not found');
        // TODO: Cache dla subskrypcji
        const data = await this.list(userTokenObject.access_token, TwitchEventId.ChannelChatMessage);
        const subscription = data.data.filter(sub => sub.status == 'enabled').find(sub => sub.condition.broadcaster_user_id === channelId);
        if(!subscription) throw new Error('Subscription not found');
        return this.unsubscribe(subscription.id, userTokenObject.access_token);
    }
}
