import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { PressScale } from "@/components/ui/PressScale";
import { ThreadScreen } from "@/components/thread/ThreadScreen";
import { copy } from "@/constants/content";
import { Type } from "@/constants/theme";
import { chatInfo } from "@/lib/chats";
import { useTheme } from "@/lib/theme";

/** A conversation. The id is a sample chat's id or, for a new chat, the person's id. */
export default function ChatRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const info = chatInfo(id);
  const t = useTheme();
  if (info) return <ThreadScreen key={info.id} info={info} />;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, backgroundColor: t.bg, padding: 32 }}>
      <Text style={[Type.name, { color: t.label, textAlign: "center" }]}>{copy.thread.notFound}</Text>
      <PressScale label={copy.thread.goBack} onPress={() => router.replace("/")} style={{ paddingHorizontal: 20, height: 44, borderRadius: 22, justifyContent: "center", backgroundColor: t.accent }}>
        <Text style={[Type.meta, { color: t.onAccent, fontWeight: "700" }]}>{copy.thread.goBack}</Text>
      </PressScale>
    </View>
  );
}
