import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomButton } from '@/components/common/CustomButton';
import { Marker, Meter, Rule } from '@/components/common/Primitives';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { usePalette } from '@/hooks/useTheme';
import { useTopInset } from '@/utils/layout';
import { GUTTER, motion, radius, space, type } from '@/styles/tokens';
import { buildRound, gradeLabel, type QuizQuestion } from '@/utils/quiz';

type Phase = 'idle' | 'answered' | 'done';

export default function QuizScreen() {
  const palette = usePalette();
  const router = useRouter();
  const topInset = useTopInset();
  const insets = useSafeAreaInsets();

  // A round is reproducible from its seed, which is the whole basis of a
  // challenge: your friend plays the identical ten questions, not "a quiz".
  const params = useLocalSearchParams<{ seed?: string; from?: string; target?: string }>();
  const challengeSeed = Number(params.seed);
  const challenge =
    Number.isFinite(challengeSeed) && challengeSeed > 0
      ? {
          seed: challengeSeed,
          from: params.from ?? 'A friend',
          target: Number.isFinite(Number(params.target)) ? Number(params.target) : null,
        }
      : null;

  const displayName = useRoadmapStore((state) => state.displayName);

  const [seed, setSeed] = useState(() => challenge?.seed ?? Date.now() % 100000);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');

  const round = useMemo(() => buildRound(seed), [seed]);
  const question: QuizQuestion | undefined = round[index];

  const restart = useCallback(() => {
    setSeed(Math.floor(Math.random() * 1_000_000));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setPhase('idle');
  }, []);

  const choose = (option: number) => {
    if (phase !== 'idle' || !question) return;
    const correct = option === question.answerIndex;
    if (correct) {
      setScore((value) => value + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setPicked(option);
    setPhase('answered');
  };

  const next = () => {
    if (index + 1 >= round.length) {
      setPhase('done');
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
    setPhase('idle');
  };

  const closeButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close quiz"
      onPress={router.back}
      hitSlop={12}
      style={{
        height: 36,
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.surface,
      }}
    >
      <Ionicons name="close" size={18} color={palette.ink} />
    </Pressable>
  );

  /* ---------------------------------------------------------------- *
   * Results
   * ---------------------------------------------------------------- */
  if (phase === 'done') {
    const grade = gradeLabel(score, round.length);
    const beat = challenge?.target != null ? score - challenge.target : null;

    const challengeFriend = async () => {
      const who = displayName.trim() || 'Someone';
      await Share.share({
        message:
          `I scored ${score}/${round.length} on the DOOM quiz. ` +
          `Same ten questions, no excuses:\n\n` +
          `multiversedoomsday://quiz?seed=${seed}&from=${encodeURIComponent(who)}&target=${score}`,
      }).catch(() => {
        // Dismissed — nothing to recover.
      });
    };
    return (
      <View style={{ flex: 1, backgroundColor: palette.canvas, paddingTop: topInset + space.sm }}>
        <View style={{ paddingHorizontal: GUTTER, alignItems: 'flex-end' }}>{closeButton}</View>

        <Animated.View
          entering={FadeInDown.duration(motion.slow)}
          style={{ flex: 1, justifyContent: 'center', paddingHorizontal: GUTTER }}
        >
          <Marker>Round complete</Marker>

          <Text
            style={{
              fontSize: 76,
              lineHeight: 82,
              fontWeight: '900',
              color: palette.ink,
              marginTop: space.sm,
            }}
          >
            {score}
            <Text style={{ fontSize: 30, color: palette.inkFaint }}>/{round.length}</Text>
          </Text>

          <Text style={{ ...type.title, color: palette.marvel, marginTop: space.md }}>
            {grade.title}
          </Text>
          <Text style={{ ...type.body, color: palette.inkSoft, marginTop: space.xs }}>
            {grade.blurb}
          </Text>

          {beat != null ? (
            <Text
              style={{
                ...type.bodyStrong,
                color: beat > 0 ? palette.accent : beat === 0 ? palette.inkSoft : palette.crimson,
                marginTop: space.lg,
              }}
            >
              {beat > 0
                ? `You beat ${challenge?.from} by ${beat}.`
                : beat === 0
                  ? `Dead even with ${challenge?.from}.`
                  : `${challenge?.from} beat you by ${-beat}.`}
            </Text>
          ) : null}

          <View style={{ marginTop: space.xxl, gap: space.md }}>
            <CustomButton
              label="Challenge a friend"
              icon="share-outline"
              size="lg"
              fullWidth
              onPress={challengeFriend}
            />
            <CustomButton
              label="Play again"
              icon="refresh"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={restart}
            />
            <CustomButton
              label="Back to prep"
              icon="arrow-back"
              variant="ghost"
              size="lg"
              fullWidth
              onPress={router.back}
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.canvas, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ ...type.body, color: palette.inkSoft }}>Could not build a round.</Text>
      </View>
    );
  }

  /* ---------------------------------------------------------------- *
   * Question
   * ---------------------------------------------------------------- */
  const progress = (index + (phase === 'answered' ? 1 : 0)) / round.length;

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas, paddingTop: topInset + space.sm }}>
      {/* Progress + close */}
      <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: space.md }}>
          <Marker>
            {challenge
              ? `${index + 1} of ${round.length} · beating ${challenge.from}'s ${challenge.target ?? '?'}`
              : `${index + 1} of ${round.length} · ${score} right`}
          </Marker>
          <View style={{ marginTop: space.sm }}>
            <Meter value={progress * 100} />
          </View>
        </View>
        {closeButton}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: GUTTER,
          paddingTop: space.xxl,
          paddingBottom: insets.bottom + space.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View key={question.id} entering={FadeIn.duration(motion.base)}>
          <Text style={{ ...type.title, color: palette.ink }}>{question.prompt}</Text>
          {question.subject ? (
            <Text style={{ ...type.heading, color: palette.marvel, marginTop: space.sm }}>
              {question.subject}
            </Text>
          ) : null}

          <View style={{ marginTop: space.xl, gap: space.md }}>
            {question.options.map((option, optionIndex) => {
              const isAnswer = optionIndex === question.answerIndex;
              const isPicked = optionIndex === picked;
              const revealed = phase === 'answered';

              // After answering, the right option always turns green — including
              // when it was missed, so the round teaches rather than just scores.
              let borderColor = palette.line;
              let background = palette.surface;
              let textColor = palette.ink;

              if (revealed && isAnswer) {
                borderColor = palette.accent;
                background = `${palette.accent}1F`;
                textColor = palette.accent;
              } else if (revealed && isPicked) {
                borderColor = palette.crimson;
                background = `${palette.crimson}1F`;
                textColor = palette.crimson;
              } else if (revealed) {
                textColor = palette.inkFaint;
              }

              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityLabel={option}
                  disabled={revealed}
                  onPress={() => choose(optionIndex)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: space.lg,
                    paddingVertical: space.lg,
                    borderRadius: radius.lg,
                    borderWidth: 1.5,
                    borderColor,
                    backgroundColor: background,
                  }}
                >
                  <Text style={{ ...type.bodyStrong, color: textColor, flex: 1 }}>{option}</Text>
                  {revealed && isAnswer ? (
                    <Ionicons name="checkmark-circle" size={20} color={palette.accent} />
                  ) : revealed && isPicked ? (
                    <Ionicons name="close-circle" size={20} color={palette.crimson} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {phase === 'answered' ? (
            <Animated.View entering={FadeInDown.duration(motion.base)} exiting={FadeOut}>
              <View style={{ marginTop: space.xl }}>
                <Rule />
                <Text style={{ ...type.body, color: palette.inkSoft, paddingVertical: space.lg }}>
                  {question.explanation}
                </Text>
                <Rule />
              </View>

              <View style={{ marginTop: space.lg }}>
                <CustomButton
                  label={index + 1 >= round.length ? 'See results' : 'Next question'}
                  icon="arrow-forward"
                  iconPosition="right"
                  size="lg"
                  fullWidth
                  onPress={next}
                />
              </View>
            </Animated.View>
          ) : null}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
