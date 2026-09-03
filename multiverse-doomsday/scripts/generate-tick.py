#!/usr/bin/env python3
"""
Synthesises the clock tick used by the countdown hero.

The sound is generated rather than sourced so it is reproducible, carries no
licensing question, and can be retuned by editing numbers instead of hunting
for another file. Run: python3 scripts/generate-tick.py

A mechanical tick is a very short broadband transient with a resonant peak —
an escapement hitting a pallet. Two of them, a semitone or so apart, read as
"tick, tock" rather than as a repeated beep, which is what makes a clock sound
like a clock.
"""
import math
import random
import struct
import wave

RATE = 22050
LOOP_SECONDS = 2.0
OUT = "assets/audio/tick.wav"

# Deterministic: the same noise seed every run, so rebuilding the file does not
# produce a gratuitous binary diff.
random.seed(1812)


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


total = int(RATE * LOOP_SECONDS)
buf = [0.0] * total

tick = transient(freq=2600, decay=0.010, length=0.10, bright=0.22)
tock = transient(freq=1950, decay=0.013, length=0.12, bright=0.16)

# One tick on the second, one tock on the half — the loop is seamless because
# both transients decay to silence well before the next one starts.
place(buf, tick, 0.0, 1.0)
place(buf, tock, 1.0, 0.92)

peak = max(abs(v) for v in buf) or 1.0
# Deliberately quiet: this plays under everything else, and a countdown that
# shouts is a smoke alarm.
gain = 0.55 / peak

frames = bytearray()
for v in buf:
    s = max(-1.0, min(1.0, v * gain))
    frames += struct.pack("<h", int(s * 32767))

with wave.open(OUT, "wb") as f:
    f.setnchannels(1)
    f.setsampwidth(2)
    f.setframerate(RATE)
    f.writeframes(bytes(frames))

print(f"{OUT}  {len(frames)} bytes  {LOOP_SECONDS}s  {RATE}Hz mono")
