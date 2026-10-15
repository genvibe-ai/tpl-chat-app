import { forwardRef } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";

/** Web: browsers handle the on-screen keyboard themselves, so a plain scroll view. */
export const ChatScroll = forwardRef<ScrollView, ScrollViewProps & { offset: number }>(function ChatScroll(
  { offset: _offset, ...props },
  ref,
) {
  return <ScrollView {...props} ref={ref} />;
});
