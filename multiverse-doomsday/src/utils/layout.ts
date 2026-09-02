import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Bar height above the system inset. The tab bar sits on top of the scrolling
 * content, so every screen has to reserve this much room at the end of its
 * list — otherwise the last card or button is cut in half by the bar.
 */
export const TAB_BAR_BASE = Platform.OS === 'ios' ? 86 : 62;

/** Full height the tab bar occupies, including the gesture/navigation inset. */
export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_BASE + insets.bottom;
}

/**
 * Safe-area top inset, floored to the real status-bar height on Android.
 *
 * With edge-to-edge enabled the app draws behind the status bar, so anything
 * pinned to the top has to be pushed down by this. Reading it from the safe
 * area alone is not enough — it has been observed as 0 on device, which put
 * every screen title underneath the clock and the battery icon.
 */
export function useTopInset(): number {
  const insets = useSafeAreaInsets();
  const androidFloor = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;
  return Math.max(insets.top, androidFloor);
}
