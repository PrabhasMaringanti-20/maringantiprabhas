#!/usr/bin/env python3
"""
Prepares the cold-open artwork from the supplied poster layers.

    python3 scripts/prepare-intro-art.py

The three layers in scripts/art-source/ were separated from one poster, so
they share a single 1080x1927 canvas. Keeping the text and figure at that
full canvas size is deliberate: rendered into a container of the same aspect
ratio they re-register with each other for free, with no offset arithmetic to
get wrong.

The orb is the exception. It has to spin about its own centre, and rotating a
full-canvas image spins it about the canvas centre instead — the orb would
orbit the screen. So it is cropped to a square around its own disc, and the
crop's centre is emitted below as a fraction of the original canvas, which is
what the component uses to place it back exactly where the poster had it.

Cropping away empty transparent padding is not a change to the artwork: every
visible pixel is untouched.
"""
import json
from PIL import Image

SRC = "scripts/art-source"
OUT = "assets/images/intro"
ALPHA_FLOOR = 8


def bbox(im):
    return im.getchannel("A").point(lambda v: 255 if v > ALPHA_FLOOR else 0).getbbox()


def main():
    text = Image.open(f"{SRC}/doom-text.png").convert("RGBA")
    figure = Image.open(f"{SRC}/doom-figure.png").convert("RGBA")
    orb = Image.open(f"{SRC}/doom-orb.png").convert("RGBA")

    canvas_w, canvas_h = text.size
    assert figure.size == (canvas_w, canvas_h), "layers must share one canvas"
    assert orb.size == (canvas_w, canvas_h), "layers must share one canvas"

    # Text and figure ship as-is: same canvas, so they self-register.
    text.save(f"{OUT}/doom-text.png")
    figure.save(f"{OUT}/doom-figure.png")

    # Orb: square crop centred on its own disc, so rotation spins in place.
    ox0, oy0, ox1, oy1 = bbox(orb)
    cx, cy = (ox0 + ox1) / 2, (oy0 + oy1) / 2
    side = max(ox1 - ox0, oy1 - oy0)
    side = int(side * 1.04) + (side % 2)  # a little air so rotation never clips
    half = side // 2
    left, top = int(round(cx)) - half, int(round(cy)) - half
    orb.crop((left, top, left + side, top + side)).save(f"{OUT}/doom-orb.png")

    geometry = {
        "canvasAspect": round(canvas_w / canvas_h, 6),
        "orbCentreX": round((left + half) / canvas_w, 6),
        "orbCentreY": round((top + half) / canvas_h, 6),
        "orbSizeX": round(side / canvas_w, 6),
    }
    with open(f"{OUT}/geometry.json", "w") as f:
        json.dump(geometry, f, indent=2)
        f.write("\n")

    print(f"canvas          {canvas_w}x{canvas_h}  aspect {geometry['canvasAspect']}")
    print(f"orb crop        {side}x{side} from ({left},{top})")
    print(f"orb centre      x {geometry['orbCentreX']}  y {geometry['orbCentreY']}")
    print(f"orb size        {geometry['orbSizeX']} of canvas width")
    print(f"wrote {OUT}/doom-text.png, doom-figure.png, doom-orb.png, geometry.json")


if __name__ == "__main__":
    main()
