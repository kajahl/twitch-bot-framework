import axios from 'axios';
import CreateEventSubscriptionRequestConfigBuilder from '../builders/eventsub/CreateEventSubscriptionRequestConfig.builder';
import TwitchEventId from '../enums/TwitchEventId.enum';
import { TokenService } from '../services/Token.service';
import DataStorage from '../storage/runtime/Data.storage';
import { MappedTwitchEventId, TwitchEventData } from '../types/EventSub.types';
import Logger from '../utils/Logger';
import WebsocketClient from './Websocket.client';
import { CreateSubscriptionResponse, DeleteSubscriptionResponse } from '../types/APIClient.types';
import SubscribedEventListRequestConfigBuilder from '../builders/eventsub/SubscribedEventListRequestConfig.builder';
import DeleteEventSubscriptionRequestConfigBuilder from '../builders/eventsub/DeleteEventSubscriptionRequestConfig.builder';
import TwtichPermissionScope from '../enums/TwitchPermissionScope.enum';

const logger = new Logger('EventSubClient');

export default class EventSubClient {
    private static instance: EventSubClient;
    static init(tokenService: TokenService) {
        if (EventSubClient.instance) throw new Error('EventSubClient already initialized');
        EventSubClient.instance = new EventSubClient(tokenService);
        return EventSubClient.instance;
    }
    static getInstance() {
        if (!EventSubClient.instance) throw new Error('EventSubClient not initialized');
        return EventSubClient.instance;
    }

    private websocketClient: WebsocketClient;

    private constructor(private tokenService: TokenService) {
        this.websocketClient = new WebsocketClient(this);
    }

    get websocket() {
        return this.websocketClient;
    }

    private async subscribe<T extends MappedTwitchEventId>(
        type: T, 
        condition: TwitchEventData<T>['condition'], 
        version: TwitchEventData<T>['version'],
        token: string
    ) {
        const requestConfig = new CreateEventSubscriptionRequestConfigBuilder(type)
            .setClientId(DataStorage.getInstance().clientId.get() as string)
            .setAccessToken(token)
            .setType(type)
            .setCondition(condition)
            .setVersion(version)
            .setSessionId(DataStorage.getInstance().websocketId.get() as string)
            .build();
        const response = await axios.request<CreateSubscriptionResponse>(requestConfig);
        if (response.status !== 202) throw new Error(`Failed to subscribe to event ${type}`);
        logger.log(`New subscription (${response.data.data[0].id}) to event ${type} with condition ${JSON.stringify(condition)}`);
        return response.data;
    }

    private async list(token: string, type: MappedTwitchEventId | null = null) {
        const data = await new SubscribedEventListRequestConfigBuilder()
            .setClientId(DataStorage.getInstance().clientId.get() as string)
            .setAccessToken(token)
            .setType(type)
            .make();
        return data;
    }

    /**
     * Unsuscribe from an event
     * @param id Subscription ID
     */
    private async unsubscribe(
        id: string,
        token: string
    ) {
        const requestConfig = new DeleteEventSubscriptionRequestConfigBuilder()
            .setClientId(DataStorage.getInstance().clientId.get() as string)
            .setAccessToken(token)
            .setSubscriptionId(id)
            .build();
        const response = await axios.request<DeleteSubscriptionResponse>(requestConfig);
        if (response.status !== 204) throw new Error(`Failed to unsubscribe from event ${id}`);
        logger.log(`Unsubscribed from event ${id}`);
        return response.data;
    }

    async listenChat(channelId: string, asUserId: string = DataStorage.getInstance().userId.get() as string) {
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
        if(!userTokenObject.scope.includes(TwtichPermissionScope.UserBot)) 
            throw new Error(`User token does not have required scope user:bot (avaliable scopes: ${userTokenObject.scope.join(', ')})`);
        if(!userTokenObject.scope.includes(TwtichPermissionScope.ChannelBot)) 
            throw new Error(`User token does not have required scope channel:bot (avaliable scopes: ${userTokenObject.scope.join(', ')})`);

        return this.subscribe(TwitchEventId.ChannelChatMessage, {
            broadcaster_user_id: channelId,
            user_id: asUserId
        }, 1, userTokenObject.access_token);
    }

    async unlistenChat(channelId: string, asUserId: string = DataStorage.getInstance().userId.get() as string) {
        const userTokenObject = await this.tokenService.getUserTokenObjectById(asUserId);
        if(!userTokenObject) throw new Error('User token not found');
        // TODO: Cache dla subskrypcji
        const data = await this.list(userTokenObject.access_token, TwitchEventId.ChannelChatMessage);
        const subscription = data.data.filter(sub => sub.status == 'enabled').find(sub => sub.condition.broadcaster_user_id === channelId);
        if(!subscription) throw new Error('Subscription not found');
        return this.unsubscribe(subscription.id, userTokenObject.access_token);
    }
}
