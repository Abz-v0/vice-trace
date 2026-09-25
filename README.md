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
- **Build the deduction.** A two-column evidence board asks players to connect a visible clue with the conclusion it supports before Internal Affairs accepts an accusation.
- **Choices have stakes.** Incorrect recovered times lower the case score, analyst notes cost points, and a wrong accusation ends the run.
- **Results are replayable.** Every completed case produces a score, rank, time, hint count, and a shareable case report.

## Play flow

1. Initialize the VCPD terminal and enter a detective badge name.
2. Choose an active investigation from the Case Files terminal.
3. Open the evidence and inspect the camera timestamp in the lower-right corner.
4. Use the editor’s forensic tools to enhance or zoom into the artifact. Marking the clue is encouraged before exporting your exhibit.
5. Select **SUBMIT FINDINGS** to download the edited exhibit and enter the recovered time.
6. Connect the observed detail to its implication on the evidence board.
7. Identify the alteration during the Internal Affairs review.
8. Receive a rank and share the case report.

### Scoring

Every investigation starts at **100 points**.

| Action | Score effect |
| --- | --- |
| Analyst note requested | −15 points |
| Incorrect recovered time | −10 points |
| Longer investigation | Small time deduction, capped at −20 points |
| Correct evidence-board link | +5 points |
| Incorrect evidence-board link | −5 points |

Ranks range from **S-RANK DETECTIVE** to **STREET ROOKIE**, so a clean, fast solve is worth replaying for. The Case Files terminal stores the best score for each case on the player’s device and calculates a campaign rank from completed investigations.

## Active cases

| Case | Investigation | Forensic challenge |
| --- | --- | --- |
| #001 | *The Vice City Metro Incident* | Recover the true time beneath a falsified surveillance timestamp. |
| #002 | *The Marina Exchange* | Expose an impossible silhouette that exists in the water reflection but not on the dock. |
| #003 | *The Courier’s Double* | Prove that a delivery scooter was cloned to fabricate an impossible route. |
| #004 | *The Penthouse Alibi* | Find the palm shadow that contradicts the position of the sunrise. |
| #005 | *The Missing Manifest* | Enhance a folded shipping document to recover a concealed container route. |

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
- A recurring Internal Affairs contact, Analyst M. Voss, who sends case-specific briefings and debriefs

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
  evidence2.jpg # Case #002 marina evidence
  evidence3.jpg # Case #003 courier evidence
  evidence4.jpg # Case #004 penthouse evidence
  evidence5.jpg # Case #005 manifest evidence
  bg.jpg        # Terminal background texture
  music.mp3     # Optional ambient soundtrack
```

## Roadmap

The next natural expansion is an optional Case #006 finale or a server-backed global leaderboard. Cases are data-driven, so each investigation can bring its own image, clue, recovery answer, hints, accusations, and final report without rebuilding the game flow.

## Internal Affairs channel

Analyst **M. Voss** is the player’s recurring contact in the VCPD Internal Affairs channel. Voss appears in the Case Files terminal, sends a short encrypted thought-starter before every investigation, and provides a tailored debrief after each correct solve. These messages reinforce the forensic reasoning behind each case without revealing its answer.

## Note on inspiration

VICE//TRACE is an unofficial fan-made creative project inspired by neon-noir crime fiction and the Vice City setting. It is not affiliated with or endorsed by Rockstar Games or Grand Theft Auto.

---

Built for the **#BuiltWithImageEditor Challenge**.
