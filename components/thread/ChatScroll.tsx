import { forwardRef, type ComponentRef } from "react";
import type { ScrollViewProps } from "react-native";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";

/**
 * iOS and Android: the conversation's scroll view. It lifts the latest
 * messages with the keyboard, including the interactive drag-to-dismiss.
 * `offset` is the safe-area padding the composer already keeps under itself.
 * The web build uses ChatScroll.web.tsx.
 */
export const ChatScroll = forwardRef<
  ComponentRef<typeof KeyboardChatScrollView>,
  ScrollViewProps & { offset: number }
>(function ChatScroll({ offset, ...props }, ref) {
  return (
    <KeyboardChatScrollView
      {...props}
      ref={ref}
      offset={offset}
      keyboardLiftBehavior="always"
      keyboardDismissMode="interactive"
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
    />
  );
});
