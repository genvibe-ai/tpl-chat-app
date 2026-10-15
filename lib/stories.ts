/**
 * The story row: your story first, then unseen stories, then seen ones.
 * The viewer itself (components/stories/StoryViewer.tsx) is mounted once at
 * the root; opening a story only tells it which one to show and the order to
 * step through.
 */
import { useMemo } from "react";
import { create } from "zustand";
import { myStory, stories, type Story } from "@/constants/content";
import { useStore } from "./store";

type Viewer = { active: Story | null; sequence: Story[] };

const useViewer = create<Viewer>(() => ({ active: null, sequence: [] }));

/** Opens a story; `sequence` is the order taps and the timer step through. */
export function openStory(story: Story, sequence: Story[] = [myStory, ...stories]) {
  useViewer.setState({ active: story, sequence });
}

/** Moves the open viewer to another story in the same sequence. */
export function showStory(story: Story) {
  useViewer.setState({ active: story });
}

export function closeStory() {
  useViewer.setState({ active: null });
}

export function useActiveStory() {
  return useViewer((state) => state.active);
}

/** The story after (or before) the given one, skipping your own. */
export function stepStory(from: Story, direction: 1 | -1): Story | null {
  const { sequence } = useViewer.getState();
  if (from.person === myStory.person) return null;
  const others = sequence.filter((story) => story.person !== myStory.person);
  const index = others.findIndex((story) => story.person === from.person);
  return others[index + direction] ?? null;
}

/** True when the story has been watched (sample flag or on this device). */
export function useStorySeen(story: Story) {
  return useStore((state) => !!story.seen || state.storiesSeen.includes(story.person));
}

/** The row in display order: yours, unseen, seen. */
export function useStoryRow(): Story[] {
  const seen = useStore((state) => state.storiesSeen);
  return useMemo(() => {
    const isSeen = (story: Story) => !!story.seen || seen.includes(story.person);
    return [myStory, ...stories.filter((s) => !isSeen(s)), ...stories.filter(isSeen)];
  }, [seen]);
}
