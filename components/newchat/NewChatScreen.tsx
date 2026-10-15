/** New chat: suggested people, then everyone A–Z. Pick someone to open (or start) your chat. */
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy, hiddenContacts, people, suggested, type Person } from "@/constants/content";
import { Space, Type } from "@/constants/theme";
import { PEOPLE } from "@/lib/chats";
import { riseIn } from "@/lib/motion";
import { useTheme } from "@/lib/theme";
import { Avatar } from "../ui/Avatar";
import { GlassButton } from "../ui/GlassButton";
import { Icon } from "../ui/Icon";
import { PressScale } from "../ui/PressScale";
import { SearchField } from "../ui/SearchField";

const open = (person: Person) => router.replace({ pathname: "/chat/[id]", params: { id: person.id } });

function ContactRow({ person }: { person: Person }) {
  const t = useTheme();
  return (
    <Pressable
      role="button"
      aria-label={person.name}
      testID={`contact-${person.id}`}
      onPress={() => open(person)}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? t.pressed : "transparent" }]}
    >
      <Avatar person={person} size={46} online={person.online} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[Type.name, { color: t.label }]}>{person.name}</Text>
        <Text numberOfLines={1} style={[Type.meta, { color: t.secondary }]}>
          {person.about}
        </Text>
      </View>
      <Icon name="chevronRight" size={14} color={t.tertiary} />
    </Pressable>
  );
}

export function NewChatScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const top = Platform.OS === "ios" ? Space[5] : insets.top + Space[3];

  const contacts = useMemo(
    () => people.filter((p) => !hiddenContacts.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );
  const q = query.trim().toLowerCase();
  const matches = q ? contacts.filter((p) => `${p.name} ${p.about}`.toLowerCase().includes(q)) : contacts;
  const groups = useMemo(() => {
    const byLetter = new Map<string, Person[]>();
    for (const person of matches) {
      const letter = person.name[0].toUpperCase();
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), person]);
    }
    return [...byLetter.entries()];
  }, [matches]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: top, paddingHorizontal: Space[4], gap: Space[4], paddingBottom: Space[2] }}>
        <View style={styles.header}>
          <Text role="heading" style={[Type.navTitle, { color: t.label }]}>
            {copy.newChat.title}
          </Text>
          <GlassButton icon="close" iconSize={15} size={40} label={copy.newChat.close} onPress={() => router.back()} testID="new-close" />
        </View>
        <SearchField value={query} onChange={setQuery} placeholder={copy.newChat.search} testID="new-search" />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: insets.bottom + Space[8] }}>
        {!q && (
          <View style={{ marginTop: Space[3] }}>
            <Text role="heading" style={[Type.section, styles.sectionTitle, { color: t.secondary }]}>
              {copy.newChat.suggested.toUpperCase()}
            </Text>
            <View style={styles.suggested}>
              {suggested.map((id, index) => {
                const person = PEOPLE[id];
                if (!person) return null;
                return (
                  <Animated.View key={id} entering={riseIn(index * 40, 300)} style={{ flex: 1 }}>
                    <PressScale label={person.name} onPress={() => open(person)} style={styles.suggestion} testID={`suggested-${id}`}>
                      <Avatar person={person} size={62} online={person.online} />
                      <Text numberOfLines={1} style={[Type.caption, { color: t.label, marginTop: 6 }]}>
                        {person.first}
                      </Text>
                    </PressScale>
                  </Animated.View>
                );
              })}
            </View>
            <Text role="heading" style={[Type.section, styles.sectionTitle, { color: t.secondary, marginTop: Space[4] }]}>
              {copy.newChat.everyone.toUpperCase()}
            </Text>
          </View>
        )}
        {groups.map(([letter, list]) => (
          <View key={letter}>
            <Text style={[Type.caption, styles.letter, { color: t.accentText }]}>{letter}</Text>
            {list.map((person) => (
              <ContactRow key={person.id} person={person} />
            ))}
          </View>
        ))}
        {matches.length === 0 && (
          <Text style={[Type.preview, { color: t.secondary, textAlign: "center", paddingTop: 48 }]}>{copy.newChat.empty}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: Space[2] },
  sectionTitle: { marginLeft: Space[6], marginBottom: Space[2] },
  suggested: { flexDirection: "row", paddingHorizontal: Space[3] },
  suggestion: { alignItems: "center", paddingVertical: Space[2], borderRadius: 18 },
  letter: { marginLeft: Space[6], marginTop: Space[3], marginBottom: 2, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: Space[2],
    paddingHorizontal: Space[4],
    paddingVertical: 10,
    borderRadius: 20,
  },
});
