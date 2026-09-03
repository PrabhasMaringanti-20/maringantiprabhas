#!/usr/bin/env python3
"""
Extracts the shipped countdown tick from the recorded clock in
scripts/audio-source/doomsday-clock-source.mp3.

    python3 scripts/extract-tick-loop.py

The source is a ~15s recording of a real clock. Rather than loop the whole
clip (its ticks drift between 1.05s and 1.09s apart, which would make a loop
seam audible eventually), this cuts exactly one cycle from the cleanest,
most settled ticking near the end of the recording — the "last tick" — and
loops that one cycle. Both loop boundaries are placed at the quietest instant
in a small search window before their tick's attack, and a short equal-power
crossfade blends the true head against the true tail at that already-quiet
point, so the wrap has no audible click.

Requires `pymp3` to decode the source (`pip install pymp3`); everything after
that is plain wave/struct, no other audio dependencies.
"""
import math
import struct
import wave

import mp3

SRC = "scripts/audio-source/doomsday-clock-source.mp3"
OUT = "assets/audio/tick.wav"
PREVIEW = "node_modules/.cache/tick-preview.wav"  # scratch; never lands in assets/

DECODE_RATE = 44100
OUT_RATE = 22050  # halved: a UI tick loses nothing above ~10kHz, and it halves the asset.

# Found by locating tick onsets in the source (see the analysis in this file's
# git history / PR description) and picking the two nearest the end of the
# clip, which are the cleanest and most representative of a steady tick.
LOOP_ATTACK_A = 13.5167
LOOP_ATTACK_B = 14.5669
QUIET_SEARCH_BACK = 0.20
QUIET_SEARCH_FRONT = 0.03
QUIET_WINDOW_MS = 6
CROSSFADE_MS = 12
TARGET_PEAK = 0.62


def decode(path):
    out = bytearray()
    with open(path, "rb") as f:
        d = mp3.Decoder(f)
        rate, channels = d.get_sample_rate(), d.get_channels()
        while True:
            chunk = d.read(1 << 16)
            if not chunk:
                break
            out += chunk
    assert rate == DECODE_RATE, f"unexpected source rate {rate}"
    n = len(out) // (2 * channels)
    samples = struct.unpack("<%dh" % (n * channels), bytes(out))
    if channels == 1:
        return list(samples)
    return [(samples[2 * i] + samples[2 * i + 1]) / 2 for i in range(n)]


def quietest_point(mono, attack_t, rate):
    a = int((attack_t - QUIET_SEARCH_BACK) * rate)
    b = int((attack_t - QUIET_SEARCH_FRONT) * rate)
    w = int(rate * QUIET_WINDOW_MS / 1000)
    best = (float("inf"), a)
    for i in range(a, b - w):
        energy = sum(abs(v) for v in mono[i : i + w])
        if energy < best[0]:
            best = (energy, i)
    return best[1]


def eq_power(t):
    return math.sin(t * math.pi / 2)


def crossfade_loop(loop, rate):
    x = int(rate * CROSSFADE_MS / 1000)
    n = len(loop)
    head, tail = loop[0:x], loop[n - x : n]
    blended = [head[i] * eq_power(i / x) + tail[i] * eq_power(1 - i / x) for i in range(x)]
    return blended + loop[x : n - x]


def normalize(samples, target_peak):
    peak = max(abs(v) for v in samples) or 1
    gain = target_peak * 32768 / peak
    return [max(-32768, min(32767, int(v * gain))) for v in samples]


def decimate_by_2(samples):
    # A 3-tap box low-pass before dropping every other sample: cheap
    # anti-aliasing, adequate for a short percussive loop.
    padded = [samples[0]] + samples + [samples[-1]]
    filtered = [(padded[i] + 2 * padded[i + 1] + padded[i + 2]) / 4 for i in range(len(samples))]
    return filtered[::2]


def write_wav(path, samples, rate):
    frames = bytearray()
    for v in samples:
        frames += struct.pack("<h", int(max(-32768, min(32767, v))))
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(rate)
        f.writeframes(bytes(frames))


def main():
    mono = decode(SRC)

    start = quietest_point(mono, LOOP_ATTACK_A, DECODE_RATE)
    end = quietest_point(mono, LOOP_ATTACK_B, DECODE_RATE)
    loop = mono[start:end]

    looped = crossfade_loop(loop, DECODE_RATE)
    looped = normalize(looped, TARGET_PEAK)
    looped = decimate_by_2(looped)

    write_wav(OUT, looped, OUT_RATE)
    print(f"{OUT}  {len(looped)} frames  {len(looped)/OUT_RATE:.3f}s loop  {OUT_RATE}Hz mono")

    write_wav(PREVIEW, looped * 8, OUT_RATE)
    print(f"{PREVIEW}  {len(looped)*8/OUT_RATE:.2f}s (8 loops, for listening only)")


if __name__ == "__main__":
    main()
