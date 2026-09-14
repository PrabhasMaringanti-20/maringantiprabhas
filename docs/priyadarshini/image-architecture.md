# PRIYADARSHINI — Image Architecture & Prompt Kit

Reverse-engineered from two reference sheets: **Variant A** (neutral studio backdrop,
secular/family framing — [`reference-variant-a-family.png`](./reference-variant-a-family.png))
and **Variant B** (parchment backdrop, temple/devotional framing —
[`reference-variant-b-temple.png`](./reference-variant-b-temple.png)). Both share one
underlying template — an 11-section "product turnaround" layout. Below: the reusable
architecture, a full master prompt for each variant, a panel-by-panel prompt set for the
reliable route, and the typography spec to assemble it exactly like the reference.

## Reality check before you spend generations

No current image model reliably produces this *entire* 13-shot, fully-labeled sheet in one
perfect pass — the failure points are always the same: brass hardware drifts in shape
between panels, the small caption text garbles, and the exploded-view part count wanders.
Two honest paths:

- **One-shot attempt** — use the master prompt below whole, in a model that follows
  structured text well (GPT-4o/DALL·E-3-class, or Midjourney v6/v7). Good for a fast concept
  pass; expect to regenerate a few times and hand-fix text.
- **Panel-by-panel + composite** (what actually produces a clean sheet like the references)
  — generate the ~13 shots separately with a locked style block for consistency, then lay
  them into the grid in Figma/Photoshop/Illustrator and add the typography yourself. Section
  5 gives you that prompt set and the exact type spec.

---

## 1. Shared Product DNA

Paste this paragraph into *every* panel prompt, unchanged, for both variants — it's what
keeps the case looking like the same object across 13 separate generations.

> A vintage 1950s-style steampunk travel suitcase reimagined as a home video-communication
> device. Compact rectangular case roughly 45×30×15cm, dark aged walnut/rosewood wood-grain
> paneling with visible grain texture. Antique brass hardware throughout: brass corner
> guards with fleur-de-lis filigree engraving, twin twist-latch closures, brass strap
> hinges, a riveted cognac-brown leather top carrying handle. Front face centers on an
> engraved brass nameplate set inside a brass lotus-flower medallion. Interior, when open,
> reveals a widescreen viewing panel bordered in brass filigree, flanked by two circular
> brass speaker grilles with intricate perforated radial patterns, a row of black bakelite
> control knobs along the base, and a telescoping brass microphone on a ball-joint stalk
> mounted center-front. Studio product photography, soft diffused three-point lighting,
> shallow depth of field, hyper-detailed macro textures on wood grain and brass, warm
> antique color grade, 1950s industrial design fused with Art Deco brass detailing. Sharp
> focus, physically-based rendering, 8k product catalog quality.

---

## 2. The 11-Section Layout Architecture (generic template)

This is the shared skeleton — fill the `{{ }}` slots differently per variant (Section 3).

1. **Front view (closed)** — dead-on front elevation, case closed, nameplate emblem centered
2. **Three-quarter view** — closed case, camera raised ~30°, rotated ~35°, handle visible
3. **Back view** — closed case reversed, two ventilation grilles flanking a lower brass
   plaque with `{{back-plaque-text}}`
4. **Left side view** — closed case, profile, side panel shows `{{side-motif}}`
5. **Right side view** — closed case, opposite profile, mirrored `{{side-motif}}`
6. **Top view** — closed case from directly above, handle laid flat, circular medallion
   motif `{{top-motif}}` visible on the lid
7. **Opening sequence (4-step strip)** — A. Closed · B. Unlatching (both latches flipped
   open) · C. Opening (lid at ~40°) · D. Fully open (lid at 100°+), connected by arrows,
   same camera angle across all four
8. **Fully open — front view (hero shot)** — case fully open facing camera, interior screen
   displaying `{{screen-image-A}}`, speaker grilles + knobs + center microphone all visible
9. **Fully open — angle view** — same open case, 3/4 angle, screen displaying
   `{{screen-image-B}}`
10. **Exploded view** — the case disassembled into `{{n}}` layered components floating
    along a horizontal axis, thin dashed leader lines to numbered labels, legend list to the
    right
11. **Detailed callouts (2×4 grid)** — eight macro close-ups: A. Latch · B. Hinge ·
    C. Control knob(s) · D. Microphone · E. Speaker grille · F. Screen frame detail ·
    G. Internal mechanism · H. Emblem close-up

Shared chrome: title lockup top-left, "A WINDOW TO THE ONES YOU LOVE" centered top, a short
vertical tagline top-right, a tracked-out four-word tagline bottom-center, small caption
bottom-right.

---

## 3A. Variant A — Family / Secular (matches the neutral-backdrop sheet)

```
PRIYADARSHINI product concept sheet, 11-panel technical marketing layout, wide 16:9 landscape canvas, warm neutral grey seamless studio background throughout.

[Shared Product DNA paragraph from Section 1]

TITLE BLOCK, top-left: serif display wordmark "PRIYADARSHINI" in embossed antique bronze-gold, letter-spaced; below it in small caps "DISTANCES FADE" / "PEOPLE REMAIN" on two lines.
TOP-CENTER: small serif caps, three lines: "A WINDOW / TO THE ONES / YOU LOVE".
TOP-RIGHT: small serif caps vertical list "SEE / SPEAK / FEEL / CLOSER" under a thin horizontal rule.

PANEL 1 — front view, closed, brass lotus medallion nameplate engraved "PRIYADARSHINI", caption below: "1. FRONT VIEW (CLOSED)"
PANEL 2 — three-quarter view, closed, caption: "2. THREE-QUARTER VIEW"
PANEL 3 — back view, closed, two perforated brass ventilation grilles flanking a brass plaque engraved in Telugu script "SAMBANDHALU SARHADDULU LENIVI" (relationships know no borders), caption: "3. BACK VIEW"
PANEL 4 — left side view, plain wood panel with brass corner trim, caption: "4. LEFT SIDE VIEW"
PANEL 5 — right side view, mirrored, caption: "5. RIGHT SIDE VIEW"
PANEL 6 — top view, handle flat, small brass fleur-de-lis medallion centered, caption: "6. TOP VIEW"

SECTION 7 "OPENING SEQUENCE (SUITCASE STYLE)": four-step strip with connecting arrows, labeled A. CLOSED, B. UNLATCHING, C. OPENING, D. FULLY OPEN.

SECTION 8 "FULLY OPEN – FRONT VIEW": large hero render, case fully open facing camera; interior screen shows a warm sepia-toned vintage portrait photograph of a young Indian woman with a bindi and traditional gold jewelry, gently smiling, three-quarter face; "PRIYADARSHINI" printed along the screen's lower bezel; brass speaker grilles and control knobs flank the screen; center microphone stalk.

SECTION 9 "FULLY OPEN – ANGLE VIEW": same open case from a 3/4 angle; screen shows a matching sepia portrait of a young Indian man in a collared shirt, warm smile, chin resting on hand. Small vertical caption to its right: "SAME SKIES / DIFFERENT PLACES / STILL TOGETHER".

SECTION 10 "EXPLODED VIEW": the case disassembled into 12 layered floating components along a horizontal axis with thin dashed leader lines and numbered tags 1–12; legend list beside it reading: 1. Front Panel 2. Latch Mechanism 3. Outer Frame 4. Viewing Screen 5. Screen Frame 6. Internal Chassis 7. Speaker Unit 8. Microphone Assembly 9. Control Panel 10. Base Housing 11. Rear Panel 12. Bottom Plate.

SECTION 11 "DETAILED CALLOUTS": 2×4 grid of macro close-up shots labeled A. LATCH, B. HINGE, C. CONTROL KNOB, D. MICROPHONE, E. SPEAKER GRILLE, F. SCREEN FRAME DETAIL, G. INTERNAL MECHANISM, H. EMBLEM (CLOSE-UP — brass lotus medallion with "PRIYADARSHINI" engraved).

BOTTOM-CENTER, small tracked-out caps: "TRADITION × TECHNOLOGY × HUMAN CONNECTION × TIMELESS"
BOTTOM-RIGHT, small italic serif: "A 1950s VISION FOR A CLOSER TOMORROW"

Overall mood: warm, nostalgic, precise technical-catalog rendering style, consistent lighting and proportions across every panel, no color drift in the wood or brass between panels.
```

---

## 3B. Variant B — Temple / Devotional (matches the parchment-backdrop sheet)

```
PRIYADARSHINI product concept sheet, 11-panel technical marketing layout, wide 16:9 landscape canvas, aged cream parchment paper-texture background throughout, warm sepia vignette.

[Shared Product DNA paragraph from Section 1]

LEFT MARGIN, full height: faint sepia line-art of a carved stone temple pillar running down the edge; three small brass oil lamps (diyas) hanging on chains at the top-left corner, flames lit.
TOP-RIGHT BACKGROUND (faint, low-opacity line art): a distant temple gopuram tower silhouette.

TITLE BLOCK, top-left: serif display wordmark "PRIYADARSHINI" in embossed antique bronze-gold; below it one line of Devanagari "दूरं न भवति । हृदयानि सदा सन्निकटानि" (verify exact diacritics with a Sanskrit speaker before final use), then small caps "DISTANCES FADE • PEOPLE REMAIN".
TOP-CENTER: small serif caps "A WINDOW / TO THE ONES YOU LOVE".
TOP-RIGHT: vertical stack "SEE / SPEAK / FEEL / CLOSER", and below it smaller "TECHNOLOGY IN SERVICE OF / HUMAN CONNECTION / A TIMELESS IDEA".
LEFT SIDE, mid-height, small vertical caps: "PEOPLE / PLACES / PRAYERS / ALWAYS / NEAR".

PANEL 1 — front view, closed, brass lotus medallion nameplate flanked by two carved brass apsara/deity figure reliefs set into the wood on either side, caption: "1. FRONT VIEW (CLOSED)"
PANEL 2 — three-quarter view, closed, same deity reliefs visible, caption: "2. THREE-QUARTER VIEW"
PANEL 3 — back view, closed, circular brass medallion engraved with the Om (ॐ) symbol centered above a plaque engraved in Devanagari with the shanti mantra "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयः" (may all be happy, may all be free from illness), flanked by ventilation grilles, caption: "3. BACK VIEW"
PANEL 4 — left side view, small carved brass deity figure relief on the wood panel, caption: "4. LEFT SIDE VIEW"
PANEL 5 — right side view, mirrored deity relief, caption: "5. RIGHT SIDE VIEW"
PANEL 6 — top view, handle flat, large circular brass sunburst medallion centered on the lid, caption: "6. TOP VIEW"

SECTION 7 "OPENING SEQUENCE (SUITCASE STYLE)": four-step strip, A. CLOSED, B. UNLATCHING, C. OPENING, D. FULLY OPEN, connecting arrows.

SECTION 8 "FULLY OPEN – FRONT VIEW": hero render, case fully open; small brass temple-bell finials flank the top corners of the screen frame; interior screen shows a warm sepia devotional-style portrait of Krishna playing a flute, peacock feather in his crown, soft glowing light; "PRIYADARSHINI" on the lower bezel.

SECTION 9 "FULLY OPEN – ANGLE VIEW": same open case, 3/4 angle; screen shows a sepia landscape of a temple gopuram beside still water at dusk, warm golden light.

SECTION 10 "EXPLODED VIEW": case disassembled into 13 layered floating components along a horizontal axis, dashed leader lines, numbered tags 1–13; small caption above the diagram: "EVERY PART A PURPOSE · EVERY DETAIL A BLESSING"; legend: 1. Front Panel 2. Decorative Frame 3. Viewing Screen 4. Screen Housing 5. Speaker Unit 6. Internal Frame 7. Microphone Assembly 8. Control Panel 9. Main Chassis 10. Side Panel (L) 11. Side Panel (R) 12. Rear Panel 13. Bottom Plate.

SECTION 11 "DETAILED CALLOUTS": 2×4 grid — A. LATCH MECHANISM, B. HINGE DETAIL, C. CONTROL KNOBS, D. MICROPHONE, E. SPEAKER GRILLE, F. SCREEN FRAME DETAIL, G. INTERNAL MECHANISM, H. EMBLEM DETAIL (circular brass medallion engraved with the Om symbol and radiating sunburst pattern).

BOTTOM-CENTER, small tracked-out caps: "TRADITION × CRAFTSMANSHIP × IMAGINATION × HUMAN CONNECTION"
BOTTOM-RIGHT, small Devanagari line "यत्र भाव: तत्र दर्शनम्" (verify diacritics) above small caps "WHERE THERE IS LOVE, THERE IS A VIEW"

Overall mood: devotional, warm, reverent, temple-adjacent craftsmanship — treat all deity and Om imagery respectfully and traditionally, no distortion or irreverent styling. Consistent lighting, proportions, and brass tone across every panel.
```

---

## 4. If you're generating panel-by-panel (the reliable route)

Use this pattern for each of the 13 shots. Keep the **Product DNA** block byte-for-byte
identical across all 13 calls — that consistency is what makes the final composite read as
one object. If your tool supports an image/character reference (Midjourney `--cref`, an
IP-Adapter, or "use this image as reference" in a chat-based image tool), feed it your Panel
1 render for every subsequent panel — it matters more than wording for keeping the wood
grain and brass identical.

```
[Product DNA paragraph]

Camera: {{ e.g. "dead-on front elevation, eye-level, case closed" }}
Composition: single product, centered, on {{ grey seamless studio sweep / aged parchment surface }}, soft shadow beneath, no props, no hands.
This shot only — do not include any text, labels, or numbers in the image itself.
```

Then add the one line that differs per shot:

| # | Camera / content line to swap in |
|---|---|
| 1 | Dead-on front elevation, closed |
| 2 | Raised 30°, rotated 35° right, closed |
| 3 | Direct rear elevation, closed |
| 4 | Left profile, closed |
| 5 | Right profile, closed |
| 6 | Top-down, handle flat, closed |
| 7A–D | Same front-3/4 angle across all four; vary only latch/lid state (closed → latches open → lid 40° → lid 100°+) |
| 8 | Front elevation, fully open, screen content: {{portrait / Krishna}} |
| 9 | 3/4 angle, fully open, screen content: {{portrait / temple landscape}} |
| 10 | Case exploded along a single horizontal axis, {{12 or 13}} components evenly spaced, no background props |
| 11A–H | Extreme macro, shallow DOF, on: latch / hinge / knob / microphone / speaker grille / screen frame corner / internal gear mechanism / emblem medallion |

Generate all 19 sub-images this way, then move to Section 6.

---

## 5. Compositing & typography spec (recreating the sheet layout itself)

Once you have the renders, assemble in Figma/Illustrator/Photoshop at a **1660×945px** (or
any 16:9-ish) canvas:

- **Background:** flat warm grey `#B7B0A8` (Variant A) or an aged-parchment paper texture
  `#D9CDB0` with a soft vignette (Variant B)
- **Title wordmark:** a serif display face with old-style engraving feel (e.g. *Trajan Pro*,
  *Cinzel*, or *Playfair Display* at a heavy weight), color `#8A6A2C`–`#6E5220` gradient,
  tracked out ~+40
- **Section captions / small labels:** a plain serif or serif-caps at 11–13px, tight
  tracking, dark warm grey `#3A342C`
- **Body/tagline text:** same serif family, regular weight, small size, wide letter-spacing
  for the vertical taglines
- **Grid:** row 1 = 6 equal-width panels; row 2 = 4-step strip (narrower) + two large hero
  panels; row 3 = wide exploded-view panel + 2×4 callout grid
- **Leader lines (exploded view & callouts):** hairline 0.5px, `#8A6A2C`, with small solid
  dots at each anchor point
- **Numbering style:** "N. LABEL" for main sections, "LETTER. LABEL" for sub-callouts —
  matches the reference exactly

---

## 6. Negative prompt / consistency guardrails

Append to any of the prompts above if your tool supports negative prompting:

```
no plastic sheen, no modern smartphone UI elements, no visible screws unless specified, no warped or melted brass filigree, no extra latches, no blurry or garbled embossed text, no distorted hands, no anatomically incorrect deity figures, no glossy high-saturation colors, keep wood grain direction consistent, keep brass tone consistent across panels
```

---

**One judgment call worth flagging:** Variant B uses Krishna imagery and traditional
Sanskrit verses respectfully and devotionally, matching how it's already used in the
reference. That's fine to keep generating. If this is taken toward a real product or ad
campaign rather than a concept render, it'd be worth having the Sanskrit lines checked by a
native speaker before it goes anywhere public; stylized engraving at low resolution is an
easy place for a diacritic to get lost.
