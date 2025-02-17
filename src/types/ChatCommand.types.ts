import ChannelChatMessageEventData from './EventSub_Events/ChannelChatMessageEventData.types';

type TorPromiseT<T> = T | Promise<T>;

// Init

export type ChatCommandInstance = ChatCommandExecutionGuard & ChatCommandPreExecution & ChatCommandExecution & ChatCommandPostExecution;

// Decorator

export type ChatCommandDecoratorOptions = {
    name: string;
    keyword: string;
    aliases?: string[];
    ignoreCase?: boolean;
    transistent?: boolean;
};

// Guard

export type ChatCommandExecutionGuard = {
    guard: (data: ChatCommandExecutionData, ...args: any[]) => TorPromiseT<ChatCommandExecutionGuardAvaliableResults>;
};

export type ChatCommandExecutionGuardAvaliableResults = ChatCommandExecutionGuardBlockResult | ChatCommandExecutionGuardPassResult;

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
