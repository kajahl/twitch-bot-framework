// Main modules
import TwitchBotFramework from './/TwitchBotFramework';

// Repository patterns
import { ListenChannelsRepository } from './/storage/repository/ListenChannels.repository';
import { TokenRepository } from './/storage/repository/Token.repository';

// Predefined strategies
import InMemoryTokenRepository from './/storage/predefined/InMemoryToken.repository';

// Twitch objects
import Chat from './/objects/Chat';
import User from './/objects/User';

// Command interfaces
import {  
    ChatCommandExecutionGuard,
    ChatCommandExecutionGuardAvaliableResults,
    ChatCommandPreExecution,
    ChatCommandExecution, 
    ChatCommandPostExecution, 
    ChatCommandExecutionData,
} from './/types/ChatCommand.types';

// Listener interfaces
import { 
    ChatListenerExecution, 
    ChatListenerExecutionData
} from './/types/ChatListener.types';

// Example commands / listeners
import PingCommand from './/example/commands/Ping.command';
import ExampleCommand from './/example/commands/Example.command';
import CounterListener from './/example/listeners/Counter.listener';
import ShowMessageListener from './/example/listeners/ShowMessage.listener';

// Decorator Types
import { ChatCommand } from './storage/decorators/ChatCommand.decorator';
import { ChatListener } from './storage/decorators/ChatListener.decorator';
import { ChatCommandDecoratorOptions } from './/types/ChatCommand.types';
import { ChatListenerDecoratorOptions } from './/types/ChatListener.types';

// Other Types
import ChannelChatMessageEventData, {
    Message, MessageFragment, Badge, BadgeSetId
} from './/types/EventSub_Events/ChannelChatMessageEventData.types';

// Export
export default TwitchBotFramework;
export {
    ListenChannelsRepository, TokenRepository,
    InMemoryTokenRepository,
    Chat, User,
    ChatCommandExecutionGuard, ChatCommandExecutionGuardAvaliableResults, ChatCommandPreExecution, ChatCommandExecution, ChatCommandPostExecution, ChatCommandExecutionData,
    ChatListenerExecution, ChatListenerExecutionData,
    ChatCommandDecoratorOptions, ChatListenerDecoratorOptions, ChatCommand, ChatListener,
    PingCommand, ExampleCommand,
    CounterListener, ShowMessageListener,
    ChannelChatMessageEventData, Message, MessageFragment, Badge, BadgeSetId
}