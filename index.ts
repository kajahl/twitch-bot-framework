// Main modules
import TwitchBotFramework from './src/TwitchBotFramework';

// Repository patterns
import { ITokenRepository } from './src/storage/repository/Token.repository';

// Predefined strategies
import InMemoryTokenRepository from './src/storage/predefined/InMemoryToken.repository';

// Command interfaces
import {  
    ChatCommandExecutionGuard,
    ChatCommandExecutionGuardAvaliableResults,
    ChatCommandPreExecution,
    ChatCommandExecution, 
    ChatCommandPostExecution, 
    ChatCommandExecutionData,
} from './src/types/ChatCommand.types';

// Listener interfaces
import { 
    ChatListenerExecution, 
    ChatListenerExecutionData
} from './src/types/ChatListener.types';

// Example commands / listeners
import PingCommand from './src/example/commands/Ping.command';
import ExampleCommand from './src/example/commands/Example.command';
import CounterListener from './src/example/listeners/Counter.listener';
import ShowMessageListener from './src/example/listeners/ShowMessage.listener';

// Decorator Types
import { ChatCommand } from './src/decorators/ChatCommand.decorator';
import { ChatListener } from './src/decorators/ChatListener.decorator';
import { ChatCommandDecoratorOptions } from './src/types/ChatCommand.types';
import { ChatListenerDecoratorOptions } from './src/types/ChatListener.types';

// Other Types
import ChannelChatMessageEventData, {
    Message, MessageFragment, Badge, BadgeSetId
} from './src/types/EventSub_Events/ChannelChatMessageEventData.types';

// Export
export default TwitchBotFramework;
export {
    ITokenRepository,
    InMemoryTokenRepository,
    ChatCommandExecutionGuard, ChatCommandExecutionGuardAvaliableResults, ChatCommandPreExecution, ChatCommandExecution, ChatCommandPostExecution, ChatCommandExecutionData,
    ChatListenerExecution, ChatListenerExecutionData,
    ChatCommandDecoratorOptions, ChatListenerDecoratorOptions, ChatCommand, ChatListener,
    PingCommand, ExampleCommand,
    CounterListener, ShowMessageListener,
    ChannelChatMessageEventData, Message, MessageFragment, Badge, BadgeSetId
}