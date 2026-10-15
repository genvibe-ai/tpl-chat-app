/**
 * Sending, and the friendly fake on the other side: a moment after you send,
 * the other person starts typing and answers with a line from
 * `replies` in constants/content.ts. Timers live here, outside any screen, so
 * a reply still arrives (with an unread badge) if you go back to Chats.
 */
import { formatTime, replies, type Message, type PhotoId } from "@/constants/content";
import { chatInfo, isEmojiOnly } from "./chats";
import { haptics } from "./haptics";
import { localId, useStore } from "./store";

const pending = new Map<string, ReturnType<typeof setTimeout>[]>();

function cancel(chatId: string) {
  pending.get(chatId)?.forEach(clearTimeout);
  pending.delete(chatId);
}

/** Stops every reply in flight (used when the sample chats are reset). */
export function cancelAllReplies() {
  for (const chatId of [...pending.keys()]) cancel(chatId);
  const { typing, setTyping } = useStore.getState();
  for (const chatId of Object.keys(typing)) setTyping(chatId, null);
}

/** Adds your message to the chat and lines up a reply. */
export function sendMessage(chatId: string, draft: { text?: string; photo?: PhotoId }) {
  const text = draft.text?.trim();
  if (!text && !draft.photo) return;
  const message: Message = {
    id: localId(),
    from: "me",
    text: text || undefined,
    photo: draft.photo,
    day: "Today",
    time: formatTime(new Date()),
  };
  useStore.getState().append(chatId, message);
  scheduleReply(chatId, message);
}

const pick = (lines: string[], index: number) => lines[index % lines.length];

function chooseReply(personId: string, sent: Message, count: number) {
  if (sent.photo) return pick(replies.photo, count);
  if (isEmojiOnly(sent.text)) return pick(replies.emoji, count);
  const text = (sent.text ?? "").toLowerCase();
  const words = text.split(/[^a-z0-9']+/).filter(Boolean);
  for (const rule of replies.keywords) {
    if (rule.words.some((word) => words.includes(word) || (!/^[a-z]+$/.test(word) && text.includes(word)))) {
      return pick(rule.replies, count);
    }
  }
  return pick(replies.byPerson[personId] ?? replies.anyone, count);
}

function scheduleReply(chatId: string, sent: Message) {
  const info = chatInfo(chatId);
  if (!info) return;
  // One reply per burst: a new message restarts the clock.
  cancel(chatId);
  const added = useStore.getState().chats[chatId]?.added ?? [];
  const mineSoFar = added.filter((m) => m.from === "me").length;
  const responder = info.members[(mineSoFar - 1 + info.members.length) % info.members.length];
  const answered = added.filter((m) => m.from === responder.id).length;
  const text = chooseReply(responder.id, sent, answered);
  const { startTyping, perCharacter, shortest, longest } = replies.timing;
  const typingFor = Math.min(longest, Math.max(shortest, text.length * perCharacter));

  const startTimer = setTimeout(() => useStore.getState().setTyping(chatId, responder.id), startTyping);
  const replyTimer = setTimeout(() => {
    pending.delete(chatId);
    const store = useStore.getState();
    store.setTyping(chatId, null);
    if (sent.photo) store.addTheirReaction(chatId, sent.id, { emoji: replies.photoReaction, from: responder.id });
    store.append(chatId, {
      id: localId(),
      from: responder.id,
      text,
      day: "Today",
      time: formatTime(new Date()),
    });
    if (useStore.getState().openChat === chatId) haptics.select();
  }, startTyping + typingFor);
  pending.set(chatId, [startTimer, replyTimer]);
}
