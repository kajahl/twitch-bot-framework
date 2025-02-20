import { Inject } from "typedi";
import DINames from "../utils/DI.names";
import { Logger, LoggerFactory } from "../utils/Logger";
import { ChatDataType, ChatDataTypeMap } from "../types/ChatDataInjector.types";
import ChannelChatMessageEventData from "../types/EventSub_Events/ChannelChatMessageEventData.types";
import TwitchUser from "../objects/TwitchUser.object";
import {ChatMessage, TwitchChatMessage} from "../objects/ChatMessage.object";

export default class ChatDataInjectorService {
    private readonly logger: Logger;

    constructor(
        @Inject(DINames.LoggerFactory) loggerFactory: LoggerFactory
    ) {
        this.logger = loggerFactory.createLogger('ChatDataInjector');
        this.logger.debug('Initialized');
    }

    private getChatData<T extends ChatDataType>(
        type: T,
        data: ChannelChatMessageEventData
    ): ChatDataTypeMap[T] {
        const dataMaps: { [key in ChatDataType]: (data: ChannelChatMessageEventData) => any } = {
            [ChatDataType.RAW]: (data: ChannelChatMessageEventData) => data,
            [ChatDataType.SENDER]: (data: ChannelChatMessageEventData) => new TwitchUser(data.chatter_user_id),
            [ChatDataType.BROADCASTER]: (data: ChannelChatMessageEventData) => new TwitchUser(data.broadcaster_user_id),
            [ChatDataType.MESSAGE_DATA]: (data: ChannelChatMessageEventData) => new ChatMessage(data),
            [ChatDataType.MESSAGE]: (data: ChannelChatMessageEventData) => new TwitchChatMessage(data)
        };

        const mappedData = dataMaps[type](data);
        this.logger.debug(`Mapped data for ${type}: ${mappedData}`);
        return mappedData;
    }

    async injectParameters(target: any, methodName: string, data: ChannelChatMessageEventData) {
        const paramMetadata = Reflect.getMetadataKeys(target, methodName)
            .filter((key: string) => Object.values(ChatDataType).includes(key as ChatDataType))
            .reduce((acc: any, key: string) => {
                acc[key] = Reflect.getMetadata(key, target, methodName) || [];
                return acc;
            }, {});

        this.logger.debug(`Injecting parameters for ${methodName} with metadata: ${JSON.stringify(paramMetadata
        )}`);

        const args = Object.keys(paramMetadata).flatMap((key: string) => {
            const type = key as ChatDataType;
            return paramMetadata[key].map((paramIndex: number) => {
                return this.getChatData(type, data);
            });
        });

        return args.reverse();
    }
}