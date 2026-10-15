import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Type } from "@/constants/theme";
import { popIn } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

/** The unread count. Muted chats get a quiet grey badge. */
export function Badge({ count, muted = false, label }: { count: number; muted?: boolean; label: string }) {
  const t = useTheme();
  if (count <= 0) return null;
  return (
    <Animated.View entering={popIn()} aria-label={label}>
      <View
        style={{
          minWidth: 21,
          height: 21,
          paddingHorizontal: 6,
          borderRadius: 11,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: muted ? t.chip : t.accent,
        }}
      >
        <Text style={[Type.badge, { color: muted ? t.secondary : t.onAccent, fontVariant: ["tabular-nums"] }]}>
          {count > 99 ? "99+" : count}
        </Text>
      </View>
    </Animated.View>
  );
}
