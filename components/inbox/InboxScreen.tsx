/**
 * Chats: stories at the top (they fold into the title as you scroll), search,
 * All / Unread / Groups, then pinned and recent chats. Long-press a chat to
 * pin, mute or mark it.
 */
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  LinearTransition,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy, type Message, type Story } from "@/constants/content";
import { Space, Type } from "@/constants/theme";
import { useAppWidth } from "@/hooks/useAppWidth";
import { useInbox, type InboxItem } from "@/lib/chats";
import { haptics } from "@/lib/haptics";
import { EASE_OUT, riseIn } from "@/lib/motion";
import { useStore } from "@/lib/store";
import { openStory, useStoryRow } from "@/lib/stories";
import { useTheme } from "@/lib/theme";
import { showToast } from "@/lib/toast";
import { ActionSheet } from "../ui/ActionSheet";
import { Icon, type IconName } from "../ui/Icon";
import { SearchField } from "../ui/SearchField";
import { ChatRow } from "./ChatRow";
import { FilterChips, type Filter } from "./FilterChips";
import { NAV_H, STORIES_H, StoriesHeader } from "./StoriesHeader";

const tick = () => haptics.light();
const nativeLayout = Platform.OS === "web" ? undefined : LinearTransition.duration(260).easing(EASE_OUT.factory());

type Row = { item: InboxItem; match?: Message };

function search(items: InboxItem[], query: string): Row[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.map((item) => ({ item }));
  const rows: Row[] = [];
  for (const item of items) {
    const names = [item.info.title, ...item.info.members.map((m) => m.name)].join(" ").toLowerCase();
    if (names.includes(q)) {
      rows.push({ item });
      continue;
    }
    const match = [...item.messages].reverse().find((m) => m.text?.toLowerCase().includes(q));
    if (match) rows.push({ item, match });
  }
  return rows;
}

export function InboxScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const width = useAppWidth();
  const { height } = useWindowDimensions();
  const items = useInbox();
  const stories = useStoryRow();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [menuFor, setMenuFor] = useState<InboxItem | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const firstPaint = useRef(true);

  const listRef = useAnimatedRef<Animated.ScrollView>();
  const y = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const settling = useSharedValue(false);
  const progress = useDerivedValue(() => 1 - Math.min(1, Math.max(0, y.get() / STORIES_H)));
  const stretch = useDerivedValue(() => Math.max(0, -y.get()));

  // React state and a light tap exactly once per crossing of the midpoint.
  useAnimatedReaction(
    () => progress.get() > 0.5,
    (open, previous) => {
      if (previous !== null && open !== previous) {
        scheduleOnRN(setIsOpen, open);
        scheduleOnRN(tick);
      }
    },
  );

  // A release half-way snaps to whichever end is nearer in the direction of travel.
  const snap = (offset: number, pulledDown: boolean) => {
    "worklet";
    const target = pulledDown ? (offset < STORIES_H * 0.8 ? 0 : STORIES_H) : offset > STORIES_H * 0.2 ? STORIES_H : 0;
    settling.set(true);
    scrollTo(listRef, 0, target, true);
  };
  const onScroll = useAnimatedScrollHandler({
    onBeginDrag: (e) => {
      dragStart.set(e.contentOffset.y);
      settling.set(false);
    },
    onScroll: (e) => {
      y.set(e.contentOffset.y);
    },
    onEndDrag: (e) => {
      const offset = e.contentOffset.y;
      if (offset <= 0 || offset >= STORIES_H) return;
      snap(offset, offset < dragStart.get());
    },
    onMomentumEnd: (e) => {
      const offset = e.contentOffset.y;
      if (settling.get()) {
        settling.set(false);
        return;
      }
      if (offset > 0 && offset < STORIES_H) snap(offset, offset < dragStart.get());
    },
  });

  const openStories = useCallback(() => {
    listRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  }, [listRef]);

  const visible = useMemo(() => {
    const filtered = items.filter((item) =>
      filter === "unread" ? item.unread > 0 : filter === "groups" ? item.info.group : true,
    );
    return search(filtered, query);
  }, [items, filter, query]);

  const searching = query.trim().length > 0;
  const sections: { key: string; title: string; icon?: IconName; rows: Row[] }[] = searching
    ? [{ key: "results", title: copy.inbox.results, rows: visible }]
    : [
        { key: "pinned", title: copy.inbox.pinned, icon: "pin" as IconName, rows: visible.filter((r) => r.item.pinned) },
        { key: "recent", title: copy.inbox.recent, rows: visible.filter((r) => !r.item.pinned) },
      ].filter((section) => section.rows.length > 0);

  const unreadChats = items.filter((item) => item.unread > 0).length;
  const empty = searching
    ? copy.inbox.noResults
    : filter === "unread"
      ? copy.inbox.caughtUp
      : filter === "groups"
        ? copy.inbox.noGroups
        : null;

  const store = useStore.getState;
  const menuItem = menuFor;
  let rowIndex = 0;
  const animateIn = firstPaint.current;
  firstPaint.current = false;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <Animated.ScrollView
        ref={listRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollIndicatorInsets={{ top: insets.top + NAV_H }}
        contentContainerStyle={{
          paddingTop: insets.top + NAV_H,
          paddingBottom: insets.bottom + Space[8],
          // Always tall enough to fold the stories away, even with few results.
          minHeight: height + STORIES_H,
        }}
      >
        <View style={{ height: STORIES_H }} />
        <View style={{ paddingHorizontal: Space[4], paddingTop: Space[1], paddingBottom: Space[3] }}>
          <SearchField value={query} onChange={setQuery} placeholder={copy.inbox.search} testID="inbox-search" />
        </View>
        <FilterChips value={filter} onChange={setFilter} counts={{ unread: unreadChats }} />

        {sections.map((section) => (
          <View key={section.key} style={{ marginTop: Space[4] }}>
            <View style={styles.sectionHeader}>
              {section.icon && <Icon name={section.icon} size={12} color={t.secondary} style={{ transform: [{ rotate: "45deg" }] }} />}
              <Text role="heading" style={[Type.section, { color: t.secondary }]}>
                {section.title.toUpperCase()}
              </Text>
            </View>
            {section.rows.map(({ item, match }) => {
              const index = rowIndex++;
              return (
                <Animated.View
                  key={item.info.id}
                  layout={nativeLayout}
                  entering={animateIn ? riseIn(Math.min(index, 8) * 34) : undefined}
                >
                  <ChatRow
                    item={item}
                    query={query}
                    match={match}
                    onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.info.id } })}
                    onLongPress={() => setMenuFor(item)}
                  />
                </Animated.View>
              );
            })}
          </View>
        ))}

        {sections.length === 0 && empty && (
          <View style={styles.empty}>
            <Icon name="chat" size={30} color={t.tertiary} />
            <Text style={[Type.name, { color: t.label }]}>{empty.title}</Text>
            <Text style={[Type.preview, { color: t.secondary, textAlign: "center" }]}>{empty.body}</Text>
          </View>
        )}
      </Animated.ScrollView>

      <StoriesHeader
        progress={progress}
        stretch={stretch}
        stories={stories}
        width={width}
        insetTop={insets.top}
        isOpen={isOpen}
        onPressCluster={openStories}
        onPressStory={(story: Story) => openStory(story, stories)}
        onPressCompose={() => router.push("/new")}
        onPressProfile={() => router.push("/profile")}
      />

      <ActionSheet
        open={!!menuItem}
        title={menuItem?.info.title}
        cancelLabel={copy.inbox.rowMenu.cancel}
        onClose={() => setMenuFor(null)}
        actions={
          menuItem
            ? [
                {
                  label: menuItem.pinned ? copy.inbox.rowMenu.unpin : copy.inbox.rowMenu.pin,
                  icon: menuItem.pinned ? "unpin" : "pin",
                  onPress: () => {
                    store().setPinned(menuItem.info.id, !menuItem.pinned);
                    showToast(menuItem.pinned ? copy.toasts.unpinned : copy.toasts.pinned);
                  },
                },
                {
                  label: menuItem.unread ? copy.inbox.rowMenu.read : copy.inbox.rowMenu.unread,
                  icon: menuItem.unread ? "read" : "unread",
                  onPress: () => {
                    if (menuItem.unread) store().markRead(menuItem.info.id);
                    else store().markUnread(menuItem.info.id);
                    showToast(menuItem.unread ? copy.toasts.markedRead : copy.toasts.markedUnread);
                  },
                },
                {
                  label: menuItem.muted ? copy.inbox.rowMenu.unmute : copy.inbox.rowMenu.mute,
                  icon: menuItem.muted ? "bell" : "muted",
                  onPress: () => {
                    store().setMuted(menuItem.info.id, !menuItem.muted);
                    showToast(menuItem.muted ? copy.toasts.unmuted : copy.toasts.muted);
                  },
                },
              ]
            : []
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Space[6],
    paddingBottom: Space[1],
  },
  empty: { alignItems: "center", gap: 10, paddingTop: 64, paddingHorizontal: 40 },
});
