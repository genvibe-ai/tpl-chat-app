/**
 * Icons: SF Symbols on iOS, Material Symbols on Android and the web, through
 * expo-symbols. Add an icon by adding a line to ICONS with both names
 * (`web` defaults to the Android name).
 */
import { SymbolView, type AndroidSymbol, type SFSymbol } from "expo-symbols";
import type { StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";

type Names = { ios: SFSymbol; android: AndroidSymbol; web?: AndroidSymbol };

const ICONS = {
  back: { ios: "chevron.left", android: "arrow_back", web: "chevron_left" },
  add: { ios: "plus", android: "add" },
  compose: { ios: "square.and.pencil", android: "edit_square" },
  search: { ios: "magnifyingglass", android: "search" },
  clear: { ios: "xmark.circle.fill", android: "cancel" },
  close: { ios: "xmark", android: "close" },
  pin: { ios: "pin.fill", android: "keep" },
  unpin: { ios: "pin.slash", android: "keep_off" },
  muted: { ios: "bell.slash.fill", android: "notifications_off" },
  bell: { ios: "bell", android: "notifications" },
  heart: { ios: "heart", android: "favorite" },
  heartFill: { ios: "heart.fill", android: "favorite" },
  send: { ios: "arrow.up", android: "arrow_upward" },
  photo: { ios: "photo", android: "image" },
  photoFill: { ios: "photo.fill", android: "image" },
  more: { ios: "ellipsis", android: "more_horiz" },
  reply: { ios: "arrowshape.turn.up.left", android: "reply" },
  check: { ios: "checkmark", android: "check" },
  read: { ios: "checkmark.message", android: "mark_chat_read" },
  unread: { ios: "message.badge", android: "mark_chat_unread" },
  group: { ios: "person.2", android: "group" },
  trash: { ios: "trash", android: "delete" },
  reset: { ios: "arrow.counterclockwise", android: "restart_alt" },
  lock: { ios: "lock", android: "lock" },
  chevronRight: { ios: "chevron.right", android: "chevron_right" },
  sparkles: { ios: "sparkles", android: "auto_awesome" },
  share: { ios: "square.and.arrow.up", android: "share", web: "ios_share" },
  chat: { ios: "bubble.left.and.bubble.right", android: "forum" },
  eye: { ios: "eye", android: "visibility" },
} satisfies Record<string, Names>;

export type IconName = keyof typeof ICONS;

/** The SF Symbol name, for native iOS controls. */
export function sfSymbol(name: IconName): SFSymbol {
  return ICONS[name].ios;
}

export function Icon({
  name,
  size = 20,
  color,
  weight = "medium",
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  weight?: "regular" | "medium" | "semibold" | "bold";
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const names: Names = ICONS[name];
  return (
    <SymbolView
      name={{ ios: names.ios, android: names.android, web: names.web ?? names.android }}
      size={size}
      weight={weight}
      tintColor={color ?? t.label}
      style={[{ width: size, height: size }, style]}
    />
  );
}
