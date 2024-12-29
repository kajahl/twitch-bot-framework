/*
ListenChannel repository odpowiedzialny jest za zarządzanie kanałami, na których aplikacja nasłuchuje na zdarzenia.
*/

export type ListenChannelsRepository = {
    getChannelIds(): Promise<string[]>;
};