import DataStorage from "../storage/runtime/Data.storage";
import { NotificationPayload, RevocationPayload, WebsocketMessage, WebsocketMessageType, WelcomePayload } from "../types/Websocket.types";
import Logger from "../utils/Logger";
import { WebSocket } from "ws";
import EventSubClient from "./EventSub.client";

const logger = new Logger('WebsocketClient');

export default class WebsocketClient {
    private websocketClient: WebSocket | null = null;

    constructor(
        private readonly eventSubClient: EventSubClient
    ) {}

    // Keepalive
    private lastKeepAliveTimestamp: number = 0;
    private keepAliveIntervalMs: number = 0;
    // Milliseconds offset for keepalive check (eg.: 5s interval, 2s offset -> check if lastKeepAliveTimestamp is greater than 7s)
    private readonly keepAliveIntervalMsOffset = 2000;
    private keepAliveInterval: NodeJS.Timeout | null = null;

    private updateKeepAliveTimestamp() {
        this.lastKeepAliveTimestamp = Date.now();
    }

    private readonly reconnectOnTimeout = true;
    private setupKeepAlive(keepAliveIntervalMs: number) {
        if (this.keepAliveInterval !== null) clearInterval(this.keepAliveInterval);
        this.updateKeepAliveTimestamp(); // Set initial timestamp
        this.keepAliveIntervalMs = keepAliveIntervalMs; // Keepalive means that server expects a message every X seconds
        this.keepAliveInterval = setInterval(() => {
            const currentTimestamp = Date.now();
            const difference = currentTimestamp - this.lastKeepAliveTimestamp;
            logger.log(`Checking WebSocket keepalive (Last keepalive: ${difference}/${this.keepAliveIntervalMs + this.keepAliveIntervalMsOffset}ms)`);
            if (difference > this.keepAliveIntervalMs + this.keepAliveIntervalMsOffset) {
                logger.log(`WebSocket connection keepalive timeout.${this.reconnectOnTimeout ? ' Reconnecting...' : ''}`);
                if(this.reconnectOnTimeout) this._connect(true);
                return;
            }
        }, this.keepAliveIntervalMs / 2); // Check every half of the keepalive interval (eg.: 5s interval -> check every 2.5s)
    }
    
    // Connection

    private readonly reconnectTimeout = 5000;
    private readonly reconnectOnClose = true;
    private readonly reconnectOnError = true;
    private _connect(forceReconnect: boolean = false) {
        if(!forceReconnect && this.websocketClient != null) throw new Error('Already connected to EventSub WebSocket');
        if(this.websocketClient != null) this._disconnect();
        this.websocketClient = new WebSocket('wss://eventsub.wss.twitch.tv/ws');

        this.websocketClient.on('open', () => {
            logger.log('Connected to EventSub WebSocket');
        });

        this.websocketClient.on('message', (data) => {
            const messageReadable = data.toString('utf8');
            // logger.log(messageReadable);
            const message = JSON.parse(messageReadable);
            this.handleWebSocketMessage(message);
        });

        this.websocketClient.on('close', () => {
            logger.log('Disconnected from EventSub WebSocket');
            this._disconnect();
            if (this.reconnectOnClose) setTimeout(() => this.connect(), this.reconnectTimeout);
        });

        this.websocketClient.on('error', (err) => {
            logger.error(JSON.stringify(err));
            this._disconnect();
            if (this.reconnectOnError) setTimeout(() => this.connect(), this.reconnectTimeout);
        });
    }

    private _disconnect() {
        if (this.websocketClient == null) return;
        if (this.keepAliveInterval != null) clearTimeout(this.keepAliveInterval);
        DataStorage.getInstance().websocketId.set(null);
        this.websocketClient.close();
        this.websocketClient = null;
    }

    // Public

    public connect() {
        try {
            this._connect();
        } catch (e) {
            logger.error(JSON.stringify(e));
            return false;
        }
        return true;
    }

    // Message handling

    private handleWebSocketMessage(websocketMessage: WebsocketMessage<any>) {
        const messageType = websocketMessage.metadata.message_type;

        if (messageType === WebsocketMessageType.Welcome) return this.handleWelcomeMessage(websocketMessage);
        if (messageType === WebsocketMessageType.Notification) return this.handleNotification(websocketMessage);
        if (messageType === WebsocketMessageType.Revocation) return this.handleRevocation(websocketMessage);
        if (messageType === WebsocketMessageType.Close) return this.handleClose(websocketMessage);
        if (messageType === WebsocketMessageType.KeepAlive) return this.handleKeepAlive(websocketMessage);
    }
    
    private handleWelcomeMessage(welcomeMessage: WebsocketMessage<WelcomePayload>) {
        const websocketWelcome = welcomeMessage as WebsocketMessage<WelcomePayload>;
        DataStorage.getInstance().websocketId.set(websocketWelcome.payload.session.id);
        this.setupKeepAlive(websocketWelcome.payload.session.keepalive_timeout_seconds * 1000);
        return;
    }

    private handleNotification(websocketNotification: WebsocketMessage<NotificationPayload>) {
        this.updateKeepAliveTimestamp();

        const notification = websocketNotification.payload;
        logger.log(`Received notification: ${JSON.stringify(notification)}`);

        return;
    }

    private handleRevocation(revocationMessage: WebsocketMessage<RevocationPayload>) {
        return;
    }

    private handleClose(closeMessage: WebsocketMessage<any>) {
        if (this.keepAliveInterval !== null) clearInterval(this.keepAliveInterval);
        return;
    }

    private handleKeepAlive(keepAliveMessage: WebsocketMessage<any>) {
        const newKeepAliveTimestamp = Date.now();
        this.updateKeepAliveTimestamp();
        return;
    }

}