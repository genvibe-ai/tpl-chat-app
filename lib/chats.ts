/**
 * Read-side helpers: the sample chats from content.ts merged with what
 * changed on this device (lib/store.ts).
 */
import { useMemo } from "react";
import {
  chats as seeds,
  formatTime,
  me,
  people,
  type ChatSeed,
  type Message,
  type Person,
  type Reaction,
} from "@/constants/content";
import { useStore, type LocalChat } from "./store";

export const PEOPLE: Record<string, Person> = Object.fromEntries(people.map((person) => [person.id, person]));
const SEEDS: Record<string, ChatSeed> = Object.fromEntries(seeds.map((chat) => [chat.id, chat]));
const SEED_ORDER: Record<string, number> = Object.fromEntries(seeds.map((chat, index) => [chat.id, index]));

/** You, shaped like a contact (for avatars and names). */
export const ME: Person = { id: me.id, name: me.name, first: me.first, avatar: me.avatar, about: me.about };

export function personFor(id: string): Person | undefined {
  return id === "me" ? ME : PEOPLE[id];
}

export type ChatInfo = {
  id: string;
  group: boolean;
  title: string;
  members: Person[];
  /** The other person in a one-to-one chat. */
  person?: Person;
  emoji?: string;
  seed?: ChatSeed;
};

/** A sample chat, or a new one-to-one chat with any contact (its id is the person's id). */
export function chatInfo(id: string | undefined): ChatInfo | null {
  if (!id) return null;
  const seed = SEEDS[id];
  if (seed) {
    const members = seed.people.map((personId) => PEOPLE[personId]).filter(Boolean);
    if (!members.length) return null;
    const group = members.length > 1;
    return {
      id,
      group,
      title: group ? (seed.title ?? members.map((m) => m.first).join(", ")) : members[0].name,
      members,
      person: group ? undefined : members[0],
      emoji: seed.emoji,
      seed,
    };
  }
  const person = PEOPLE[id];
  return person ? { id, group: false, title: person.name, members: [person], person } : null;
}

/** Sample messages plus the ones added here, with everyone's reactions merged in. */
export function messagesFor(info: ChatInfo, local: LocalChat | undefined): Message[] {
  const all = [...(info.seed?.messages ?? []), ...(local?.added ?? [])];
  return all.map((message) => {
    const others = (message.reactions ?? []).filter((r) => r.from !== "me");
    const sampleMine = message.reactions?.find((r) => r.from === "me")?.emoji;
    const override = local?.mine?.[message.id];
    const mine = override === undefined ? sampleMine : override;
    const reactions: Reaction[] = mine ? [...others, { emoji: mine, from: "me" }] : others;
    return reactions.length || message.reactions ? { ...message, reactions } : message;
  });
}

export function unreadFor(info: ChatInfo, local: LocalChat | undefined) {
  const sample = local?.read ? 0 : (info.seed?.unread ?? 0);
  return sample + (local?.unread ?? 0);
}

export const isPinned = (info: ChatInfo, local?: LocalChat) => local?.pinned ?? info.seed?.pinned ?? false;
export const isMuted = (info: ChatInfo, local?: LocalChat) => local?.muted ?? info.seed?.muted ?? false;

export type InboxItem = {
  info: ChatInfo;
  messages: Message[];
  last?: Message;
  unread: number;
  pinned: boolean;
  muted: boolean;
  time: string;
  typing?: string;
};

/** Every chat for the inbox: sample chats plus new chats that have messages. */
export function useInbox(): InboxItem[] {
  const local = useStore((state) => state.chats);
  const typing = useStore((state) => state.typing);
  return useMemo(() => {
    const ids = [...seeds.map((chat) => chat.id)];
    for (const [id, chat] of Object.entries(local)) if (!SEEDS[id] && chat.added?.length) ids.push(id);
    const items: (InboxItem & { activity: number; order: number })[] = [];
    for (const id of ids) {
      const info = chatInfo(id);
      if (!info) continue;
      const mine = local[id];
      const messages = messagesFor(info, mine);
      const last = messages[messages.length - 1];
      const activity = mine?.added?.length ? (mine.activity ?? 0) : 0;
      items.push({
        info,
        messages,
        last,
        unread: unreadFor(info, mine),
        pinned: isPinned(info, mine),
        muted: isMuted(info, mine),
        time: activity ? formatTime(new Date(activity)) : (info.seed?.time ?? ""),
        typing: typing[id],
        activity,
        order: SEED_ORDER[id] ?? Number.MAX_SAFE_INTEGER,
      });
    }
    // Chats with new messages first (newest on top), then the sample order.
    items.sort((a, b) => b.activity - a.activity || a.order - b.order);
    return items;
  }, [local, typing]);
}

/** One chat's info, messages and state, for the conversation screen. */
export function useChat(id: string) {
  const info = useMemo(() => chatInfo(id), [id]);
  const local = useStore((state) => state.chats[id]);
  const typing = useStore((state) => state.typing[id]);
  const messages = useMemo(() => (info ? messagesFor(info, local) : []), [info, local]);
  return {
    info,
    messages,
    typing,
    pinned: info ? isPinned(info, local) : false,
    muted: info ? isMuted(info, local) : false,
    unread: info ? unreadFor(info, local) : 0,
  };
}

/**
 * Emoji-only messages (up to three) are shown large, without a bubble.
 * Checked by code point: regex Unicode property escapes are not safe on every
 * JavaScript engine the app runs on.
 */
export function isEmojiOnly(text?: string) {
  if (!text) return false;
  const chars = Array.from(text.trim());
  if (!chars.length || chars.length > 20) return false;
  let count = 0;
  let joined = false;
  let flagHalf = false;
  for (const char of chars) {
    const cp = char.codePointAt(0) ?? 0;
    if (cp === 0x200d) {
      joined = true; // zero-width joiner: the next picture is part of this emoji
      continue;
    }
    if (cp === 0xfe0f || cp === 0x20e3 || (cp >= 0x1f3fb && cp <= 0x1f3ff) || char === " ") continue;
    const regional = cp >= 0x1f1e6 && cp <= 0x1f1ff;
    const picture =
      regional ||
      (cp >= 0x1f000 && cp <= 0x1faff) ||
      (cp >= 0x2600 && cp <= 0x27bf) ||
      (cp >= 0x2b00 && cp <= 0x2bff) ||
      (cp >= 0x2190 && cp <= 0x21ff) ||
      cp === 0x00a9 ||
      cp === 0x00ae;
    if (!picture) return false;
    // A flag is two regional letters; count it once.
    const continuesFlag = regional && flagHalf;
    flagHalf = regional && !flagHalf;
    if (!joined && !continuesFlag) count += 1;
    joined = false;
  }
  return count > 0 && count <= 3;
}
