import TwitchEventId from "../enums/TwitchEventId.enum";
import TwtichPermissionScope from "../enums/TwitchPermissionScope.enum";
import ChannelChatMessageEventData from "./EventSub_Events/ChannelChatMessageEventData.types";


// Conditions
interface BroadcasterAndModeratorUids {
    broadcaster_user_id: string;
    moderator_user_id: string; // Token
}

interface BroadcasterUid {
    broadcaster_user_id: string; // Token
}

interface UserId {
    user_id: string; // Token
}

interface BroadcasterAndUserIds {
    broadcaster_user_id: string;
    user_id: string; // Token
}

interface FromAndToBroadcasterUids {
    from_broadcaster_user_id?: string;
    to_broadcaster_user_id?: string;
}

interface BroadcasterUidWithRewardId {
    broadcaster_user_id: string; 
    reward_id?: string;
}

type AvailableConditions = BroadcasterAndModeratorUids | BroadcasterUid | UserId | BroadcasterAndUserIds | FromAndToBroadcasterUids | BroadcasterUidWithRewardId;

// Event Versions
type Version = 1 | 2 | 'beta';

// Record of event requirements
type TwitchEventRequirementRecord<
    ConditionType extends AvailableConditions,
    RequiredScopes extends TwtichPermissionScope | TwtichPermissionScope[],
    Ver extends Version,
    ResponseData = any,
> = {
    condition: ConditionType;
    requiredScopes: RequiredScopes;
    version: Ver;
    responseData: ResponseData;
};

// Map of event IDs to their requirements
type EventRequirementsMap = {
    [TwitchEventId.AutomodMessageHold]: TwitchEventRequirementRecord<
        BroadcasterAndModeratorUids,
        TwtichPermissionScope.ModeratorManageAutomod,
        1
    >;
    [TwitchEventId.AutomodMessageUpdate]: TwitchEventRequirementRecord<
        BroadcasterAndModeratorUids,
        TwtichPermissionScope.ModeratorManageAutomod,
        1
    >;
    [TwitchEventId.AutomodSettingsUpdate]: TwitchEventRequirementRecord<
        BroadcasterAndModeratorUids,
        TwtichPermissionScope.ModeratorReadAutomodSettings,
        1
    >;
    [TwitchEventId.AutomodTermsUpdate]: TwitchEventRequirementRecord<
        BroadcasterAndModeratorUids,
        TwtichPermissionScope.ModeratorManageAutomod,
        1
    >;
    [TwitchEventId.ChannelUpdate]: TwitchEventRequirementRecord<BroadcasterUid, [], 2>;
    [TwitchEventId.ChannelFollow]: TwitchEventRequirementRecord<
        BroadcasterAndModeratorUids,
        TwtichPermissionScope.ModeratorReadFollowers,
        2
    >;
    [TwitchEventId.ChannelAdBreakBegin]: TwitchEventRequirementRecord<BroadcasterUid, TwtichPermissionScope.ChannelReadAds, 1>;
    [TwitchEventId.ChannelChatClear]: TwitchEventRequirementRecord<BroadcasterAndUserIds, TwtichPermissionScope.UserReadChat, 1>;
    [TwitchEventId.ChannelChatClearUserMessages]: TwitchEventRequirementRecord<
        BroadcasterAndUserIds,
        TwtichPermissionScope.UserReadChat,
        1
    >;
    [TwitchEventId.ChannelChatMessage]: TwitchEventRequirementRecord<
        BroadcasterAndUserIds,
        TwtichPermissionScope.UserReadChat,
        1,
        ChannelChatMessageEventData
    >;
    [TwitchEventId.ChannelChatMessageDelete]: TwitchEventRequirementRecord<
        BroadcasterAndUserIds,
        TwtichPermissionScope.UserReadChat,
        1
    >;
    [TwitchEventId.ChannelChatNotification]: TwitchEventRequirementRecord<BroadcasterAndUserIds, TwtichPermissionScope.UserReadChat, 1>;
    [TwitchEventId.ChannelChatSettingsUpdate]: TwitchEventRequirementRecord<
        BroadcasterAndUserIds,
        TwtichPermissionScope.UserReadChat,
        1
    >;
    [TwitchEventId.ChannelChatUserMessageHold]: TwitchEventRequirementRecord<
        BroadcasterAndUserIds,
        TwtichPermissionScope.UserReadChat,
        1
    >;
    [TwitchEventId.ChannelChatUserMessageUpdate]: TwitchEventRequirementRecord<
        BroadcasterAndUserIds,
        TwtichPermissionScope.UserReadChat,
        1
    >;
    [TwitchEventId.ChannelSubscribe]: TwitchEventRequirementRecord<BroadcasterUid, TwtichPermissionScope.ChannelReadSubscriptions, 1>;
    [TwitchEventId.ChannelSubscriptionEnd]: TwitchEventRequirementRecord<
        BroadcasterUid,
        TwtichPermissionScope.ChannelReadSubscriptions,
        1
    >;
    [TwitchEventId.ChannelSubscriptionGift]: TwitchEventRequirementRecord<
        BroadcasterUid,
        TwtichPermissionScope.ChannelReadSubscriptions,
        1
    >;
    [TwitchEventId.ChannelSubscriptionMessage]: TwitchEventRequirementRecord<
        BroadcasterUid,
        TwtichPermissionScope.ChannelReadSubscriptions,
        1
    >;
    [TwitchEventId.ChannelCheer]: TwitchEventRequirementRecord<BroadcasterUid, TwtichPermissionScope.BitsRead, 1>;
    [TwitchEventId.ChannelRaid]: TwitchEventRequirementRecord<FromAndToBroadcasterUids, [], 1>;
    [TwitchEventId.ChannelBan]: TwitchEventRequirementRecord<BroadcasterUid, TwtichPermissionScope.ChannelModerate, 1>;
    [TwitchEventId.ChannelUnban]: TwitchEventRequirementRecord<BroadcasterUid, TwtichPermissionScope.ChannelModerate, 1>;
    [TwitchEventId.ChannelUnbanRequestCreate]: TwitchEventRequirementRecord<BroadcasterAndUserIds, [], 1>; //TODO: Multiple "OR" scopes
    [TwitchEventId.ChannelUnbanRequestResolve]: TwitchEventRequirementRecord<BroadcasterAndModeratorUids, [], 1>; //TODO: Multiple "OR" scopes
    [TwitchEventId.ChannelModerate]: TwitchEventRequirementRecord<BroadcasterAndModeratorUids, [], 2>; //TODO: Multiple "OR"/"AND" scopes
    [TwitchEventId.ChannelModeratorAdd]: TwitchEventRequirementRecord<BroadcasterUid, TwtichPermissionScope.ModerationRead, 1>;
    [TwitchEventId.ChannelModeratorRemove]: TwitchEventRequirementRecord<BroadcasterUid, TwtichPermissionScope.ModerationRead, 1>;
    // Beta events - skip for now
    // [TwitchEventId.ChannelGuestStarSessionBegin]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelGuestStarSessionEnd]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelGuestStarGuestUpdate]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelGuestStarSettingsUpdate]: TwitchEventRequirementRecord<>;
    // Skipping for now - too complex for this stage of development
    // [TwitchEventId.ChannelChannelPointsAutomaticRewardRedemptionAdd]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>;
    // [TwitchEventId.ChannelChannelPointsCustomRewardAdd]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelChannelPointsCustomRewardUpdate]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelChannelPointsCustomRewardRemove]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelChannelPointsCustomRewardRedemptionAdd]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelChannelPointsCustomRewardRedemptionUpdate]: TwitchEventRequirementRecord<>;
    [TwitchEventId.ChannelPollBegin]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>; //TODO: Multiple "OR" scopes
    [TwitchEventId.ChannelPollProgress]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>; //TODO: Multiple "OR" scopes
    [TwitchEventId.ChannelPollEnd]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>; //TODO: Multiple "OR" scopes
    // Skipping for now - too complex for this stage of development
    // [TwitchEventId.ChannelPredictionBegin]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelPredictionProgress]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelPredictionLock]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelPredictionEnd]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelSuspiciousUserMessage]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelSuspiciousUserUpdate]: TwitchEventRequirementRecord<>;
    [TwitchEventId.ChannelVipAdd]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>; //TODO: Multiple "OR" scopes
    [TwitchEventId.ChannelVipRemove]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>; //TODO: Multiple "OR" scopes
    // Skipping for now - too complex for this stage of development
    // [TwitchEventId.ChannelWarningAcknowledge]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelWarningSend]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelCharityCampaignDonate]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelCharityCampaignStart]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelCharityCampaignProgress]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelCharityCampaignStop]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ConduitShardDisabled]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.DropEntitlementGrant]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ExtensionBitsTransactionCreate]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelGoalBegin]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelGoalProgress]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.ChannelGoalEnd]: TwitchEventRequirementRecord<>;
    [TwitchEventId.ChannelHypeTrainBegin]: TwitchEventRequirementRecord<BroadcasterUid, TwtichPermissionScope.ChannelReadHypeTrain, 1>;
    [TwitchEventId.ChannelHypeTrainProgress]: TwitchEventRequirementRecord<
        BroadcasterUid,
        TwtichPermissionScope.ChannelReadHypeTrain,
        1
    >;
    [TwitchEventId.ChannelHypeTrainEnd]: TwitchEventRequirementRecord<BroadcasterUid, TwtichPermissionScope.ChannelReadHypeTrain, 1>;
    [TwitchEventId.ChannelShieldModeBegin]: TwitchEventRequirementRecord<BroadcasterAndModeratorUids, [], 1>; //TODO: Multiple "OR" scopes
    [TwitchEventId.ChannelShieldModeEnd]: TwitchEventRequirementRecord<BroadcasterAndModeratorUids, [], 1>; //TODO: Multiple "OR" scopes
    [TwitchEventId.ChannelShoutoutCreate]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>; //TODO: Multiple "OR" scopes
    [TwitchEventId.ChannelShoutoutReceive]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>; //TODO: Multiple "OR" scopes
    [TwitchEventId.StreamOnline]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>;
    [TwitchEventId.StreamOffline]: TwitchEventRequirementRecord<BroadcasterUid, [], 1>;
    // Skipping for now
    // [TwitchEventId.UserAuthorizationGrant]: TwitchEventRequirementRecord<>;
    // [TwitchEventId.UserAuthorizationRevoke]: TwitchEventRequirementRecord<>;
    [TwitchEventId.UserUpdate]: TwitchEventRequirementRecord<UserId, TwtichPermissionScope.UserReadEmail, 1>;
    [TwitchEventId.UserWhisperMessage]: TwitchEventRequirementRecord<UserId, [], 1>; // TODO: Multiple "OR" scopes
};

export type MappedTwitchEventId = keyof EventRequirementsMap;
export type TwitchEventData<T extends MappedTwitchEventId> = {
    id: T;
    requiredScopes: EventRequirementsMap[T]['requiredScopes'];
    version: EventRequirementsMap[T]['version'];
    condition: EventRequirementsMap[T]['condition'];
    data: EventRequirementsMap[T]['responseData'];
};

export function getUserIdFromConditions<T extends MappedTwitchEventId>(conditions: TwitchEventData<T>['condition']): string | null {
    if('moderator_user_id' in conditions) return conditions.moderator_user_id;
    if('user_id' in conditions) return conditions.user_id;
    if('broadcaster_user_id' in conditions) return conditions.broadcaster_user_id;
    return null;
}

const eventScopesMap: { [key in MappedTwitchEventId]: TwtichPermissionScope | TwtichPermissionScope[] } = {
    [TwitchEventId.AutomodMessageHold]: TwtichPermissionScope.ModeratorManageAutomod,
    [TwitchEventId.AutomodMessageUpdate]: TwtichPermissionScope.ModeratorManageAutomod,
    [TwitchEventId.AutomodSettingsUpdate]: TwtichPermissionScope.ModeratorReadAutomodSettings,
    [TwitchEventId.AutomodTermsUpdate]: TwtichPermissionScope.ModeratorManageAutomod,
    [TwitchEventId.ChannelUpdate]: [],
    [TwitchEventId.ChannelFollow]: TwtichPermissionScope.ModeratorReadFollowers,
    [TwitchEventId.ChannelAdBreakBegin]: TwtichPermissionScope.ChannelReadAds,
    [TwitchEventId.ChannelChatClear]: TwtichPermissionScope.UserReadChat,
    [TwitchEventId.ChannelChatClearUserMessages]: TwtichPermissionScope.UserReadChat,
    [TwitchEventId.ChannelChatMessage]: TwtichPermissionScope.UserReadChat,
    [TwitchEventId.ChannelChatMessageDelete]: TwtichPermissionScope.UserReadChat,
    [TwitchEventId.ChannelChatNotification]: TwtichPermissionScope.UserReadChat,
    [TwitchEventId.ChannelChatSettingsUpdate]: TwtichPermissionScope.UserReadChat,
    [TwitchEventId.ChannelChatUserMessageHold]: TwtichPermissionScope.UserReadChat,
    [TwitchEventId.ChannelChatUserMessageUpdate]: TwtichPermissionScope.UserReadChat,
    [TwitchEventId.ChannelSubscribe]: TwtichPermissionScope.ChannelReadSubscriptions,
    [TwitchEventId.ChannelSubscriptionEnd]: TwtichPermissionScope.ChannelReadSubscriptions,
    [TwitchEventId.ChannelSubscriptionGift]: TwtichPermissionScope.ChannelReadSubscriptions,
    [TwitchEventId.ChannelSubscriptionMessage]: TwtichPermissionScope.ChannelReadSubscriptions,
    [TwitchEventId.ChannelCheer]: TwtichPermissionScope.BitsRead,
    [TwitchEventId.ChannelRaid]: [],
    [TwitchEventId.ChannelBan]: TwtichPermissionScope.ChannelModerate,
    [TwitchEventId.ChannelUnban]: TwtichPermissionScope.ChannelModerate,
    [TwitchEventId.ChannelUnbanRequestCreate]: [],
    [TwitchEventId.ChannelUnbanRequestResolve]: [],
    [TwitchEventId.ChannelModerate]: [],
    [TwitchEventId.ChannelModeratorAdd]: TwtichPermissionScope.ModerationRead,
    [TwitchEventId.ChannelModeratorRemove]: TwtichPermissionScope.ModerationRead,
    [TwitchEventId.ChannelPollBegin]: [],
    [TwitchEventId.ChannelPollProgress]: [],
    [TwitchEventId.ChannelPollEnd]: [],
    [TwitchEventId.ChannelVipAdd]: [],
    [TwitchEventId.ChannelVipRemove]: [],
    [TwitchEventId.ChannelHypeTrainBegin]: TwtichPermissionScope.ChannelReadHypeTrain,
    [TwitchEventId.ChannelHypeTrainProgress]: TwtichPermissionScope.ChannelReadHypeTrain,
    [TwitchEventId.ChannelHypeTrainEnd]: TwtichPermissionScope.ChannelReadHypeTrain,
    [TwitchEventId.ChannelShieldModeBegin]: [],
    [TwitchEventId.ChannelShieldModeEnd]: [],
    [TwitchEventId.ChannelShoutoutCreate]: [],
    [TwitchEventId.ChannelShoutoutReceive]: [],
    [TwitchEventId.StreamOnline]: [],
    [TwitchEventId.StreamOffline]: [],
    [TwitchEventId.UserUpdate]: TwtichPermissionScope.UserReadEmail,
    [TwitchEventId.UserWhisperMessage]: [],
};

export function getScopesForEvent<T extends MappedTwitchEventId>(eventId: T): EventRequirementsMap[T]['requiredScopes'] {
    const scopes = eventScopesMap[eventId];
    if (!scopes) {
        throw new Error(`Unknown event ID: ${eventId}`);
    }
    return scopes as EventRequirementsMap[T]['requiredScopes'];
}