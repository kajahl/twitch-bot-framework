// Main modules
import TwitchBotFramework from './src/TwitchBotFramework';

// Repository patterns
import { ITokenRepository } from './src/types/Token.repository.types';

// Predefined strategies
import InMemoryTokenRepository from './src/example/repositories/InMemoryToken.repository';

// Command interfaces
import {  
    ChatCommandExecutionGuard,
    ChatCommandExecutionGuardAvaliableResults,
    ChatCommandPreExecution,
    ChatCommandExecution, 
    ChatCommandPostExecution
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
import ChannelChatMessageEventData from './src/types/EventSub_Events/ChannelChatMessageEventData.types';
import { Message, MessageFragment } from './src/types/twitch/ChatMessage.types';
import { Badge, BadgeSetId } from './src/types/twitch/TwitchUser.types';

// Export
export default TwitchBotFramework;
export {
    ITokenRepository,
    InMemoryTokenRepository,
    ChatCommandExecutionGuard, ChatCommandExecutionGuardAvaliableResults, ChatCommandPreExecution, ChatCommandExecution, ChatCommandPostExecution,
    ChatListenerExecution, ChatListenerExecutionData,
    ChatCommandDecoratorOptions, ChatListenerDecoratorOptions, ChatCommand, ChatListener,
    PingCommand, ExampleCommand,
    CounterListener, ShowMessageListener,
    ChannelChatMessageEventData, Message, MessageFragment, Badge, BadgeSetId
}