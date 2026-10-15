/**
 * The app's state. Sample chats always come fresh from constants/content.ts;
 * this store only keeps what changed on this device: messages sent and
 * received here, your reactions, read/pinned/muted overrides, stories you
 * watched and your settings. Saved with AsyncStorage (see lib/storage.ts).
 */
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { me, type Message, type Reaction } from "@/constants/content";
import { safeStorage } from "./storage";

export type Appearance = "system" | "light" | "dark";

export type Settings = {
  appearance: Appearance;
  readReceipts: boolean;
  previews: boolean;
  typingIndicators: boolean;
  haptics: boolean;
};

/** What changed in one chat on this device. */
export type LocalChat = {
  /** Messages sent or received in the app, after the sample ones. */
  added?: Message[];
  /** Your reaction per message id; null removes a sample reaction of yours. */
  mine?: Record<string, string | null>;
  /** The sample unread messages were read. */
  read?: boolean;
  /** Replies that arrived while the chat was closed (or "Mark as unread"). */
  unread?: number;
  pinned?: boolean;
  muted?: boolean;
  /** When the last message was added here (ms), to sort the inbox. */
  activity?: number;
};

type Saved = {
  chats: Record<string, LocalChat>;
  storiesSeen: string[];
  storiesLiked: string[];
  status: number;
  settings: Settings;
};

type State = Saved & {
  /** Who is typing in which chat (not saved). */
  typing: Record<string, string>;
  /** The chat on screen, so replies there do not count as unread (not saved). */
  openChat: string | null;
  append: (chatId: string, message: Message) => void;
  addTheirReaction: (chatId: string, messageId: string, reaction: Reaction) => void;
  setMyReaction: (chatId: string, messageId: string, emoji: string | null) => void;
  markRead: (chatId: string) => void;
  markUnread: (chatId: string) => void;
  setPinned: (chatId: string, pinned: boolean) => void;
  setMuted: (chatId: string, muted: boolean) => void;
  clearAdded: (chatId: string) => void;
  setTyping: (chatId: string, personId: string | null) => void;
  setOpenChat: (chatId: string | null) => void;
  seeStory: (personId: string) => void;
  toggleStoryLike: (personId: string) => void;
  nextStatus: () => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSamples: () => void;
};

export const defaultSettings: Settings = {
  appearance: "system",
  readReceipts: true,
  previews: true,
  typingIndicators: true,
  haptics: true,
};

const empty: Saved = {
  chats: {},
  storiesSeen: [],
  storiesLiked: [],
  status: 0,
  settings: defaultSettings,
};

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const patch = (chatId: string, change: (chat: LocalChat) => LocalChat) =>
        set((state) => ({ chats: { ...state.chats, [chatId]: change(state.chats[chatId] ?? {}) } }));
      return {
        ...empty,
        typing: {},
        openChat: null,
        append: (chatId, message) =>
          patch(chatId, (chat) => {
            const fromMe = message.from === "me";
            const open = get().openChat === chatId;
            return {
              ...chat,
              added: [...(chat.added ?? []), message],
              activity: Date.now(),
              // Writing in a chat means you have read it.
              read: fromMe || open ? true : chat.read,
              unread: fromMe || open ? 0 : (chat.unread ?? 0) + 1,
            };
          }),
        addTheirReaction: (chatId, messageId, reaction) =>
          patch(chatId, (chat) => ({
            ...chat,
            added: (chat.added ?? []).map((message) =>
              message.id === messageId
                ? { ...message, reactions: [...(message.reactions ?? []), reaction] }
                : message,
            ),
          })),
        setMyReaction: (chatId, messageId, emoji) =>
          patch(chatId, (chat) => ({ ...chat, mine: { ...chat.mine, [messageId]: emoji } })),
        markRead: (chatId) => {
          const chat = get().chats[chatId];
          if (chat?.read && !chat.unread) return;
          patch(chatId, (current) => ({ ...current, read: true, unread: 0 }));
        },
        markUnread: (chatId) => patch(chatId, (chat) => ({ ...chat, unread: Math.max(1, chat.unread ?? 0) })),
        setPinned: (chatId, pinned) => patch(chatId, (chat) => ({ ...chat, pinned })),
        setMuted: (chatId, muted) => patch(chatId, (chat) => ({ ...chat, muted })),
        clearAdded: (chatId) => patch(chatId, (chat) => ({ ...chat, added: [], activity: undefined })),
        setTyping: (chatId, personId) =>
          set((state) => {
            const typing = { ...state.typing };
            if (personId) typing[chatId] = personId;
            else delete typing[chatId];
            return { typing };
          }),
        setOpenChat: (chatId) => set({ openChat: chatId }),
        seeStory: (personId) =>
          set((state) =>
            state.storiesSeen.includes(personId) ? state : { storiesSeen: [...state.storiesSeen, personId] },
          ),
        toggleStoryLike: (personId) =>
          set((state) => ({
            storiesLiked: state.storiesLiked.includes(personId)
              ? state.storiesLiked.filter((id) => id !== personId)
              : [...state.storiesLiked, personId],
          })),
        nextStatus: () => set((state) => ({ status: (state.status + 1) % me.statuses.length })),
        setSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
        resetSamples: () =>
          set((state) => ({ chats: {}, storiesSeen: [], storiesLiked: [], typing: {}, settings: state.settings })),
      };
    },
    {
      name: "parlo-state",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ chats, storiesSeen, storiesLiked, status, settings }): Saved => ({
        chats,
        storiesSeen,
        storiesLiked,
        status,
        settings,
      }),
      // Settings added in later versions get their defaults.
      merge: (saved, current) => {
        const data = (saved ?? {}) as Partial<Saved>;
        return {
          ...current,
          ...data,
          settings: { ...defaultSettings, ...data.settings },
          status: Math.min(Math.max(0, data.status ?? 0), me.statuses.length - 1),
        };
      },
    },
  ),
);

/** True once saved state has loaded (or failed to), so the first frame is the real inbox. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated());
  useEffect(() => {
    const done = () => setHydrated(true);
    const unsubscribe = useStore.persist.onFinishHydration(done);
    if (useStore.persist.hasHydrated()) done();
    // A storage that never answers must not keep the app on the splash screen.
    const fallback = setTimeout(done, 1500);
    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, []);
  return hydrated;
}

let sequence = 0;
/** A unique id for a message created in the app. */
export function localId() {
  sequence += 1;
  return `local-${Date.now().toString(36)}-${sequence}`;
}
