export enum ChatDataType {
    RAW = 'RAW_DATA',
    SENDER = 'USER',
    CHAT = 'CHAT',
    CHANNEL = 'CHANNEL',
}

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
const Sender = CreateChatDataDecorator(ChatDataType.SENDER);
const Chat = CreateChatDataDecorator(ChatDataType.CHAT);
const Channel = CreateChatDataDecorator(ChatDataType.CHANNEL);

export { Raw, Channel, Chat, Sender };