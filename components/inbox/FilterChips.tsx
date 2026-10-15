import { Text, View } from "react-native";
import { copy } from "@/constants/content";
import { Space, Type } from "@/constants/theme";
import { useTheme } from "@/lib/theme";
import { PressScale } from "../ui/PressScale";

export type Filter = keyof typeof copy.inbox.filters;

/** All · Unread · Groups. The selected chip is filled with ink. */
export function FilterChips({
  value,
  onChange,
  counts,
}: {
  value: Filter;
  onChange: (filter: Filter) => void;
  counts: Partial<Record<Filter, number>>;
}) {
  const t = useTheme();
  return (
    <View role="tablist" style={{ flexDirection: "row", gap: Space[2], paddingHorizontal: Space[4] }}>
      {(Object.keys(copy.inbox.filters) as Filter[]).map((key) => {
        const selected = key === value;
        const count = counts[key];
        return (
          <PressScale
            key={key}
            role="tab"
            selected={selected}
            label={copy.inbox.filters[key]}
            onPress={() => onChange(key)}
            testID={`filter-${key}`}
            style={{
              height: 34,
              paddingHorizontal: 15,
              borderRadius: 17,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: selected ? t.label : t.chip,
            }}
          >
            <Text style={[Type.meta, { fontWeight: "600", color: selected ? t.bg : t.label }]}>{copy.inbox.filters[key]}</Text>
            {!!count && (
              <Text style={[Type.meta, { fontWeight: "600", color: selected ? t.bg : t.secondary, fontVariant: ["tabular-nums"] }]}>
                {count}
              </Text>
            )}
          </PressScale>
        );
      })}
    </View>
  );
}
