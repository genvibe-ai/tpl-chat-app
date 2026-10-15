import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { copy } from "@/constants/content";
import { Space, Type } from "@/constants/theme";
import { personFor, type ChatInfo } from "@/lib/chats";
import { pointer } from "@/lib/pointer";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { ChatAvatar } from "../ui/ChatAvatar";
import { GlassButton } from "../ui/GlassButton";
import { Icon } from "../ui/Icon";

export const THREAD_NAV_H = 64;

/** Back, who you are talking to (and whether they are typing), options. */
export function ThreadHeader({
  info,
  typing,
  muted,
  insetTop,
  onMore,
}: {
  info: ChatInfo;
  typing?: string;
  muted: boolean;
  insetTop: number;
  onMore: () => void;
}) {
  const t = useTheme();
  const showTyping = useStore((state) => state.settings.typingIndicators) && !!typing;
  const typist = typing ? personFor(typing) : undefined;
  const status = showTyping
    ? info.group
      ? copy.thread.groupTyping(typist?.first ?? "")
      : copy.thread.typing
    : info.group
      ? copy.thread.members(info.members.map((m) => m.first))
      : info.person?.online
        ? copy.thread.online
        : (info.person?.lastSeen ?? "");

  return (
    <View style={[styles.bar, { top: insetTop, height: THREAD_NAV_H }, pointer.boxNone]}>
      <GlassButton
        icon="back"
        iconSize={18}
        label={copy.thread.back}
        testID="thread-back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      />
      <View style={[styles.center, pointer.none]}>
        <ChatAvatar info={info} size={38} />
        <View style={styles.titles}>
          <View style={styles.titleLine}>
            <Text role="heading" numberOfLines={1} style={[Type.navTitle, { color: t.label, flexShrink: 1 }]}>
              {info.title}
            </Text>
            {muted && <Icon name="muted" size={13} color={t.secondary} />}
          </View>
          <Text
            numberOfLines={1}
            style={[
              Type.caption,
              { color: showTyping ? t.accentText : !info.group && info.person?.online ? t.onlineText : t.secondary, fontWeight: "500" },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
      <GlassButton icon="more" iconSize={19} label={copy.thread.menu} onPress={onMore} testID="thread-more" />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Space[4],
    zIndex: 5,
  },
  center: {
    position: "absolute",
    left: 72,
    right: 72,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  titles: { flexShrink: 1, gap: 1 },
  titleLine: { flexDirection: "row", alignItems: "center", gap: 5 },
});
