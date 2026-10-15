import { useRef } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";
import { copy } from "@/constants/content";
import { useScheme, useTheme } from "@/lib/theme";
import { Glass } from "./Glass";
import { Icon } from "./Icon";

/** Browsers draw a focus ring around inputs; the glass pill is the focus state here. */
export const webNoOutline = Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null;

/** A glass search pill with a clear button. */
export function SearchField({
  value,
  onChange,
  placeholder,
  testID,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  testID?: string;
}) {
  const t = useTheme();
  const scheme = useScheme();
  const input = useRef<TextInput>(null);
  return (
    <Glass style={{ height: 44, borderRadius: 22 }}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 15 }}>
        <Icon name="search" size={18} color={t.secondary} />
        <TextInput
          ref={input}
          testID={testID}
          aria-label={placeholder}
          placeholder={placeholder}
          placeholderTextColor={t.placeholder}
          value={value}
          onChangeText={onChange}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          keyboardAppearance={scheme}
          selectionColor={t.accent}
          style={[{ flex: 1, height: 44, fontSize: 16, color: t.label }, webNoOutline]}
        />
        {!!value && (
          <Pressable
            role="button"
            aria-label={copy.inbox.clearSearch}
            hitSlop={12}
            onPress={() => {
              onChange("");
              input.current?.focus();
            }}
          >
            <Icon name="clear" size={18} color={t.secondary} />
          </Pressable>
        )}
      </View>
    </Glass>
  );
}
