import ChannelChatMessageEventData from './EventSub_Events/ChannelChatMessageEventData.types';

type TorPromiseT<T> = T | Promise<T>;

// Init

export type ChatCommandInstance = ChatCommandExecutionGuard & ChatCommandPreExecution & ChatCommandExecution & ChatCommandPostExecution;

// Decorator

export type ChatCommandDecoratorOptions = {
    commandName: string;
    keyword?: string;
    ignorePrefix?: boolean;
    ignoreCase?: boolean;
    anyMessage?: boolean;
    transistent?: boolean;
};

// Guard

export type ChatCommandExecutionGuard = {
    guard: (...args: any[]) => TorPromiseT<ChatCommandExecutionGuardAvaliableResults>;
};

type ChatCommandExecutionGuardAvaliableResults = ChatCommandExecutionGuardBlockResult | ChatCommandExecutionGuardPassResult;

export type ChatCommandExecutionGuardBlockResult = {
    canAccess: false;
    message?: string;
};

export type ChatCommandExecutionGuardPassResult = {
    canAccess: true;
};

// Execution

export type ChatCommandPreExecution = {
    preExecution: (data: ChatCommandExecutionData, ...args: any[]) => TorPromiseT<any>;
};

export type ChatCommandExecution = {
    execution: (data: ChatCommandExecutionData, ...args: any[]) => TorPromiseT<any>;
};

export type ChatCommandPostExecution = {
    postExecution: (data: ChatCommandExecutionData, ...args: any[]) => TorPromiseT<any>;
};

// Params

export type ChatCommandExecutionData = {
    event: ChannelChatMessageEventData;
};
