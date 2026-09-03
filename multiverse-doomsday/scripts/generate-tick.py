#!/usr/bin/env python3
"""
Synthesises the clock tick used by the countdown hero.

The sound is generated rather than sourced so it is reproducible, carries no
licensing question, and can be retuned by editing numbers instead of hunting
for another file.

    python3 scripts/generate-tick.py                 # writes the shipped tick
    python3 scripts/generate-tick.py --interval 3.0 --out /tmp/slower.wav

A mechanical tick is a very short broadband transient with a resonant peak —
an escapement hitting a pallet. Two of them, a little apart in pitch, read as
"tick, tock" rather than as a repeated beep, which is what makes a clock sound
like a clock.

STRIKE_INTERVAL is the knob that matters: seconds between strikes. A wall
clock is 1.0, which turned out to be too busy under a countdown. Slower reads
as heavier, and a slow clock is also a deeper one — WEIGHT stretches the decay
and drops the resonance to match, so a slow tick sounds like a big pendulum
rather than a fast tick with gaps in it.
"""
import argparse
import math
import random
import struct
import wave

RATE = 22050
STRIKE_INTERVAL = 2.0
WEIGHT = 1.6

# Deterministic: the same noise seed every run, so rebuilding the file does not
# produce a gratuitous binary diff.
SEED = 1812


def transient(freq, decay, length, bright):
    """A damped noise burst through a two-pole resonator: one escapement hit."""
    n = int(RATE * length)
    w = 2 * math.pi * freq / RATE
    r = math.exp(-1.0 / (decay * RATE))
    a1 = 2 * r * math.cos(w)
    a2 = -(r * r)

    out = []
    y1 = y2 = 0.0
    for i in range(n):
        t = i / RATE
        # A hard, very short excitation — the strike itself.
        drive = random.uniform(-1.0, 1.0) * math.exp(-t / 0.0012)
        y = drive + a1 * y1 + a2 * y2
        y2, y1 = y1, y
        # Body decay, plus a touch of high-frequency snap so it reads as
        # mechanical rather than as a soft thud.
        env = math.exp(-t / decay)
        snap = bright * math.exp(-t / 0.0025) * math.sin(2 * math.pi * 5200 * t)
        out.append(y * env + snap)
    return out


def place(buf, samples, at_seconds, gain):
    start = int(at_seconds * RATE)
    for i, v in enumerate(samples):
        j = start + i
        if 0 <= j < len(buf):
            buf[j] += v * gain


def build(interval, weight, out_path):
    random.seed(SEED)

    # The loop holds one tick and one tock, so it is twice the strike interval.
    loop_seconds = interval * 2
    total = int(RATE * loop_seconds)
    buf = [0.0] * total

    tick = transient(
        freq=2600 / weight ** 0.45,
        decay=0.010 * weight,
        length=0.10 * weight,
        bright=0.22 / weight ** 0.5,
    )
    tock = transient(
        freq=1950 / weight ** 0.45,
        decay=0.013 * weight,
        length=0.12 * weight,
        bright=0.16 / weight ** 0.5,
    )

    # Both transients decay to silence well before the next one starts, so the
    # loop point is inaudible.
    place(buf, tick, 0.0, 1.0)
    place(buf, tock, interval, 0.92)

    peak = max(abs(v) for v in buf) or 1.0
    # Deliberately quiet: this plays under everything else, and a countdown
    # that shouts is a smoke alarm.
    gain = 0.55 / peak

    frames = bytearray()
    for v in buf:
        s = max(-1.0, min(1.0, v * gain))
        frames += struct.pack("<h", int(s * 32767))

    with wave.open(out_path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(RATE)
        f.writeframes(bytes(frames))

    print(
        f"{out_path}  {len(frames)} bytes  {loop_seconds:g}s loop  "
        f"one strike every {interval:g}s  weight {weight:g}"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--interval", type=float, default=STRIKE_INTERVAL)
    parser.add_argument("--weight", type=float, default=WEIGHT)
    parser.add_argument("--out", default="assets/audio/tick.wav")
    args = parser.parse_args()
    build(args.interval, args.weight, args.out)
