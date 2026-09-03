import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomButton } from '@/components/common/CustomButton';
import { Marker, Meter, Panel, Rule, Stat } from '@/components/common/Primitives';
import { useCourtStore } from '@/hooks/useCourtStore';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { usePalette } from '@/hooks/useTheme';
import { GUTTER, HAIRLINE, motion, radius, space, type } from '@/styles/tokens';
import { useTopInset } from '@/utils/layout';
import { countdownTo, releaseDateLabel } from '@/utils/countdown';
import {
  PREDICTIONS,
  compareBallots,
  decodeBallot,
  encodeBallot,
  scoreBallot,
  type PredictionQuestion,
  type SharedBallot,
} from '@/utils/predictions';

/**
 * The casting court.
 *
 * Twelve arguments about Doomsday, committed to before anyone knows the
 * answers. Locking is a ritual rather than a mechanism — the timestamp is
 * what you show people. After release the answer key arrives in an update and
 * every ballot already on every phone scores itself.
 */
export default function CourtScreen() {
  const palette = usePalette();
  const router = useRouter();
  const topInset = useTopInset();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ code?: string }>();

  const ballot = useCourtStore((state) => state.ballot);
  const lockedAt = useCourtStore((state) => state.lockedAt);
  const setAnswer = useCourtStore((state) => state.setAnswer);
  const lock = useCourtStore((state) => state.lock);
  const unlock = useCourtStore((state) => state.unlock);

  const displayName = useRoadmapStore((state) => state.displayName);
  const setDisplayName = useRoadmapStore((state) => state.setDisplayName);
  const [name, setName] = useState(displayName);

  const [input, setInput] = useState(params.code ?? '');
  const [error, setError] = useState<string | null>(null);
  const [rival, setRival] = useState<SharedBallot | null>(() =>
    params.code ? decodeBallot(params.code) : null,
  );

  const answered = Object.keys(ballot).length;
  const released = countdownTo().released;
  const score = useMemo(() => scoreBallot(ballot), [ballot]);
  const myCode = useMemo(() => encodeBallot(name || 'Anonymous', ballot), [name, ballot]);
  const comparison = useMemo(
    () => (rival ? compareBallots(ballot, rival.ballot) : null),
    [rival, ballot],
  );

  const choose = (questionId: string, optionId: string) => {
    if (lockedAt) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.selectionAsync();
    setAnswer(questionId, optionId);
  };

  const submit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    lock();
  };

  const share = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (name.trim()) setDisplayName(name.trim());
    await Share.share({
      message:
        `My Doomsday predictions are locked. ${answered} of ${PREDICTIONS.length} called.\n\n` +
        `Paste this into DOOM → Casting court and see how wrong you are:\n\n${myCode}`,
    }).catch(() => {
      // Dismissed — nothing to recover.
    });
  };

  const readRival = () => {
    const decoded = decodeBallot(input);
    if (!decoded) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('That ballot could not be read. Ask them to send it again.');
      setRival(null);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setError(null);
    setRival(decoded);
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
          style={{ paddingHorizontal: GUTTER, flexDirection: 'row', alignItems: 'flex-start' }}
        >
          <View style={{ flex: 1 }}>
            <Marker>On the record</Marker>
            <Text style={{ ...type.display, color: palette.ink, marginTop: space.sm }}>
              Casting court
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

        {/* Where you stand */}
        <Animated.View
          entering={FadeInDown.duration(motion.slow)}
          style={{ paddingHorizontal: GUTTER, marginTop: space.xl }}
        >
          <Text style={{ ...type.body, color: palette.inkSoft, lineHeight: 21 }}>
            {released
              ? 'Doomsday is out. Answers are settled as the key lands in an update — no need to re-enter anything.'
              : `Call it now, argue about it later. Everything here is settled by the film on ${releaseDateLabel()}.`}
          </Text>

          <View style={{ marginTop: space.xl }}>
            <Meter
              value={(answered / PREDICTIONS.length) * 100}
              tint={answered === PREDICTIONS.length ? palette.accent : palette.marvel}
            />
          </View>

          <View style={{ flexDirection: 'row', marginTop: space.xl }}>
            <Stat value={`${answered}/${PREDICTIONS.length}`} label="called" />
            <Stat
              value={lockedAt ? 'Locked' : 'Open'}
              label="ballot"
              tint={lockedAt ? palette.marvel : undefined}
            />
            <Stat
              value={score.settled > 0 ? `${score.percent}%` : '—'}
              label={score.settled > 0 ? 'right so far' : 'unsettled'}
              tint={score.settled > 0 ? palette.accent : undefined}
            />
          </View>

          {lockedAt ? (
            <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.lg }}>
              Locked {new Date(lockedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}. That timestamp is the only thing stopping you changing your mind.
            </Text>
          ) : null}
        </Animated.View>

        {/* The questions */}
        <View style={{ marginTop: space.xxl }}>
          <View style={{ paddingHorizontal: GUTTER, marginBottom: space.md }}>
            <Marker>The docket</Marker>
          </View>
          <Rule inset={GUTTER} />
          {PREDICTIONS.map((question, index) => (
            <QuestionBlock
              key={question.id}
              question={question}
              index={index}
              chosen={ballot[question.id]}
              locked={Boolean(lockedAt)}
              onChoose={(optionId) => choose(question.id, optionId)}
            />
          ))}
        </View>

        {/* Lock and share */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <Marker>Your ballot</Marker>

          <View style={{ marginTop: space.md }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={palette.inkFaint}
              maxLength={16}
              autoCorrect={false}
              accessibilityLabel="Your name"
              style={{
                ...type.body,
                fontSize: 15,
                color: palette.ink,
                paddingVertical: space.sm,
              }}
            />
            <Rule />
          </View>

          {lockedAt ? (
            <View
              style={{
                marginTop: space.lg,
                borderRadius: radius.md,
                borderWidth: HAIRLINE,
                borderColor: palette.line,
                backgroundColor: palette.raised,
                padding: space.md,
              }}
            >
              <Text selectable style={{ ...type.small, color: palette.inkSoft, letterSpacing: 0.4 }}>
                {myCode}
              </Text>
            </View>
          ) : null}

          <View style={{ marginTop: space.lg }}>
            {lockedAt ? (
              <CustomButton
                label="Send my ballot"
                icon="share-outline"
                size="lg"
                fullWidth
                onPress={share}
              />
            ) : (
              <CustomButton
                label={answered === 0 ? 'Call something first' : `Lock in ${answered} predictions`}
                icon="lock-closed-outline"
                size="lg"
                fullWidth
                disabled={answered === 0}
                onPress={submit}
              />
            )}
          </View>

          {lockedAt ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                unlock();
              }}
              hitSlop={8}
              style={{ paddingVertical: space.md, alignSelf: 'flex-start' }}
            >
              <Text style={{ ...type.small, color: palette.inkFaint }}>
                Reopen the ballot — the lock date goes with it
              </Text>
            </Pressable>
          ) : (
            <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.sm }}>
              Locking stamps the date and hands you a code to send. You can reopen it, but
              everyone will see you did.
            </Text>
          )}
        </View>

        {/* Against a friend */}
        <View style={{ paddingHorizontal: GUTTER, marginTop: space.xxl }}>
          <Marker>Their ballot</Marker>

          <View style={{ marginTop: space.md }}>
            <TextInput
              value={input}
              onChangeText={(text) => {
                setInput(text);
                setError(null);
              }}
              placeholder="Paste a friend's ballot"
              placeholderTextColor={palette.inkFaint}
              autoCorrect={false}
              autoCapitalize="none"
              multiline
              accessibilityLabel="Friend's ballot"
              style={{
                ...type.body,
                fontSize: 14,
                color: palette.ink,
                paddingVertical: space.sm,
                minHeight: 44,
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
              label="Read their ballot"
              icon="enter-outline"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={readRival}
            />
          </View>
        </View>

        {/* The verdict against them */}
        {comparison && rival ? (
          <Animated.View entering={FadeIn.duration(motion.slow)} style={{ marginTop: space.xxl }}>
            <View style={{ paddingHorizontal: GUTTER }}>
              <Panel tint={comparison.clashed > 0 ? palette.marvel : palette.accent}>
                <Marker color={comparison.clashed > 0 ? palette.marvel : palette.accent}>
                  {rival.name || 'Their ballot'}
                </Marker>
                <Text style={{ ...type.title, color: palette.ink, marginTop: space.sm }}>
                  {comparison.clashed === 0
                    ? 'You agree on everything'
                    : `${comparison.clashed} ${comparison.clashed === 1 ? 'fight' : 'fights'}`}
                </Text>
                <Text style={{ ...type.small, color: palette.inkSoft, marginTop: space.xs }}>
                  {comparison.agreed} agreed · {comparison.agreementPercent}% aligned
                  {comparison.incomplete > 0
                    ? ` · ${comparison.incomplete} not called by both of you`
                    : ''}
                </Text>
              </Panel>
            </View>

            <View style={{ marginTop: space.xl }}>
              <Rule inset={GUTTER} />
              {comparison.lines.map((line) => (
                <View key={line.questionId}>
                  <View style={{ paddingHorizontal: GUTTER, paddingVertical: space.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons
                        name={
                          line.clash
                            ? 'flash-outline'
                            : line.agree
                              ? 'checkmark'
                              : 'remove-outline'
                        }
                        size={15}
                        color={
                          line.clash
                            ? palette.marvel
                            : line.agree
                              ? palette.accent
                              : palette.inkFaint
                        }
                      />
                      <Text
                        style={{
                          ...type.bodyStrong,
                          color: palette.ink,
                          flex: 1,
                          marginLeft: space.sm,
                        }}
                      >
                        {line.question}
                      </Text>
                    </View>
                    <Text
                      style={{
                        ...type.small,
                        color: palette.inkFaint,
                        marginTop: space.xs,
                        marginLeft: 23,
                      }}
                    >
                      You: {line.yours ?? 'not called'} · {rival.name || 'Them'}:{' '}
                      {line.theirs ?? 'not called'}
                    </Text>
                  </View>
                  <Rule inset={GUTTER} />
                </View>
              ))}
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * One question
 * ------------------------------------------------------------------ */

interface QuestionBlockProps {
  question: PredictionQuestion;
  index: number;
  chosen?: string;
  locked: boolean;
  onChoose: (optionId: string) => void;
}

function QuestionBlock({ question, index, chosen, locked, onChoose }: QuestionBlockProps) {
  const palette = usePalette();

  return (
    <View>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: space.lg, paddingBottom: space.md }}>
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={{
              ...type.ordinal,
              color: palette.inkFaint,
              width: 22,
              marginTop: 4,
              fontVariant: ['tabular-nums'],
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={{ ...type.heading, color: palette.ink }}>{question.question}</Text>
            <Text style={{ ...type.small, color: palette.inkFaint, marginTop: space.xs }}>
              {question.note}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: space.sm,
            marginTop: space.md,
            marginLeft: 22,
          }}
        >
          {question.options.map((option) => {
            const on = chosen === option.id;
            return (
              <Animated.View key={option.id} layout={Layout.duration(motion.base)}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on, disabled: locked }}
                  accessibilityLabel={`${question.question} — ${option.label}`}
                  onPress={() => onChoose(option.id)}
                  style={{
                    paddingHorizontal: space.md,
                    paddingVertical: space.sm,
                    borderRadius: radius.pill,
                    borderWidth: HAIRLINE,
                    borderColor: on ? palette.marvel : palette.line,
                    backgroundColor: on ? `${palette.marvel}1A` : 'transparent',
                    opacity: locked && !on ? 0.4 : 1,
                  }}
                >
                  <Text
                    style={{
                      ...type.small,
                      fontWeight: on ? '600' : '400',
                      color: on ? palette.marvel : palette.inkSoft,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
      <Rule inset={GUTTER} />
    </View>
  );
}
