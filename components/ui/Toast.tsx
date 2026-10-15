/** The toast host, mounted once at the root (see lib/toast.ts). */
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Type } from "@/constants/theme";
import { motion } from "@/lib/motion";
import { pointer } from "@/lib/pointer";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/lib/toast";
import { Glass, useNativeGlass } from "./Glass";

export function ToastHost() {
  const { message, key } = useToast();
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const native = useNativeGlass();
  return (
    <View style={[{ position: "absolute", top: insets.top + 6, left: 0, right: 0, alignItems: "center" }, pointer.none]}>
      {message ? (
        <Animated.View key={key} entering={motion.toastIn} exiting={motion.toastOut} style={{ boxShadow: native ? undefined : `0 8px 24px ${t.shadow}`, borderRadius: 22 }}>
          <Glass style={{ borderRadius: 22, paddingHorizontal: 18, paddingVertical: 11 }}>
            <Text role="alert" style={[Type.meta, { color: t.label, fontWeight: "600" }]}>
              {message}
            </Text>
          </Glass>
        </Animated.View>
      ) : null}
    </View>
  );
}
