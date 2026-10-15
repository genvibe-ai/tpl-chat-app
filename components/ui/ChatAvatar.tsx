import type { StyleProp, ViewStyle } from "react-native";
import type { ChatInfo } from "@/lib/chats";
import { Avatar, type Ring } from "./Avatar";

/** The avatar for a chat: the person, or two members for a group. */
export function ChatAvatar({
  info,
  size,
  ring,
  showOnline = true,
  style,
}: {
  info: ChatInfo;
  size: number;
  ring?: Ring;
  showOnline?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  if (info.group) return <Avatar group={info.members} size={size} ring={ring} style={style} />;
  return (
    <Avatar person={info.person} size={size} ring={ring} online={showOnline && !!info.person?.online} style={style} />
  );
}
