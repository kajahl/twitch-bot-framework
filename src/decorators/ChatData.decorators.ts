import { ChatDataType } from "../types/ChatDataInjector.types";

function CreateChatDataDecorator(type: ChatDataType) {
    return function (): ParameterDecorator {
        return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
            if (propertyKey === undefined) return;
            const existingRequiredParameters: number[] =
                Reflect.getOwnMetadata(type, target.constructor.prototype, propertyKey) || [];
            existingRequiredParameters.push(parameterIndex);
            Reflect.defineMetadata(type, existingRequiredParameters, target.constructor.prototype, propertyKey);
            extractDataAccess(type, target, propertyKey);
        };
    };
}

export function extractDataAccess(type: ChatDataType, target: any, propertyKey: string | symbol) {
    const metadata: number[] = Reflect.getOwnMetadata(type, target.constructor.prototype, propertyKey) || [];
    return metadata;
}

const Raw = CreateChatDataDecorator(ChatDataType.RAW);
const SenderData = CreateChatDataDecorator(ChatDataType.SENDER_DATA);
const Sender = CreateChatDataDecorator(ChatDataType.SENDER);
const BroadcasterData = CreateChatDataDecorator(ChatDataType.BROADCASTER_DATA);
const Broadcaster = CreateChatDataDecorator(ChatDataType.BROADCASTER);
const MessageData = CreateChatDataDecorator(ChatDataType.MESSAGE_DATA);
const Mess = CreateChatDataDecorator(ChatDataType.MESSAGE);
const MessageUser = CreateChatDataDecorator(ChatDataType.MESSAGE_USER);
const OptionsProvider = CreateChatDataDecorator(ChatDataType.OPTIONS_PROVIDER);
const ChannelOptions = CreateChatDataDecorator(ChatDataType.CHANNEL_OPTIONS);

export { 
    Raw, 
    SenderData, Sender, 
    MessageUser,
    BroadcasterData, Broadcaster,
    MessageData, Mess,
    OptionsProvider, ChannelOptions
};