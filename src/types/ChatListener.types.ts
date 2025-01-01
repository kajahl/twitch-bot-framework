import ChannelChatMessageEventData from './EventSub_Events/ChannelChatMessageEventData.types';

type TorPromiseT<T> = T | Promise<T>;

// Init

export type ChatListenerInstance = ChatListenerExecution;

// Decorator

export type ChatListenerDecoratorOptions = {
    name: string;
    transient?: boolean;
};

// Execution

export type ChatListenerExecution = {
    execution: (data: ChatListenerExecutionData, ...args: any[]) => TorPromiseT<any>;
};

// Params

export type ChatListenerExecutionData = {
    event: ChannelChatMessageEventData;
};
