import { Platform } from 'react-native';
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
