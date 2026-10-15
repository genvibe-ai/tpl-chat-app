/**
 * A conversation: the header, then one big rounded panel the messages live
 * in, and the floating composer. Sending adds your message here and a reply
 * follows (lib/replies.ts).
 */
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy, type Message } from "@/constants/content";
import { Radius, Space, Type } from "@/constants/theme";
import { useAppWidth } from "@/hooks/useAppWidth";
import { personFor, useChat, type ChatInfo } from "@/lib/chats";
import { haptics } from "@/lib/haptics";
import { pointer } from "@/lib/pointer";
import { sendMessage } from "@/lib/replies";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { showToast } from "@/lib/toast";
import { ActionSheet } from "../ui/ActionSheet";
import { ChatAvatar } from "../ui/ChatAvatar";
import { PressScale } from "../ui/PressScale";
import { Bubble, BubbleBody, type BubbleRect } from "./Bubble";
import { ChatScroll } from "./ChatScroll";
import { Composer } from "./Composer";
import { ReactionPicker } from "./ReactionPicker";
import { THREAD_NAV_H, ThreadHeader } from "./ThreadHeader";
import { TypingBubble } from "./TypingBubble";

function EmptyChat({ info, onStart }: { info: ChatInfo; onStart: (text: string) => void }) {
  const t = useTheme();
  const name = info.person?.first ?? info.title;
  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.empty}>
      <ChatAvatar info={info} size={88} showOnline={false} />
      <Text style={[Type.name, { color: t.label, fontSize: 19 }]}>{copy.thread.emptyTitle(name)}</Text>
      <Text style={[Type.preview, { color: t.secondary, textAlign: "center" }]}>{copy.thread.emptyBody}</Text>
      <View style={styles.starters}>
        {copy.thread.starters.map((starter) => (
          <PressScale
            key={starter}
            label={starter}
            onPress={() => onStart(starter)}
            style={[styles.starter, { backgroundColor: t.chip }]}
          >
            <Text style={[Type.meta, { color: t.label, fontWeight: "600" }]}>{starter}</Text>
          </PressScale>
        ))}
      </View>
    </Animated.View>
  );
}

export function ThreadScreen({ info }: { info: ChatInfo }) {
  const id = info.id;
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const width = useAppWidth();
  const { messages, typing, pinned, muted } = useChat(id);
  const readReceipts = useStore((state) => state.settings.readReceipts);
  const typingIndicators = useStore((state) => state.settings.typingIndicators);
  const hasAdded = useStore((state) => !!state.chats[id]?.added?.length);
  const [composerHeight, setComposerHeight] = useState(0);
  const [picker, setPicker] = useState<{ message: Message; rect: BubbleRect } | null>(null);
  const [menu, setMenu] = useState(false);
  const root = useRef<View>(null);
  const list = useRef<ScrollView>(null);
  const positioned = useRef(false);
  const openedAt = useRef(Date.now());
  // Messages already here when the screen opened do not animate in.
  const [initialIds] = useState(() => new Set(messages.map((m) => m.id)));

  // While open, replies here are read as they arrive.
  useFocusEffect(
    useCallback(() => {
      const store = useStore.getState();
      store.setOpenChat(id);
      store.markRead(id);
      return () => {
        if (useStore.getState().openChat === id) useStore.getState().setOpenChat(null);
      };
    }, [id]),
  );

  const scrollToEnd = useCallback((animated = true) => {
    requestAnimationFrame(() => list.current?.scrollToEnd({ animated }));
  }, []);

  // Once the composer has its height, the end of the list is known.
  useEffect(() => {
    if (composerHeight === 0) return;
    const timers = [60, 250].map((ms) => setTimeout(() => list.current?.scrollToEnd({ animated: false }), ms));
    return () => timers.forEach(clearTimeout);
  }, [composerHeight]);

  const typist = typing && typingIndicators ? personFor(typing) : undefined;
  useEffect(() => {
    if (positioned.current) scrollToEnd();
  }, [messages.length, typist, scrollToEnd]);

  const rows = useMemo(
    () =>
      messages.map((message, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];
        const newDay = !prev || prev.day !== message.day;
        const first = newDay || prev.from !== message.from;
        const last = !next || next.from !== message.from || next.day !== message.day;
        return {
          message,
          first,
          last,
          day: newDay ? copy.thread.daySeparator(message.day, message.time) : null,
        };
      }),
    [messages],
  );

  const lastMessage = messages[messages.length - 1];
  const receipt =
    lastMessage?.from === "me"
      ? readReceipts && (!lastMessage.id.startsWith("local-") || typing)
        ? copy.thread.read
        : copy.thread.delivered
      : null;

  const myReaction = (message: Message) => message.reactions?.find((r) => r.from === "me")?.emoji;
  const react = (message: Message, emoji: string | null) => {
    useStore.getState().setMyReaction(id, message.id, emoji);
  };

  const onLongPress = useCallback((message: Message, rect: BubbleRect) => {
    // Window coordinates → coordinates inside this screen (the app may be a centred column on the web).
    root.current?.measureInWindow((x, y) => setPicker({ message, rect: { ...rect, x: rect.x - x, y: rect.y - y } }));
  }, []);
  const onDoubleTap = useCallback(
    (message: Message) => {
      haptics.light();
      const current = message.reactions?.find((r) => r.from === "me")?.emoji;
      useStore.getState().setMyReaction(id, message.id, current === "❤️" ? null : "❤️");
    },
    [id],
  );
  const onOpenPhoto = useCallback(
    (message: Message) => router.push({ pathname: "/photo", params: { chat: id, message: message.id } }),
    [id],
  );
  const onPressReactions = useCallback(
    (message: Message) => {
      const mine = message.reactions?.find((r) => r.from === "me")?.emoji;
      const theirs = message.reactions?.find((r) => r.from !== "me")?.emoji;
      haptics.select();
      useStore.getState().setMyReaction(id, message.id, mine ? null : (theirs ?? "❤️"));
    },
    [id],
  );

  const panelTop = insets.top + THREAD_NAV_H + Space[1];
  const maxBubble = Math.round(width * 0.74);

  return (
    <View ref={root} collapsable={false} style={[styles.root, { backgroundColor: t.bg }]}>
      <ThreadHeader info={info} typing={typing} muted={muted} insetTop={insets.top} onMore={() => setMenu(true)} />

      {/* The panel: one big rounded card the conversation lives in. */}
      <View style={[styles.panel, { top: panelTop, backgroundColor: t.surface }]}>
        <LinearGradient colors={[t.surface, t.panelEnd]} style={StyleSheet.absoluteFill} />
        <View style={[styles.grabberWrap, pointer.none]}>
          <View style={[styles.grabber, { backgroundColor: t.hairline }]} />
        </View>
        <ChatScroll
          ref={list as never}
          offset={insets.bottom}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            // Open on the latest message, and stay there while photos and the composer settle.
            if (composerHeight === 0) return;
            if (positioned.current && Date.now() - openedAt.current > 1000) return;
            positioned.current = true;
            scrollToEnd(false);
          }}
          contentContainerStyle={{ paddingTop: Space[6], paddingBottom: composerHeight + Space[3], flexGrow: 1 }}
        >
          {messages.length === 0 ? (
            <EmptyChat info={info} onStart={(text) => sendMessage(id, { text })} />
          ) : (
            rows.map(({ message, first, last, day }) => {
              const mine = message.from === "me";
              return (
                <View key={message.id}>
                  {day && <Text style={[Type.caption, styles.day, { color: t.secondary }]}>{day}</Text>}
                  <Bubble
                    message={message}
                    sender={mine ? undefined : personFor(message.from)}
                    mine={mine}
                    first={first}
                    last={last}
                    showName={info.group && !mine && first}
                    maxWidth={maxBubble}
                    animate={!initialIds.has(message.id)}
                    onLongPress={onLongPress}
                    onDoubleTap={onDoubleTap}
                    onOpenPhoto={onOpenPhoto}
                    onPressReactions={onPressReactions}
                  />
                </View>
              );
            })
          )}
          {receipt && (
            <Animated.Text
              key={receipt}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(100)}
              style={[Type.caption, styles.receipt, { color: t.secondary }]}
            >
              {receipt}
            </Animated.Text>
          )}
          {typist && <TypingBubble person={typist} />}
        </ChatScroll>
      </View>

      <Composer
        insetBottom={insets.bottom}
        onHeight={setComposerHeight}
        onSend={(text) => sendMessage(id, { text })}
        onSendPhoto={(photo) => sendMessage(id, { photo })}
      />

      {picker && (
        <ReactionPicker
          rect={picker.rect}
          mine={picker.message.from === "me"}
          current={myReaction(picker.message)}
          width={width}
          preview={(() => {
            const row = rows.find((r) => r.message.id === picker.message.id);
            return (
              <BubbleBody
                message={picker.message}
                mine={picker.message.from === "me"}
                first={row?.first ?? true}
                last={row?.last ?? true}
                maxWidth={maxBubble}
              />
            );
          })()}
          onClose={() => setPicker(null)}
          onPick={(emoji) => {
            react(picker.message, myReaction(picker.message) === emoji ? null : emoji);
            setPicker(null);
          }}
        />
      )}

      <ActionSheet
        open={menu}
        title={info.title}
        cancelLabel={copy.thread.options.cancel}
        onClose={() => setMenu(false)}
        actions={[
          {
            label: pinned ? copy.thread.options.unpin : copy.thread.options.pin,
            icon: pinned ? "unpin" : "pin",
            onPress: () => {
              useStore.getState().setPinned(id, !pinned);
              showToast(pinned ? copy.toasts.unpinned : copy.toasts.pinned);
            },
          },
          {
            label: muted ? copy.thread.options.unmute : copy.thread.options.mute,
            icon: muted ? "bell" : "muted",
            onPress: () => {
              useStore.getState().setMuted(id, !muted);
              showToast(muted ? copy.toasts.unmuted : copy.toasts.muted);
            },
          },
          ...(hasAdded
            ? [
                {
                  label: copy.thread.options.clear,
                  icon: "trash" as const,
                  destructive: true,
                  onPress: () => {
                    useStore.getState().clearAdded(id);
                    showToast(copy.toasts.cleared);
                  },
                },
              ]
            : []),
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -Radius.panel,
    borderRadius: Radius.panel,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingBottom: Radius.panel,
  },
  grabberWrap: { position: "absolute", top: 10, left: 0, right: 0, alignItems: "center", zIndex: 2 },
  grabber: { width: 40, height: 5, borderRadius: 2.5 },
  day: { textAlign: "center", marginTop: Space[5], marginBottom: Space[1] },
  receipt: { textAlign: "right", paddingHorizontal: Space[4] + 4, marginTop: 5 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 36, paddingBottom: 40 },
  starters: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: Space[2], marginTop: Space[3] },
  starter: { paddingHorizontal: 16, height: 36, borderRadius: 18, justifyContent: "center" },
});
