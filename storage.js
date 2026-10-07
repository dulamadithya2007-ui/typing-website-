/**
 * Persistence layer for player profile, race history, achievements, and personal best ghost telemetry.
 */
class GameStorage {
  constructor() {
    this.STORAGE_KEY = "typeracer_arcade_data";
    this.data = this.load();
  }

  getDefaultData() {
    return {
      profile: {
        name: "Speedster",
        carModel: "gt-hyper",
        carPaint: "cyan",
        level: 1,
        xp: 0
      },
      stats: {
        races: 0,
        wins: 0,
        podiums: 0,
        topWpm: 0,
        avgWpm: 0,
        totalWords: 0,
        totalChars: 0,
        totalErrors: 0,
        accuracySum: 0,
        nitroTriggered: 0
      },
      settings: {
        difficulty: "medium", // 'easy' | 'medium' | 'hard' | 'adaptive'
        soundEnabled: true,
        ghostEnabled: true,
        textCategory: "all"
      },
      ghost: null, // Personal best race telemetry: { wpm, date, textLength, checkpoints: [{ t, p }] }
      achievements: [
        { id: "first_race", name: "Green Flag", desc: "Complete your first race", icon: "🏁", unlocked: false },
        { id: "first_win", name: "P1 Finish", desc: "Take 1st place in a race", icon: "🥇", unlocked: false },
        { id: "speed_60", name: "Fast Lane", desc: "Reach 60+ Words Per Minute", icon: "⚡", unlocked: false },
        { id: "speed_80", name: "Speed Demon", desc: "Reach 80+ Words Per Minute", icon: "🏎️", unlocked: false },
        { id: "speed_100", name: "Warp Velocity", desc: "Blast past 100+ Words Per Minute", icon: "🚀", unlocked: false },
        { id: "perfect_100", name: "Laser Precision", desc: "Finish a race with 100% accuracy", icon: "🎯", unlocked: false },
        { id: "nitro_fiend", name: "Nitrous Overdrive", desc: "Trigger 5 Nitro boosts across races", icon: "🔥", unlocked: false },
        { id: "veteran", name: "Grand Prix Master", desc: "Complete 10 total races", icon: "🏆", unlocked: false },
        { id: "ghost_buster", name: "Ghost Chaser", desc: "Beat your own personal best ghost car", icon: "👻", unlocked: false }
      ]
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.getDefaultData();
      const parsed = JSON.parse(raw);
      // Merge with default in case new fields were added
      const defaults = this.getDefaultData();
      return {
        profile: { ...defaults.profile, ...(parsed.profile || {}) },
        stats: { ...defaults.stats, ...(parsed.stats || {}) },
        settings: { ...defaults.settings, ...(parsed.settings || {}) },
        ghost: parsed.ghost || null,
        achievements: defaults.achievements.map(a => {
          const found = (parsed.achievements || []).find(pa => pa.id === a.id);
          return found ? { ...a, unlocked: found.unlocked, unlockedAt: found.unlockedAt } : a;
        })
      };
    } catch (e) {
      console.warn("Error loading data from localStorage, resetting to defaults", e);
      return this.getDefaultData();
    }
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }

  getProfile() {
    return this.data.profile;
  }

  getStats() {
    return this.data.stats;
  }

  getSettings() {
    return this.data.settings;
  }

  updateProfile(updates) {
    this.data.profile = { ...this.data.profile, ...updates };
    this.save();
  }

  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
  }

  recordRaceResult(result) {
    const stats = this.data.stats;
    stats.races += 1;
    if (result.place === 1) stats.wins += 1;
    if (result.place <= 3) stats.podiums += 1;

    if (result.wpm > stats.topWpm) {
      stats.topWpm = Math.round(result.wpm);
    }

    // Cumulative averages
    stats.totalWords += result.wordsCount || 0;
    stats.totalChars += result.charsCount || 0;
    stats.totalErrors += result.errorsCount || 0;
    stats.accuracySum += result.accuracy;
    stats.avgWpm = Math.round(((stats.avgWpm * (stats.races - 1)) + result.wpm) / stats.races);

    if (result.nitroUsed) {
      stats.nitroTriggered += result.nitroUsed;
    }

    // XP & Level calculations
    // Base: 50 XP, 1st place: +50 XP, 2nd: +30 XP, 3rd: +15 XP, +1 XP per WPM, accuracy multiplier
    let earnedXp = 50 + Math.round(result.wpm);
    if (result.place === 1) earnedXp += 50;
    else if (result.place === 2) earnedXp += 30;
    else if (result.place === 3) earnedXp += 15;
    if (result.accuracy === 100) earnedXp += 35;

    this.data.profile.xp += earnedXp;
    const newLevel = 1 + Math.floor(this.data.profile.xp / 250);
    const leveledUp = newLevel > this.data.profile.level;
    this.data.profile.level = newLevel;

    // Check personal best ghost
    let isNewGhost = false;
    let beatOldGhost = false;
    if (this.data.ghost) {
      if (result.wpm > this.data.ghost.wpm) {
        beatOldGhost = true;
      }
    }
    if (!this.data.ghost || result.wpm > this.data.ghost.wpm) {
      this.data.ghost = {
        wpm: Math.round(result.wpm),
        date: new Date().toLocaleDateString(),
        checkpoints: result.checkpoints || []
      };
      isNewGhost = true;
    }

    // Check newly unlocked achievements
    const newlyUnlocked = this.checkAchievements(result, beatOldGhost);

    this.save();

    return {
      earnedXp,
      leveledUp,
      newLevel,
      isNewGhost,
      newlyUnlocked
    };
  }

  checkAchievements(result, beatOldGhost) {
    const newlyUnlocked = [];
    const stats = this.data.stats;

    this.data.achievements.forEach(ach => {
      if (ach.unlocked) return;
      let shouldUnlock = false;

      switch (ach.id) {
        case "first_race":
          shouldUnlock = stats.races >= 1;
          break;
        case "first_win":
          shouldUnlock = result.place === 1;
          break;
        case "speed_60":
          shouldUnlock = result.wpm >= 60;
          break;
        case "speed_80":
          shouldUnlock = result.wpm >= 80;
          break;
        case "speed_100":
          shouldUnlock = result.wpm >= 100;
          break;
        case "perfect_100":
          shouldUnlock = result.accuracy === 100;
          break;
        case "nitro_fiend":
          shouldUnlock = stats.nitroTriggered >= 5;
          break;
        case "veteran":
          shouldUnlock = stats.races >= 10;
          break;
        case "ghost_buster":
          shouldUnlock = beatOldGhost;
          break;
      }

      if (shouldUnlock) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(ach);
      }
    });

    return newlyUnlocked;
  }

  getGhost() {
    return this.data.ghost;
  }
}

const storage = new GameStorage();

