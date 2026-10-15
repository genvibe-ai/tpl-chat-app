/** A short confirmation at the top of the screen ("Chat pinned"). */
import { create } from "zustand";

type ToastState = { message: string | null; key: number };

export const useToast = create<ToastState>(() => ({ message: null, key: 0 }));

let timer: ReturnType<typeof setTimeout> | undefined;

export function showToast(message: string) {
  if (timer) clearTimeout(timer);
  useToast.setState((state) => ({ message, key: state.key + 1 }));
  timer = setTimeout(() => useToast.setState({ message: null }), 1900);
}
