/**
 * AI Bot Racers and Ghost Runner simulation engine.
 * Simulates human-like cadence with micro-variances, burst bursts, and natural pacing.
 */
class BotManager {
  constructor() {
    this.botTemplates = [
      {
        id: "bot_1",
        name: "Neon Nova",
        model: "cyber-dart",
        paint: "magenta",
        avatar: "⚡",
        baseSpeedMult: 0.95
      },
      {
        id: "bot_2",
        name: "Pixel Drift",
        model: "gt-hyper",
        paint: "gold",
        avatar: "🏁",
        baseSpeedMult: 1.05
      },
      {
        id: "bot_3",
        name: "Apex Falcon",
        model: "phantom-stealth",
        paint: "lime",
        avatar: "🦅",
        baseSpeedMult: 0.88
      },
      {
        id: "bot_4",
        name: "Quantum Viper",
        model: "retro-rod",
        paint: "orange",
        avatar: "🚀",
        baseSpeedMult: 1.15
      }
    ];

    this.activeRacers = [];
  }

  /**
   * Initializes racers for a race based on target total text length and selected difficulty.
   */
  setupRacers(totalChars, difficulty = "medium", playerAvgWpm = 60, ghostData = null) {
    this.activeRacers = [];

    // Base WPM target range by difficulty
    let minWpm = 35;
    let maxWpm = 50;

    if (difficulty === "easy") {
      minWpm = 28;
      maxWpm = 45;
    } else if (difficulty === "medium") {
      minWpm = 48;
      maxWpm = 68;
    } else if (difficulty === "hard") {
      minWpm = 75;
      maxWpm = 98;
    } else if (difficulty === "adaptive") {
      // Scale close to player's average
      const center = Math.max(35, playerAvgWpm);
      minWpm = Math.max(25, center - 12);
      maxWpm = center + 15;
    }

    // Lane 1: Bot 1
    const t1 = this.botTemplates[0];
    const wpm1 = minWpm + Math.random() * (maxWpm - minWpm) * 0.7;
    this.activeRacers.push(this.createBotInstance(1, t1, wpm1, totalChars));

    // Lane 2: Bot 2
    const t2 = this.botTemplates[1];
    const wpm2 = minWpm + (maxWpm - minWpm) * 0.5 + Math.random() * (maxWpm - minWpm) * 0.5;
    this.activeRacers.push(this.createBotInstance(2, t2, wpm2, totalChars));

    // Lane 4: Check if Ghost exists and enabled
    if (ghostData && ghostData.checkpoints && ghostData.checkpoints.length > 0) {
      this.activeRacers.push({
        lane: 4,
        isGhost: true,
        name: `Ghost (${ghostData.wpm} WPM)`,
        avatar: "👻",
        model: "phantom-stealth",
        paint: { id: "purple", primary: "#c084fc", secondary: "#7e22ce", glow: "rgba(192, 132, 252, 0.7)" },
        targetWpm: ghostData.wpm,
        progress: 0,
        finished: false,
        finishTime: null,
        ghostData: ghostData
      });
    } else {
      // Standard 3rd Bot
      const t3 = this.botTemplates[2];
      const wpm3 = minWpm + Math.random() * (maxWpm - minWpm);
      this.activeRacers.push(this.createBotInstance(4, t3, wpm3, totalChars));
    }

    return this.activeRacers;
  }

  createBotInstance(lane, template, targetWpm, totalChars) {
    const paintObj = CAR_PAINTS.find(p => p.id === template.paint) || CAR_PAINTS[0];
    return {
      lane: lane,
      isGhost: false,
      name: template.name,
      avatar: template.avatar,
      model: template.model,
      paint: paintObj,
      targetWpm: Math.round(targetWpm),
      charsPerSecond: (targetWpm * 5) / 60, // Standard 5 chars = 1 word
      totalChars: totalChars,
      charsTyped: 0,
      progress: 0, // 0 to 100
      finished: false,
      finishTime: null,
      varianceSeed: Math.random() * 10,
      nextMistakeAt: 15 + Math.random() * 25
    };
  }

  /**
   * Updates bot positions based on elapsed race time in seconds.
   */
  update(elapsedSeconds) {
    this.activeRacers.forEach(racer => {
      if (racer.finished) return;

      if (racer.isGhost) {
        // Ghost racer: interpolate from saved checkpoints
        const checkpoints = racer.ghostData.checkpoints;
        if (!checkpoints || checkpoints.length === 0) return;

        // Find current segment in checkpoints
        if (elapsedSeconds <= checkpoints[0].t) {
          racer.progress = (elapsedSeconds / checkpoints[0].t) * checkpoints[0].p;
        } else if (elapsedSeconds >= checkpoints[checkpoints.length - 1].t) {
          racer.progress = 100;
          racer.finished = true;
          racer.finishTime = checkpoints[checkpoints.length - 1].t;
        } else {
          for (let i = 0; i < checkpoints.length - 1; i++) {
            const c1 = checkpoints[i];
            const c2 = checkpoints[i + 1];
            if (elapsedSeconds >= c1.t && elapsedSeconds <= c2.t) {
              const ratio = (elapsedSeconds - c1.t) / (c2.t - c1.t);
              racer.progress = c1.p + ratio * (c2.p - c1.p);
              break;
            }
          }
        }
        return;
      }

      // Simulated Bot typing with human-like wave variance (sinusoidal pacing)
      const wave = Math.sin(elapsedSeconds * 1.5 + racer.varianceSeed) * 0.18;
      const effectiveCps = racer.charsPerSecond * (1 + wave);

      // Increment progress
      const charsNow = effectiveCps * elapsedSeconds;
      racer.charsTyped = Math.min(charsNow, racer.totalChars);
      racer.progress = Math.min(100, (racer.charsTyped / racer.totalChars) * 100);

      if (racer.progress >= 100) {
        racer.progress = 100;
        racer.finished = true;
        racer.finishTime = elapsedSeconds;
      }
    });
  }
}

const botManager = new BotManager();

