/**
 * Core TypeRacer Game Engine:
 * State management, typing input processing, streak/nitro dynamics, telemetry, and 60fps race loop.
 */
class TypeRacerGame {
  constructor() {
    this.state = "IDLE"; // 'IDLE' | 'COUNTDOWN' | 'RACING' | 'FINISHED'
    this.currentTextData = null;
    this.words = [];
    this.currentWordIndex = 0;
    this.currentInput = "";

    // Stats for current race
    this.startTime = null;
    this.endTime = null;
    this.elapsedSeconds = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;
    this.wordErrors = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.nitroPercent = 0;
    this.isNitroActive = false;
    this.nitroTimer = null;
    this.nitroCountThisRace = 0;

    // Telemetry log for charts & ghost runner
    this.telemetry = [];
    this.telemetryInterval = null;

    // Ranking & Finish
    this.playerProgress = 0;
    this.playerFinished = false;
    this.playerFinishTime = null;
    this.playerRank = 1;
    this.allFinishers = [];

    // Animation loop
    this.rafId = null;
    this.countdownTimer = null;
    this.countdownValue = 3;

    // Callbacks for UI updates
    this.onStateChange = null;
    this.onProgressUpdate = null;
    this.onCountdownTick = null;
    this.onRaceFinished = null;
  }

  /**
   * Prepares a new race with the given text difficulty.
   */
  prepareRace(difficulty = "all") {
    this.reset();
    const settings = storage.getSettings();
    this.currentTextData = getRandomText(difficulty !== "all" ? difficulty : settings.difficulty);
    this.words = this.currentTextData.text.split(" ");
    this.currentWordIndex = 0;
    this.currentInput = "";

    // Prepare bots
    const profile = storage.getProfile();
    const ghost = settings.ghostEnabled ? storage.getGhost() : null;
    botManager.setupRacers(this.currentTextData.text.length, settings.difficulty, storage.getStats().avgWpm, ghost);

    this.state = "IDLE";
    if (this.onStateChange) this.onStateChange(this.state);
  }

  reset() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);
    if (this.nitroTimer) clearTimeout(this.nitroTimer);

    this.state = "IDLE";
    this.currentWordIndex = 0;
    this.currentInput = "";
    this.startTime = null;
    this.endTime = null;
    this.elapsedSeconds = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;
    this.wordErrors = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.nitroPercent = 0;
    this.isNitroActive = false;
    this.nitroCountThisRace = 0;
    this.playerProgress = 0;
    this.playerFinished = false;
    this.playerFinishTime = null;
    this.playerRank = 1;
    this.allFinishers = [];
    this.telemetry = [];
  }

  /**
   * Starts the 3-2-1-GO countdown sequence.
   */
  startCountdown() {
    if (this.state !== "IDLE") return;
    this.state = "COUNTDOWN";
    this.countdownValue = 3;
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.onCountdownTick) this.onCountdownTick(this.countdownValue);

    sounds.playCountdown(this.countdownValue);

    this.countdownTimer = setInterval(() => {
      this.countdownValue -= 1;
      if (this.onCountdownTick) this.onCountdownTick(this.countdownValue);

      if (this.countdownValue > 0) {
        sounds.playCountdown(this.countdownValue);
      } else if (this.countdownValue === 0) {
        sounds.playCountdown(0); // GO!
        clearInterval(this.countdownTimer);
        setTimeout(() => {
          this.beginRace();
        }, 400);
      }
    }, 1000);
  }

  /**
   * Initiates the live race.
   */
  beginRace() {
    this.state = "RACING";
    this.startTime = performance.now();
    if (this.onStateChange) this.onStateChange(this.state);

    sounds.playEngineRev();

    // Telemetry recorder: every 250ms
    this.telemetryInterval = setInterval(() => {
      if (this.state !== "RACING" && !this.playerFinished) return;
      const t = this.getElapsedSeconds();
      const wpm = this.getCurrentWpm();
      this.telemetry.push({
        t: Math.round(t * 10) / 10,
        p: Math.round(this.playerProgress * 10) / 10,
        wpm: Math.round(wpm)
      });
    }, 250);

    // Start 60fps render loop
    this.lastLoopTime = performance.now();
    this.gameLoop();
  }

  gameLoop() {
    if (this.state !== "RACING" && this.state !== "FINISHED") return;

    const now = performance.now();
    this.elapsedSeconds = (now - this.startTime) / 1000;

    // Update Bot AI
    botManager.update(this.elapsedSeconds);

    // Compute live positions & rankings
    this.updateRankings();

    // Trigger UI frame callback
    if (this.onProgressUpdate) {
      this.onProgressUpdate({
        elapsed: this.elapsedSeconds,
        playerProgress: this.playerProgress,
        wpm: this.getCurrentWpm(),
        rawWpm: this.getRawWpm(),
        accuracy: this.getAccuracy(),
        streak: this.streak,
        nitroPercent: this.nitroPercent,
        isNitroActive: this.isNitroActive,
        rank: this.playerRank,
        racers: botManager.activeRacers
      });
    }

    // Check if everyone has finished
    const allBotsFinished = botManager.activeRacers.every(r => r.finished);
    if (this.playerFinished && allBotsFinished && this.state !== "FINISHED") {
      this.concludeRace();
      return;
    }

    this.rafId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Real-time placement calculation.
   */
  updateRankings() {
    const list = [
      { id: "player", progress: this.playerProgress, finished: this.playerFinished, time: this.playerFinishTime },
      ...botManager.activeRacers.map(r => ({
        id: r.name,
        progress: r.progress,
        finished: r.finished,
        time: r.finishTime
      }))
    ];

    // Sort by progress descending, or if finished, by finishTime ascending
    list.sort((a, b) => {
      if (a.finished && b.finished) return (a.time || 999) - (b.time || 999);
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;
      return b.progress - a.progress;
    });

    const playerIndex = list.findIndex(item => item.id === "player");
    this.playerRank = playerIndex + 1;
  }

  /**
   * Processes user keyboard input inside the typing box.
   */
  handleInput(typedValue) {
    if (this.state === "IDLE") {
      // Auto-start countdown on first keypress if still idle
      this.startCountdown();
      return;
    }
    if (this.state === "COUNTDOWN") {
      // Prevent input during countdown
      return;
    }
    if (this.state !== "RACING" || this.playerFinished) return;

    const targetWord = this.words[this.currentWordIndex];
    if (!targetWord) return;

    const isLastWord = this.currentWordIndex === this.words.length - 1;
    const prevLen = this.currentInput.length;
    const newLen = typedValue.length;

    // Handle backspace deletion
    if (newLen < prevLen) {
      this.currentInput = typedValue;
      sounds.playKeyClick(false);
      this.updatePlayerProgress();
      const isPrefixCorrect = targetWord.startsWith(typedValue);
      return { success: isPrefixCorrect, advanceWord: false, error: !isPrefixCorrect };
    }

    // Handle space key submission of a word
    if (typedValue.endsWith(" ") && !isLastWord) {
      const cleanTyped = typedValue.trim();
      if (cleanTyped === targetWord) {
        // Complete word successfully!
        this.correctChars += targetWord.length + 1; // +1 for space
        this.totalTypedChars += 1;
        this.currentWordIndex += 1;
        this.currentInput = "";
        this.streak += 1;
        if (this.streak > this.maxStreak) this.maxStreak = this.streak;

        // Build Nitro charge: +15% per clean word
        this.chargeNitro(15);
        sounds.playKeyClick(true);
        this.updatePlayerProgress();
        return { success: true, advanceWord: true, error: false };
      } else {
        // Submitted word has mistake!
        this.errorCount += 1;
        this.wordErrors += 1;
        this.streak = 0;
        sounds.playError();
        return { success: false, advanceWord: false, error: true };
      }
    }

    // Check last word completion without requiring trailing space
    if (isLastWord && typedValue === targetWord) {
      this.correctChars += 1;
      this.totalTypedChars += 1;
      this.currentWordIndex += 1;
      this.currentInput = typedValue;
      this.streak += 1;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      sounds.playKeyClick(false);
      this.playerProgress = 100;
      this.finishPlayerRun();
      return { success: true, advanceWord: true, error: false };
    }

    // Normal typing within current word
    this.currentInput = typedValue;
    const isPrefixCorrect = targetWord.startsWith(typedValue);

    if (isPrefixCorrect) {
      sounds.playKeyClick(false);
      this.totalTypedChars += (newLen - prevLen);
    } else {
      sounds.playError();
      this.errorCount += 1;
      this.wordErrors += 1;
      this.streak = 0;
    }

    this.updatePlayerProgress();
    return {
      success: isPrefixCorrect,
      advanceWord: false,
      error: !isPrefixCorrect
    };
  }

  updatePlayerProgress() {
    const totalChars = this.currentTextData.text.length;
    // Calculate characters typed so far
    let charsTypedCount = 0;
    for (let i = 0; i < this.currentWordIndex; i++) {
      charsTypedCount += this.words[i].length + 1; // word + space
    }
    // Add current word matching prefix
    const target = this.words[this.currentWordIndex] || "";
    let matched = 0;
    for (let j = 0; j < this.currentInput.length; j++) {
      if (this.currentInput[j] === target[j]) matched++;
      else break;
    }
    charsTypedCount += matched;

    this.playerProgress = Math.min(100, (charsTypedCount / totalChars) * 100);

    if (this.playerProgress >= 100 && !this.playerFinished) {
      this.finishPlayerRun();
    }
  }

  finishPlayerRun() {
    this.playerFinished = true;
    this.playerFinishTime = this.getElapsedSeconds();
    this.playerProgress = 100;

    // Check if player finished 1st
    if (this.playerRank === 1) {
      sounds.playVictory();
    }

    // Brief 600ms celebration delay so the car visually crosses checkered flag, then open podium!
    setTimeout(() => {
      if (this.state !== "FINISHED") {
        this.concludeRace();
      }
    }, 650);
  }

  chargeNitro(amount) {
    this.nitroPercent = Math.min(100, this.nitroPercent + amount);
    if (this.nitroPercent >= 100 && !this.isNitroActive) {
      this.activateNitro();
    }
  }

  activateNitro() {
    this.isNitroActive = true;
    this.nitroPercent = 100;
    this.nitroCountThisRace += 1;
    sounds.playNitro();

    // Nitro surge lasts 3.5 seconds
    if (this.nitroTimer) clearTimeout(this.nitroTimer);
    this.nitroTimer = setTimeout(() => {
      this.isNitroActive = false;
      this.nitroPercent = 0;
    }, 3500);
  }

  concludeRace() {
    this.state = "FINISHED";
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.telemetryInterval) clearInterval(this.telemetryInterval);

    const finalWpm = this.getCurrentWpm();
    const finalRawWpm = this.getRawWpm();
    const finalAccuracy = this.getAccuracy();
    const totalTime = this.playerFinishTime || this.getElapsedSeconds();

    // Compile podium and rankings
    const allRacers = [
      {
        id: "player",
        name: storage.getProfile().name || "Player",
        isPlayer: true,
        finishTime: totalTime,
        wpm: Math.round(finalWpm),
        avatar: "🏎️",
        place: this.playerRank
      },
      ...botManager.activeRacers.map(b => {
        let estTime = b.finishTime;
        if (!estTime) {
          const progRatio = Math.max(0.1, b.progress / 100);
          estTime = Math.max(totalTime + 0.5, totalTime / progRatio);
        }
        return {
          id: b.name,
          name: b.name,
          isPlayer: false,
          finishTime: estTime,
          wpm: b.targetWpm,
          avatar: b.avatar,
          place: 1
        };
      })
    ];

    allRacers.sort((a, b) => a.finishTime - b.finishTime);
    allRacers.forEach((r, idx) => (r.place = idx + 1));
    const playerRecord = allRacers.find(r => r.isPlayer);
    const finalRank = playerRecord ? playerRecord.place : 4;

    // Save to storage & check achievements
    const saveSummary = storage.recordRaceResult({
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      place: finalRank,
      wordsCount: this.words.length,
      charsCount: this.currentTextData.text.length,
      errorsCount: this.errorCount,
      nitroUsed: this.nitroCountThisRace,
      checkpoints: this.telemetry
    });

    if (this.onRaceFinished) {
      this.onRaceFinished({
        wpm: Math.round(finalWpm),
        rawWpm: Math.round(finalRawWpm),
        accuracy: Math.round(finalAccuracy),
        time: totalTime.toFixed(1),
        place: finalRank,
        streak: this.maxStreak,
        errors: this.errorCount,
        racers: allRacers,
        progression: saveSummary,
        telemetry: this.telemetry,
        textData: this.currentTextData
      });
    }
  }

  getElapsedSeconds() {
    if (!this.startTime) return 0;
    return (performance.now() - this.startTime) / 1000;
  }

  getCurrentWpm() {
    const elapsedMinutes = this.getElapsedSeconds() / 60;
    if (elapsedMinutes <= 0.01) return 0;
    const netWords = Math.max(0, (this.correctChars / 5));
    return Math.round(netWords / elapsedMinutes);
  }

  getRawWpm() {
    const elapsedMinutes = this.getElapsedSeconds() / 60;
    if (elapsedMinutes <= 0.01) return 0;
    const grossWords = this.totalTypedChars / 5;
    return Math.round(grossWords / elapsedMinutes);
  }

  getAccuracy() {
    const total = this.correctChars + this.errorCount;
    if (total === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((this.correctChars / total) * 100)));
  }
}

const game = new TypeRacerGame();
