import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomButton } from '@/components/common/CustomButton';
import { Marker, Meter, Panel, Rule } from '@/components/common/Primitives';
import { TIER_STYLE } from '@/components/tierlist/TierRow';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { usePalette } from '@/hooks/useTheme';
import { useTopInset } from '@/utils/layout';
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import { compareBoards, decodeBoard, encodeBoard, type SharedBoard } from '@/utils/shareCode';
import { incursion } from '@/utils/incursion';

const MAX_LIST = 12;

export default function CompareScreen() {
  const palette = usePalette();
  const router = useRouter();
  const topInset = useTopInset();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ code?: string }>();

  const progress = useRoadmapStore((state) => state.progress);
  const displayName = useRoadmapStore((state) => state.displayName);
  const setDisplayName = useRoadmapStore((state) => state.setDisplayName);

  const [name, setName] = useState(displayName);
  const [input, setInput] = useState(params.code ?? '');
  const [error, setError] = useState<string | null>(null);

  // A code arriving on the deep link is read immediately; anything typed is
  // only read when the button is pressed, so half-pasted text is not an error.
  const [friend, setFriend] = useState<SharedBoard | null>(() =>
    params.code ? decodeBoard(params.code) : null,
  );

  const myCode = useMemo(
    () => encodeBoard(name || 'Anonymous', progress),
    [name, progress],
  );

  const comparison = useMemo(
    () => (friend ? compareBoards(progress, friend.progress) : null),
    [friend, progress],
  );

  // Two universes touching is an event with a survivor, not a leaderboard.
  const result = useMemo(
    () =>
      comparison && friend
        ? incursion({
            yourName: name,
            theirName: friend.name,
            yourWatched: comparison.yourWatched,
            theirWatched: comparison.theirWatched,
            total: comparison.total,
            bothSeen: comparison.bothSeen,
            onlyYours: comparison.youveSeen.length,
            onlyTheirs: comparison.theyveSeen.length,
            disagreements: comparison.disagreements.length,
          })
        : null,
    [comparison, friend, name],
  );

  const shareMine = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (name.trim()) setDisplayName(name.trim());
    await Share.share({
      message:
        `My universe, before the incursion. Paste this into DOOM → The Incursion and find out which one survives:\n\n${myCode}`,
    }).catch(() => {
      // Dismissed — nothing to recover.
    });
  };

  const shareResult = async () => {
    if (!result) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Share.share({
      message: `${result.headline}. ${result.line}\n\nRun your own incursion in DOOM.`,
    }).catch(() => {
      // Dismissed — nothing to recover.
    });
  };

  const readFriend = () => {
    const decoded = decodeBoard(input);
    if (!decoded) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('That universe could not be read. Ask them to send it again.');
      setFriend(null);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setError(null);
    setFriend(decoded);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topInset + space.xl,
          paddingBottom: insets.bottom + space.huge,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            paddingHorizontal: GUTTER,
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1 }}>
            <Marker>Two universes, one survivor</Marker>
            <Text style={{ ...type.display, color: palette.ink, marginTop: space.sm }}>
              The Incursion
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={router.back}
            hitSlop={14}
          >
            <Ionicons name="close" size={24} color={palette.ink} />
          </Pressable>
        </View>

        {/* Your code */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <Marker>Your universe</Marker>

          <View style={{ marginTop: space.md }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name your universe"
              placeholderTextColor={palette.inkFaint}
              maxLength={16}
              autoCorrect={false}
              accessibilityLabel="Name your universe"
              style={{
                ...type.body,
                fontSize: 15,
                color: palette.ink,
                paddingVertical: space.sm,
              }}
            />
            <Rule />
          </View>

          <View
            style={{
              marginTop: space.lg,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: palette.line,
              backgroundColor: palette.raised,
              padding: space.md,
            }}
          >
            <Text
              selectable
              style={{
                ...type.small,
                color: palette.inkSoft,
                fontFamily: undefined,
                letterSpacing: 0.4,
              }}
            >
              {myCode}
            </Text>
          </View>

          <View style={{ marginTop: space.md }}>
            <CustomButton
              label="Send my universe"
              icon="share-outline"
              size="lg"
              fullWidth
              onPress={shareMine}
            />
          </View>
          <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.sm }}>
            Or press and hold the code above to copy it.
          </Text>
        </View>

        {/* Their code */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <Marker>The other universe</Marker>

          <View style={{ marginTop: space.md }}>
            <TextInput
              value={input}
              onChangeText={(text) => {
                setInput(text);
                setError(null);
              }}
              placeholder="Paste their universe"
              placeholderTextColor={palette.inkFaint}
              autoCorrect={false}
              autoCapitalize="none"
              multiline
              accessibilityLabel="Their universe"
              style={{
                ...type.body,
                fontSize: 14,
                color: palette.ink,
                paddingVertical: space.sm,
                minHeight: 46,
              }}
            />
            <Rule />
          </View>

          {error ? (
            <Text style={{ ...type.small, color: palette.crimson, marginTop: space.sm }}>
              {error}
            </Text>
          ) : null}

          <View style={{ marginTop: space.md }}>
            <CustomButton
              label="Collide"
              icon="flash-outline"
              size="lg"
              fullWidth
              disabled={input.trim().length === 0}
              onPress={readFriend}
            />
          </View>
        </View>

        {/* Result */}
        {friend && comparison ? (
          <Animated.View entering={FadeIn.duration(motion.base)}>
            <View style={{ paddingHorizontal: GUTTER, marginTop: space.huge }}>
              {result ? (
                <Panel tint={result.survivor === 'yours' ? palette.accent : palette.marvel}>
                  <Marker color={result.survivor === 'yours' ? palette.accent : palette.marvel}>
                    Outcome
                  </Marker>
                  <Text style={{ ...type.title, color: palette.ink, marginTop: space.sm }}>
                    {result.headline}
                  </Text>
                  <Text
                    style={{
                      ...type.body,
                      color: palette.inkSoft,
                      marginTop: space.sm,
                      lineHeight: 20,
                    }}
                  >
                    {result.line}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Send the result"
                    onPress={shareResult}
                    hitSlop={8}
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.md }}
                  >
                    <Ionicons name="share-outline" size={14} color={palette.marvel} />
                    <Text
                      style={{
                        ...type.small,
                        fontWeight: '600',
                        color: palette.marvel,
                        marginLeft: space.sm,
                      }}
                    >
                      Send the result
                    </Text>
                  </Pressable>
                </Panel>
              ) : null}

              <View style={{ marginTop: space.xl }}>
                <Side
                  label="You"
                  watched={comparison.yourWatched}
                  total={comparison.total}
                  leading={comparison.yourWatched >= comparison.theirWatched}
                />
                <View style={{ height: space.lg }} />
                <Side
                  label={friend.name || 'Them'}
                  watched={comparison.theirWatched}
                  total={comparison.total}
                  leading={comparison.theirWatched >= comparison.yourWatched}
                />
              </View>

              <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.lg }}>
                {comparison.bothSeen} titles exist in both universes
                {friend.unknownCount > 0
                  ? ` · ${friend.unknownCount} titles from a newer build were skipped`
                  : ''}
              </Text>
            </View>

            {comparison.disagreements.length > 0 ? (
              <Block title={`Contested ground · ${comparison.disagreements.length}`}>
                {comparison.disagreements.slice(0, MAX_LIST).map((row) => (
                  <View key={row.movieId}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: GUTTER,
                        paddingVertical: space.md,
                      }}
                    >
                      <Text
                        style={{ ...type.bodyStrong, color: palette.ink, flex: 1 }}
                        numberOfLines={1}
                      >
                        {row.title}
                      </Text>
                      <TierPip tier={row.yours} />
                      <Ionicons
                        name="swap-horizontal"
                        size={13}
                        color={palette.inkFaint}
                        style={{ marginHorizontal: space.sm }}
                      />
                      <TierPip tier={row.theirs} />
                    </View>
                    <Rule inset={GUTTER} />
                  </View>
                ))}
              </Block>
            ) : null}

            {comparison.theyveSeen.length > 0 ? (
              <Block title={`Only in their universe · ${comparison.theyveSeen.length}`}>
                <TitleList items={comparison.theyveSeen} />
              </Block>
            ) : null}

            {comparison.youveSeen.length > 0 ? (
              <Block title={`Only in yours · ${comparison.youveSeen.length}`}>
                <TitleList items={comparison.youveSeen} />
              </Block>
            ) : null}
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Side({
  label,
  watched,
  total,
  leading,
}: {
  label: string;
  watched: number;
  total: number;
  leading: boolean;
}) {
  const palette = usePalette();
  const percent = total ? Math.round((watched / total) * 100) : 0;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: space.sm }}>
        <Text style={{ ...type.bodyStrong, color: palette.ink, flex: 1 }} numberOfLines={1}>
          {label}
        </Text>
        <Text
          style={{
            ...type.heading,
            color: leading ? palette.accent : palette.inkSoft,
            fontVariant: ['tabular-nums'],
          }}
        >
          {percent}%
        </Text>
        <Text style={{ ...type.small, color: palette.inkFaint, marginLeft: space.sm }}>
          {watched}/{total}
        </Text>
      </View>
      <Meter value={percent} tint={leading ? palette.accent : palette.inkFaint} />
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.duration(motion.base)} style={{ marginTop: space.xxl }}>
      <View style={{ paddingHorizontal: GUTTER, marginBottom: space.md }}>
        <Marker>{title}</Marker>
      </View>
      <Rule inset={GUTTER} />
      {children}
    </Animated.View>
  );
}

function TitleList({ items }: { items: { id: string; title: string }[] }) {
  const palette = usePalette();
  const shown = items.slice(0, MAX_LIST);

  return (
    <View>
      {shown.map((item) => (
        <View key={item.id}>
          <Text
            style={{
              ...type.body,
              color: palette.inkSoft,
              paddingHorizontal: GUTTER,
              paddingVertical: space.md,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Rule inset={GUTTER} />
        </View>
      ))}
      {items.length > shown.length ? (
        <Text
          style={{
            ...type.small,
            color: palette.inkFaint,
            paddingHorizontal: GUTTER,
            paddingTop: space.md,
          }}
        >
          and {items.length - shown.length} more
        </Text>
      ) : null}
    </View>
  );
}

function TierPip({ tier }: { tier: keyof typeof TIER_STYLE }) {
  return (
    <View
      style={{
        minWidth: 24,
        alignItems: 'center',
        paddingHorizontal: space.sm,
        paddingVertical: 2,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: TIER_STYLE[tier].hex,
        backgroundColor: `${TIER_STYLE[tier].hex}22`,
      }}
    >
      <Text style={{ ...type.small, fontWeight: '700', color: TIER_STYLE[tier].hex }}>{tier}</Text>
    </View>
  );
}
