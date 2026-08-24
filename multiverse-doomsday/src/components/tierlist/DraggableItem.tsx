import * as Haptics from 'expo-haptics';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Poster } from '@/components/common/Poster';
import type { DropTarget } from '@/components/tierlist/TierRow';
import type { MovieItem, Tier } from '@/types';

export const TILE_WIDTH = 54;

interface DraggableItemProps {
  movie: MovieItem;
  /** Maps a pointer's absolute Y to whichever drop zone sits under it. */
  resolveDropTier: (absoluteY: number) => DropTarget | null;
  onDrop: (movie: MovieItem, tier: Tier | undefined) => void;
  onPress: (movie: MovieItem) => void;
  /** Called when a drag begins so the board can re-measure its rows. */
  onDragStart: () => void;
}

/**
 * A poster tile that can be dragged onto any tier row. Dropping resolves the
 * target from the pointer's absolute Y, so rows do not need to be siblings.
 */
export function DraggableItem({
  movie,
  resolveDropTier,
  onDrop,
  onPress,
  onDragStart,
}: DraggableItemProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);

  const beginDrag = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDragStart();
  };

  const commit = (absoluteY: number) => {
    const target = resolveDropTier(absoluteY);
    if (target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDrop(movie, target === 'unranked' ? undefined : target);
    }
  };

  const pan = Gesture.Pan()
    .activateAfterLongPress(180)
    .onStart(() => {
      scale.value = withSpring(1.16, { damping: 14, stiffness: 260 });
      zIndex.value = 50;
      runOnJS(beginDrag)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(commit)(event.absoluteY);
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      scale.value = withSpring(1, { damping: 16, stiffness: 240 });
      zIndex.value = 0;
    });

  const tap = Gesture.Tap().onEnd((_event, success) => {
    if (success) runOnJS(onPress)(movie);
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
  }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <Animated.View style={animatedStyle} accessibilityLabel={`${movie.title} tier tile`}>
        <View className="items-center" style={{ width: TILE_WIDTH }}>
          <Poster movie={movie} width={TILE_WIDTH} rounded="rounded-lg" />
          <Text className="mt-1 text-center text-2xs text-muted-deep" numberOfLines={1}>
            {movie.releaseYear}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
