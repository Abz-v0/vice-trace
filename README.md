# VICE//TRACE

### A neon-noir forensic detective game powered by the Unlayer Image Editor

<p align="center">
  <img src="public/screenshot.png" width="760" alt="VICE//TRACE evidence viewer showing a tampered night-scene photo" />
</p>

> Every picture tells a story. Someone changed this one.

VICE//TRACE is an interactive browser game in which you play a Vice City police detective investigating a tampered surveillance image. It was built for the **#BuiltWithImageEditor Challenge** to demonstrate that image editing can be a game mechanic—not just a utility.

The goal is simple: inspect the evidence, recover the original timestamp, make the right accusation, and close the case before Internal Affairs closes it for you.

## Why it is different

Most editor demos ask players to make something look good. VICE//TRACE gives them a reason to use the tools.

- **The editor is the investigation.** Players enhance, zoom, mark, annotate, and redact a crime-scene image to find the manipulation.
- **Evidence must be verified.** Exporting an edited exhibit unlocks a forensic recovery step; it does not automatically solve the case.
- **Choices have stakes.** Incorrect recovered times lower the case score, analyst notes cost points, and a wrong accusation ends the run.
- **Results are replayable.** Every completed case produces a score, rank, time, hint count, and a shareable case report.

## Play flow

1. Initialize the VCPD terminal and enter a detective badge name.
2. Read Case #001: *The Vice City Metro Incident*.
3. Open the evidence and inspect the camera timestamp in the lower-right corner.
4. Use the editor’s forensic tools to enhance or zoom into the artifact. Marking the clue is encouraged before exporting your exhibit.
5. Select **SUBMIT FINDINGS** to download the edited exhibit and enter the recovered time.
6. Identify the alteration during the Internal Affairs review.
7. Receive a rank and share the case report.

### Scoring

Every investigation starts at **100 points**.

| Action | Score effect |
| --- | --- |
| Analyst note requested | −15 points |
| Incorrect recovered time | −10 points |
| Longer investigation | Small time deduction, capped at −20 points |

Ranks range from **S-RANK DETECTIVE** to **STREET ROOKIE**, so a clean, fast solve is worth replaying for.

## Unlayer Image Editor integration

The Unlayer React Image Editor is the core of the experience and is configured as a fictional VCPD forensic workstation:

| Editor capability | In-game label | Purpose in the investigation |
| --- | --- | --- |
| Filters | `ENHANCE` | Reveal detail in the low-light evidence image |
| Crop | `ZOOM` | Inspect the camera overlay and timestamp closely |
| Draw | `MARK` | Circle or point out suspicious artifacts |
| Text | `ANNOTATE` | Add an investigator’s notes to the exhibit |
| Shapes | `REDACT` | Create evidence-safe redactions |

The editor uses a dark, left-docked interface and removes unrelated tools such as resize, stickers, and frames to keep attention on the case. Players can also upload a replacement image to explore the forensic toolkit with their own evidence.

## Features

- CRT terminal styling, scanlines, glitch transitions, and a neon Vice City atmosphere
- Optional music, procedural terminal hum, and synthesized UI sound effects
- Skip-able boot sequence for repeat players
- Mobile-aware evidence workspace with touch-sized controls and viewport-safe sizing
- Accessible keyboard startup, visible focus states, and reduced-motion support
- Image upload validation for file type and an 8 MB maximum size
- Downloadable, annotated evidence exhibits
- Native sharing or clipboard fallback for final case reports
- Configured Open Graph and Twitter metadata for polished social previews

## Technology

- [Next.js 16](https://nextjs.org/)
- React 19
- [Unlayer React Image Editor](https://www.npmjs.com/package/@unlayer/react-image-editor)
- Tailwind CSS 4
- Web Audio API

## Run locally

### Requirements

- Node.js 20.9 or later
- npm

### Setup

```bash
git clone https://github.com/Abz-v0/vice-trace.git
cd vice-trace
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to begin the investigation.

### Production build

```bash
npm run lint
npm run build
npm run start
```

## Deployment

The app is a static-friendly Next.js site and can be deployed to Vercel or another Next.js host.

Set this environment variable in the deployment dashboard so social cards resolve against your live site:

```bash
NEXT_PUBLIC_SITE_URL=https://your-live-domain.example
```

## Project structure

```text
src/app/
  page.js       # Game states, editor configuration, scoring, audio, and sharing
  globals.css   # CRT styling, responsive workspace, motion and touch support
  layout.js     # Font, metadata, and social-preview configuration
public/
  evidence1.jpg # Case #001 evidence
  bg.jpg        # Terminal background texture
  music.mp3     # Optional ambient soundtrack
```

## Roadmap

The next natural expansion is a compact case-file campaign: additional original evidence images, distinct forensic puzzles, and a persistent detective record. The current build is deliberately focused on making one case satisfying end-to-end before expanding the content.

## Note on inspiration

VICE//TRACE is an unofficial fan-made creative project inspired by neon-noir crime fiction and the Vice City setting. It is not affiliated with or endorsed by Rockstar Games or Grand Theft Auto.

---

Built for the **#BuiltWithImageEditor Challenge**.
