# 🏎️ CYBER-TYPER // High-Octane Arcade Typing Racer

A gamified, fast-paced, TypeRacer-inspired typing game built with modern **Vanilla HTML5, CSS3, and JavaScript**. Zero build steps, zero third-party dependencies, and zero setup required — runs directly in any web browser.

---

## ⚡ Quick Start

### Option 1: Direct Browser Launch (Instant)
Simply double-click [`index.html`](file:///c:/Users/dulam/typing/index.html) or open it with your browser of choice (Chrome, Edge, Firefox, Safari).

### Option 2: Local Web Server
If you prefer running a local development server:
```bash
# Using npm:
npm start

# Or using Python:
python -m http.server 3000
```
Then navigate to `http://localhost:3000`.

---

## 🎮 Key Features & Gameplay

1. **🏁 4-Lane Animated Track Arena**:
   - Compete against intelligent bot racers with realistic human typing cadence.
   - Smooth 60fps vehicle translation along asphalt race lanes with start and checkered finish lines.
   - Dynamic real-time position indicators (1st 🥇, 2nd 🥈, 3rd 🥉, 4th) floating above racers as positions change.

2. **⏱️ Speedometer & HUD Dashboard**:
   - High-precision analog-style gauge dial with animated needle tracking real-time WPM.
   - Live Combo Streak, Accuracy percentage, and Track Position counters.
   - Nitrous Overdrive charge gauge that fills up as you maintain error-free typing combos.

3. **🔥 Nitrous Overdrive System**:
   - Typing accurate words charges your Nitrous tank.
   - When charged, press <kbd>Tab</kbd> (or reach 100%) to trigger **Nitro Boost**:
     - Visual twin exhaust flames burst behind your supercar.
     - Deep synthesized whoosh sound effect.
     - Extra career XP reward!

4. **🔊 Standalone Web Audio Synthesizer**:
   - Zero external MP3/audio files to fetch or fail loading offline.
   - Procedurally synthesizes crisp mechanical keyboard clicks ("thock" sounds), race countdown beeps (3... 2... 1... GO!), engine revs, mistake thuds, and Grand Prix victory fanfares using the **Web Audio API**.
   - One-click Sound toggle with persistent preference saving.

5. **👻 Personal Best Ghost Car**:
   - Records checkpoint telemetry of your fastest run.
   - In subsequent races, an ethereal glowing violet Ghost Car races in Lane 4 replaying your personal record in real time!
   - Overtake your own ghost to unlock special trophies.

6. **🚗 Tuning Garage & Customization**:
   - **Chassis Models**: Apex Hyper GT, Cyber Dart 2099, Midnight Phantom, and Thunder Turbo.
   - **Neon Paint Coatings**: Neon Cyan, Cyber Magenta, Toxic Lime, Solar Gold, Synth Violet, Ghost Frost, and Inferno Orange.
   - Live SVG preview with animated ambient lighting.

7. **🏆 Progression, XP & Trophies**:
   - Earn XP for every race, podium finish, high WPM, and 100% accuracy runs.
   - Leveling system with persistent header progress bar.
   - 9 unlockable career achievements with celebratory toast notifications.
   - Real-time WPM telemetry line chart drawn on HTML5 canvas upon finishing.

---

## ⌨️ Controls & Shortcuts

| Key | Action |
| :--- | :--- |
| **Typing** | Auto-focuses and advances car along the circuit |
| <kbd>Space</kbd> | Submits the current word |
| <kbd>Backspace</kbd> | Corrects mistyped characters |
| <kbd>Tab</kbd> | Fires Nitrous Boost when charged |
| <kbd>Enter</kbd> | Quickly restarts race from the Podium screen |
| <kbd>Esc</kbd> | Closes any open modal (Garage, Trophies, Settings) |

---

## 📁 Project Architecture

```
typing/
├── index.html            # Main game layout, HUD, track, modals, and canvas
├── css/
│   ├── style.css         # Synthwave arcade themes, speedometer gauge, HUD, modals
│   └── race.css          # Asphalt track styling, car positioning, nitro exhaust flames
├── js/
│   ├── texts.js          # Curated typing passages across categories and difficulties
│   ├── audio.js          # Pure Web Audio API sound synthesizer
│   ├── cars.js           # Vehicle SVG models and paint color configurations
│   ├── storage.js        # LocalStorage persistence (stats, XP, ghost telemetry, trophies)
│   ├── bots.js           # AI racer simulation with human cadence and ghost runner
│   ├── game.js           # Core race state engine, input handler, and scoring
│   └── ui.js             # DOM controller, speedometer needle, canvas chart, modals
└── package.json          # Optional start script
```

