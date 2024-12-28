import { TokenService } from '../services/Token.service';
import DataStorage from '../storage/runtime/Data.storage';
import { MappedTwitchEventId } from '../types/EventSub.types';
import Logger from '../utils/Logger';
import WebsocketClient from './Websocket.client';

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

    /**
     * Subscribe to an event
     */
    get subscribe() {
        return {
            /**
             * Subscribe to an event as a user
             */
            asUser: async <T extends MappedTwitchEventId>() => {},
            /**
             * Subscribe to an event as an app
             */
            asApp: async <T extends MappedTwitchEventId>() => {},
        };
    }

    /**
     * Get a list of subscribed events
     */
    get list() {
        return {
            /**
             * Get a list of subscribed events as a user
             * @param userId User ID to get the list of events for (default: bot user)
             */
            forUser: async (userId: string = DataStorage.getInstance().userId.get() as string) => {},
            /**
             * Get a list of subscribed events as an app
             */
            forApp: async () => {},
        };
    }

    /**
     * Unsuscribe from an event
     * @param id Subscription ID
     */
    unsubscribe(id: string) {

    }
}
