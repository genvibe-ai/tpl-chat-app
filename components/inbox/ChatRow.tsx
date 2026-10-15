import { memo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { copy, type Message } from "@/constants/content";
import { Space, Type } from "@/constants/theme";
import { personFor, type InboxItem } from "@/lib/chats";
import { haptics } from "@/lib/haptics";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { Badge } from "../ui/Badge";
import { ChatAvatar } from "../ui/ChatAvatar";
import { Icon } from "../ui/Icon";

export const ROW_AVATAR = 56;

/** Who wrote it, as a prefix: "You: " or, in groups, "Rohan: ". */
function prefixFor(item: InboxItem, message: Message) {
  if (message.from === "me") return `${copy.inbox.you}: `;
  if (item.info.group) return `${personFor(message.from)?.first ?? ""}: `;
  return "";
}

/** Splits text around the first match of `query`, to highlight it; a late match starts with "…". */
function highlight(text: string, query: string) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return [text, "", ""] as const;
  const lead = at > 22 ? `…${text.slice(at - 16, at).trimStart()}` : text.slice(0, at);
  return [lead, text.slice(at, at + query.length), text.slice(at + query.length)] as const;
}

export const ChatRow = memo(function ChatRow({
  item,
  query,
  match,
  onPress,
  onLongPress,
}: {
  item: InboxItem;
  query: string;
  /** A message that matched the search, shown instead of the latest one. */
  match?: Message;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const t = useTheme();
  const previews = useStore((state) => state.settings.previews);
  const typingIndicators = useStore((state) => state.settings.typingIndicators);
  const { info, unread, muted, pinned } = item;
  const shown = match ?? item.last;
  const typingPerson = typingIndicators && item.typing ? personFor(item.typing) : undefined;
  const bold = unread > 0;

  let preview: ReactNode = null;
  if (typingPerson) {
    preview = (
      <Text numberOfLines={1} style={[Type.preview, { color: t.accentText, fontWeight: "500" }]}>
        {info.group ? copy.thread.groupTyping(typingPerson.first) : copy.inbox.typing}
      </Text>
    );
  } else if (shown) {
    const color = bold ? t.label : t.secondary;
    const prefix = prefixFor(item, shown);
    if (!previews && !match) {
      preview = <Text style={[Type.preview, { color }]}>{copy.inbox.previewHidden}</Text>;
    } else {
      const [before, hit, after] = highlight(shown.text ?? copy.inbox.photo, match ? query : "");
      preview = (
        <View style={styles.inline}>
          {shown.photo && !!prefix && <Text style={[Type.preview, { color }]}>{prefix}</Text>}
          {shown.photo && <Icon name="photoFill" size={15} color={color} />}
          <Text numberOfLines={1} style={[Type.preview, { color, flexShrink: 1 }]}>
            {shown.photo ? "" : prefix}
            {before}
            {hit ? <Text style={{ color: t.label, fontWeight: "700" }}>{hit}</Text> : null}
            {after}
          </Text>
        </View>
      );
    }
  }

  const label = [
    info.title,
    unread ? copy.inbox.unreadLabel(unread) : "",
    typingPerson ? copy.inbox.typing : shown?.text ?? (shown?.photo ? copy.inbox.photo : ""),
    item.time,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      role="button"
      aria-label={label}
      testID={`chat-row-${info.id}`}
      onPress={onPress}
      onLongPress={() => {
        haptics.medium();
        onLongPress();
      }}
      delayLongPress={380}
      unstable_pressDelay={60}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? t.pressed : "transparent" }]}
    >
      <ChatAvatar info={info} size={ROW_AVATAR} />
      <View style={styles.body}>
        <View style={styles.line}>
          <Text numberOfLines={1} style={[Type.name, styles.name, { color: t.label }]}>
            {info.title}
            {info.emoji ? ` ${info.emoji}` : ""}
          </Text>
          <Text
            style={[
              Type.meta,
              { color: bold && !muted ? t.accentText : t.secondary, fontVariant: ["tabular-nums"], fontWeight: bold ? "600" : "400" },
            ]}
          >
            {item.time}
          </Text>
        </View>
        <View style={styles.line}>
          <View style={styles.preview}>{preview}</View>
          <View style={styles.marks}>
            {muted && <Icon name="muted" size={14} color={t.secondary} />}
            {unread > 0 ? (
              <Badge count={unread} muted={muted} label={copy.inbox.unreadLabel(unread)} />
            ) : pinned ? (
              <Icon name="pin" size={14} color={t.secondary} style={{ transform: [{ rotate: "45deg" }] }} />
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: Space[2],
    borderRadius: 22,
    borderCurve: "continuous",
  },
  body: { flex: 1, gap: 3 },
  line: { flexDirection: "row", alignItems: "center", gap: Space[2] },
  name: { flex: 1 },
  preview: { flex: 1, minHeight: 20, justifyContent: "center" },
  inline: { flexDirection: "row", alignItems: "center", gap: 4, overflow: "hidden" },
  marks: { flexDirection: "row", alignItems: "center", gap: 6 },
});
