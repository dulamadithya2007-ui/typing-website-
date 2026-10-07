/**
 * UI Controller:
 * DOM updates, race track rendering, speedometer gauge, modal management,
 * canvas WPM speed telemetry graph, confetti celebration, and keyboard listeners.
 */
class UIController {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.renderTrackRacers();
    this.updateHUDProfile();
  }

  initElements() {
    // Typing display & input
    this.wordsContainer = document.getElementById("wordsContainer");
    this.typingInput = document.getElementById("typingInput");
    this.quoteAuthor = document.getElementById("quoteAuthor");
    this.quoteCategory = document.getElementById("quoteCategory");

    // Race Track lanes
    this.trackLanes = [
      document.getElementById("lane1"),
      document.getElementById("lane2"),
      document.getElementById("lane3"),
      document.getElementById("lane4")
    ];

    // Speedometer & HUD
    this.gaugeNeedle = document.getElementById("gaugeNeedle");
    this.gaugeWpmDisplay = document.getElementById("gaugeWpm");
    this.statAccuracy = document.getElementById("hudAccuracy");
    this.statStreak = document.getElementById("hudStreak");
    this.statRank = document.getElementById("hudRank");
    this.nitroBar = document.getElementById("nitroBar");
    this.nitroPill = document.getElementById("nitroPill");
    this.headerLevel = document.getElementById("playerLevelBadge");
    this.headerXpBar = document.getElementById("playerXpFill");

    // Countdown Overlay
    this.countdownOverlay = document.getElementById("countdownOverlay");
    this.countdownNumber = document.getElementById("countdownNumber");

    // Modals
    this.modalPodium = document.getElementById("modalPodium");
    this.modalGarage = document.getElementById("modalGarage");
    this.modalStats = document.getElementById("modalStats");
    this.modalSettings = document.getElementById("modalSettings");

    // Podium Elements
    this.podiumWpm = document.getElementById("podiumWpm");
    this.podiumAccuracy = document.getElementById("podiumAccuracy");
    this.podiumTime = document.getElementById("podiumTime");
    this.podiumRank = document.getElementById("podiumRank");
    this.podiumXp = document.getElementById("podiumXp");
    this.chartCanvas = document.getElementById("speedChartCanvas");

    // Garage Elements
    this.garageCarList = document.getElementById("garageCarList");
    this.garagePaintList = document.getElementById("garagePaintList");
    this.garagePreview = document.getElementById("garagePreview");

    // Sound toggle button
    this.btnSoundToggle = document.getElementById("btnSoundToggle");
  }

  bindEvents() {
    // Typing input handling
    this.typingInput.addEventListener("input", (e) => {
      const val = this.typingInput.value;
      const res = game.handleInput(val);
      if (res && res.advanceWord) {
        this.typingInput.value = "";
      }
      this.renderWords();
    });

    // Auto-focus input on track/body click
    document.addEventListener("click", (e) => {
      if (!e.target.closest("button") && !e.target.closest(".modal-content") && !e.target.closest("select") && !e.target.closest("input")) {
        this.typingInput.focus();
      }
    });

    // Global keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Tab key activates nitro
      if (e.key === "Tab" && game.state === "RACING") {
        e.preventDefault();
        if (game.nitroPercent >= 50) {
          game.activateNitro();
        }
      }
      // Enter on podium to restart race
      if (e.key === "Enter" && game.state === "FINISHED" && !this.modalPodium.classList.contains("hidden")) {
        this.closeAllModals();
        this.startNewRace();
      }
      // Escape closes open modals
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });

    // Control buttons
    document.getElementById("btnStartRace").addEventListener("click", () => {
      game.startCountdown();
      this.typingInput.focus();
    });

    document.getElementById("btnRestartRace").addEventListener("click", () => {
      this.startNewRace();
    });

    document.getElementById("btnOpenGarage").addEventListener("click", () => {
      this.openGarage();
    });

    document.getElementById("btnOpenStats").addEventListener("click", () => {
      this.openStats();
    });

    document.getElementById("btnOpenSettings").addEventListener("click", () => {
      this.openSettings();
    });

    this.btnSoundToggle.addEventListener("click", () => {
      const isEnabled = sounds.toggleSound();
      this.updateSoundButton(isEnabled);
    });

    // Podium buttons
    document.getElementById("btnPodiumAgain").addEventListener("click", () => {
      this.closeAllModals();
      this.startNewRace();
    });

    document.getElementById("btnPodiumGarage").addEventListener("click", () => {
      this.closeAllModals();
      this.openGarage();
    });

    // Close buttons on all modals
    document.querySelectorAll(".btn-close-modal").forEach(btn => {
      btn.addEventListener("click", () => this.closeAllModals());
    });

    // Connect game engine callbacks
    game.onStateChange = (state) => this.handleGameStateChange(state);
    game.onProgressUpdate = (data) => this.handleProgressUpdate(data);
    game.onCountdownTick = (count) => this.handleCountdownTick(count);
    game.onRaceFinished = (results) => this.handleRaceFinished(results);
  }

  handleGameStateChange(state) {
    if (state === "IDLE") {
      this.countdownOverlay.classList.add("hidden");
      this.renderWords();
      this.updateHUDProfile();
      this.renderTrackRacers();
      this.gaugeNeedle.style.transform = "rotate(-90deg)";
      this.gaugeWpmDisplay.textContent = "0";
      this.statAccuracy.textContent = "100%";
      this.statStreak.textContent = "0";
      this.statRank.textContent = "1st 🥇";
      this.nitroBar.style.width = "0%";
      this.nitroPill.classList.remove("nitro-active-glow");
      this.typingInput.value = "";
      this.typingInput.disabled = false;
      this.typingInput.focus();
    } else if (state === "COUNTDOWN") {
      this.countdownOverlay.classList.remove("hidden");
      this.typingInput.disabled = true;
    } else if (state === "RACING") {
      this.countdownOverlay.classList.add("hidden");
      this.typingInput.disabled = false;
      this.typingInput.focus();
    } else if (state === "FINISHED") {
      this.typingInput.disabled = true;
    }
  }

  handleCountdownTick(count) {
    if (count > 0) {
      this.countdownNumber.textContent = count;
      this.countdownNumber.className = "countdown-number pulse-anim";
    } else {
      this.countdownNumber.textContent = "GO!";
      this.countdownNumber.className = "countdown-number go-anim";
    }
  }

  handleProgressUpdate(data) {
    // 1. Update Speedometer needle (0 to 180 deg for 0 to 150 WPM)
    const angle = Math.min(180, (data.wpm / 140) * 180);
    this.gaugeNeedle.style.transform = `rotate(${angle - 90}deg)`;
    this.gaugeWpmDisplay.textContent = Math.round(data.wpm);

    // 2. Update HUD metrics
    this.statAccuracy.textContent = `${data.accuracy}%`;
    this.statStreak.textContent = data.streak;
    this.statRank.textContent = this.getRankOrdinal(data.rank);

    // 3. Update Nitro meter
    this.nitroBar.style.width = `${data.nitroPercent}%`;
    if (data.isNitroActive) {
      this.nitroPill.classList.add("nitro-active-glow");
    } else {
      this.nitroPill.classList.remove("nitro-active-glow");
    }

    // 4. Update track positions
    // Player is Lane 3
    this.updateCarPosition(3, data.playerProgress, data.isNitroActive, data.rank);

    // Bots
    data.racers.forEach(r => {
      this.updateCarPosition(r.lane, r.progress, false, null);
    });
  }

  updateCarPosition(laneNum, progressPercent, isNitro, rank) {
    const laneEl = this.trackLanes[laneNum - 1];
    if (!laneEl) return;
    const carEl = laneEl.querySelector(".track-car");
    if (!carEl) return;

    // Constrain position: 0% to 88% width of lane so car stays on track
    const pos = (progressPercent / 100) * 88;
    carEl.style.transform = `translateX(${pos}%)`;

    // Nitro exhaust flame toggle
    const flameEl = carEl.querySelector(".nitro-flame");
    if (flameEl) {
      if (isNitro) flameEl.classList.remove("hidden");
      else flameEl.classList.add("hidden");
    }

    // Rank tag above car
    const rankEl = carEl.querySelector(".car-rank-badge");
    if (rankEl && rank) {
      rankEl.textContent = this.getRankOrdinal(rank);
    }
  }

  renderTrackRacers() {
    const profile = storage.getProfile();
    const settings = storage.getSettings();
    const ghost = storage.getGhost();
    const paintObj = CAR_PAINTS.find(p => p.id === profile.carPaint) || CAR_PAINTS[0];

    // Setup Lane 3: Player
    this.renderLaneCar(3, {
      name: profile.name,
      avatar: "🏎️",
      svg: generateCarSvg(profile.carModel, paintObj),
      isPlayer: true
    });

    // Setup Bots (Lanes 1, 2, 4)
    botManager.activeRacers.forEach(r => {
      const racerSvg = generateCarSvg(r.model, r.paint, { isGhost: r.isGhost });
      this.renderLaneCar(r.lane, {
        name: r.name,
        avatar: r.avatar,
        svg: racerSvg,
        isPlayer: false,
        isGhost: r.isGhost
      });
    });
  }

  renderLaneCar(laneNum, config) {
    const laneEl = this.trackLanes[laneNum - 1];
    if (!laneEl) return;

    laneEl.innerHTML = `
      <div class="lane-racer-info">
        <span class="racer-avatar">${config.avatar}</span>
        <span class="racer-name ${config.isPlayer ? "racer-player-name" : ""}">${config.name}</span>
      </div>
      <div class="track-car ${config.isPlayer ? "player-car-wrap" : ""}">
        <span class="car-rank-badge">--</span>
        <div class="car-body-box">
          <div class="nitro-flame hidden"></div>
          ${config.svg}
        </div>
      </div>
    `;
  }

  renderWords() {
    if (!game.currentTextData) return;
    const words = game.words;
    const currentIdx = game.currentWordIndex;
    const inputVal = this.typingInput.value;

    let html = "";
    words.forEach((w, idx) => {
      if (idx < currentIdx) {
        html += `<span class="word word-completed">${this.escapeHtml(w)}</span> `;
      } else if (idx === currentIdx) {
        // Active word with character-level accuracy highlighting
        html += `<span class="word word-active">`;
        for (let i = 0; i < w.length; i++) {
          const char = w[i];
          if (i < inputVal.length) {
            if (inputVal[i] === char) {
              html += `<span class="char char-correct">${this.escapeHtml(char)}</span>`;
            } else {
              html += `<span class="char char-incorrect">${this.escapeHtml(char)}</span>`;
            }
          } else if (i === inputVal.length) {
            html += `<span class="char char-caret">${this.escapeHtml(char)}</span>`;
          } else {
            html += `<span class="char char-pending">${this.escapeHtml(char)}</span>`;
          }
        }
        // Extra incorrect chars typed beyond word length
        if (inputVal.length > w.length) {
          const extra = inputVal.slice(w.length);
          html += `<span class="char char-extra">${this.escapeHtml(extra)}</span>`;
        }
        html += `</span> `;
      } else {
        html += `<span class="word word-upcoming">${this.escapeHtml(w)}</span> `;
      }
    });

    this.wordsContainer.innerHTML = html;
    this.quoteAuthor.textContent = `— ${game.currentTextData.source}`;
    this.quoteCategory.textContent = `${game.currentTextData.category.toUpperCase()} • ${game.currentTextData.difficulty.toUpperCase()}`;

    // Keep active word comfortably in view for multi-line passages
    const activeEl = this.wordsContainer.querySelector(".word-active");
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }

  handleRaceFinished(data) {
    this.modalPodium.classList.remove("hidden");
    this.podiumWpm.textContent = data.wpm;
    this.podiumAccuracy.textContent = `${data.accuracy}%`;
    this.podiumTime.textContent = `${data.time}s`;
    this.podiumRank.textContent = this.getRankOrdinal(data.place);
    this.podiumXp.textContent = `+${data.progression.earnedXp} XP`;

    // Render Podium stand list
    const standContainer = document.getElementById("podiumRacersList");
    standContainer.innerHTML = "";
    data.racers.forEach(r => {
      const row = document.createElement("div");
      row.className = `podium-racer-row ${r.isPlayer ? "is-player-row" : ""}`;
      row.innerHTML = `
        <div class="podium-racer-left">
          <span class="podium-place-tag">#${r.place}</span>
          <span class="podium-avatar">${r.avatar}</span>
          <span class="podium-name">${r.name}</span>
        </div>
        <div class="podium-racer-right">
          <span class="podium-wpm">${r.wpm} WPM</span>
          <span class="podium-time-text">${r.finishTime.toFixed(1)}s</span>
        </div>
      `;
      standContainer.appendChild(row);
    });

    // Check level up celebration
    if (data.progression.leveledUp) {
      this.showToast(`🎉 LEVEL UP! You reached Level ${data.progression.newLevel}!`);
    }

    // Check achievements
    if (data.progression.newlyUnlocked && data.progression.newlyUnlocked.length > 0) {
      data.progression.newlyUnlocked.forEach(ach => {
        this.showToast(`🏆 Achievement Unlocked: ${ach.name}!`);
      });
    }

    if (data.place === 1) {
      this.triggerConfetti();
    }

    // Draw WPM telemetry graph
    this.drawSpeedChart(data.telemetry);
    this.updateHUDProfile();
  }

  drawSpeedChart(telemetry) {
    if (!this.chartCanvas || !telemetry || telemetry.length < 2) return;
    const ctx = this.chartCanvas.getContext("2d");
    const width = this.chartCanvas.width = this.chartCanvas.parentElement.clientWidth || 500;
    const height = this.chartCanvas.height = 140;

    ctx.clearRect(0, 0, width, height);

    // Padding
    const padX = 35;
    const padY = 20;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const maxWpm = Math.max(100, ...telemetry.map(d => d.wpm)) + 15;
    const maxTime = telemetry[telemetry.length - 1].t || 1;

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let w = 20; w <= maxWpm; w += 30) {
      const y = height - padY - (w / maxWpm) * chartH;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.fillText(`${w}`, 10, y + 3);
    }

    // Draw Speed line
    ctx.beginPath();
    telemetry.forEach((pt, idx) => {
      const x = padX + (pt.t / maxTime) * chartW;
      const y = height - padY - (pt.wpm / maxWpm) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, padY, 0, height - padY);
    gradient.addColorStop(0, "rgba(0, 240, 255, 0.35)");
    gradient.addColorStop(1, "rgba(0, 240, 255, 0.0)");

    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.lineTo(padX + chartW, height - padY);
    ctx.lineTo(padX, height - padY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  triggerConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#00f0ff", "#ff007f", "#39ff14", "#ffb703", "#a855f7", "#ffffff"];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 8,
        life: 1
      });
    }

    let start = performance.now();
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.spin;
        p.life -= 0.012;

        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(animate);
  }

  openGarage() {
    this.closeAllModals();
    this.modalGarage.classList.remove("hidden");
    const profile = storage.getProfile();

    // Render chassis cards
    this.garageCarList.innerHTML = "";
    CAR_MODELS.forEach(model => {
      const isSelected = model.id === profile.carModel;
      const card = document.createElement("div");
      card.className = `garage-item-card ${isSelected ? "selected" : ""}`;
      card.innerHTML = `
        <div class="card-name">${model.name}</div>
        <div class="card-desc">${model.tagline}</div>
        <span class="card-bonus">${model.baseSpeedBonus}</span>
      `;
      card.addEventListener("click", () => {
        storage.updateProfile({ carModel: model.id });
        sounds.playEngineRev();
        this.openGarage();
      });
      this.garageCarList.appendChild(card);
    });

    // Render Paint swatch buttons
    this.garagePaintList.innerHTML = "";
    CAR_PAINTS.forEach(paint => {
      const isSelected = paint.id === profile.carPaint;
      const swatch = document.createElement("div");
      swatch.className = `paint-swatch ${isSelected ? "selected" : ""}`;
      swatch.style.backgroundColor = paint.primary;
      swatch.title = paint.name;
      swatch.addEventListener("click", () => {
        storage.updateProfile({ carPaint: paint.id });
        sounds.playKeyClick(true);
        this.openGarage();
      });
      this.garagePaintList.appendChild(swatch);
    });

    // Live preview SVG in garage
    const currentPaint = CAR_PAINTS.find(p => p.id === profile.carPaint) || CAR_PAINTS[0];
    this.garagePreview.innerHTML = generateCarSvg(profile.carModel, currentPaint);
    this.renderTrackRacers();
  }

  openStats() {
    this.closeAllModals();
    this.modalStats.classList.remove("hidden");
    const stats = storage.getStats();
    const profile = storage.getProfile();

    document.getElementById("statTotalRaces").textContent = stats.races;
    document.getElementById("statTotalWins").textContent = stats.wins;
    document.getElementById("statTopWpm").textContent = `${stats.topWpm} WPM`;
    document.getElementById("statAvgWpm").textContent = `${stats.avgWpm} WPM`;
    document.getElementById("statTotalWords").textContent = stats.totalWords;
    document.getElementById("statTotalNitro").textContent = stats.nitroTriggered;

    // Badges grid
    const badgeGrid = document.getElementById("achievementsGrid");
    badgeGrid.innerHTML = "";
    storage.data.achievements.forEach(ach => {
      const card = document.createElement("div");
      card.className = `ach-card ${ach.unlocked ? "unlocked" : "locked"}`;
      card.innerHTML = `
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-details">
          <div class="ach-title">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
        </div>
      `;
      badgeGrid.appendChild(card);
    });
  }

  openSettings() {
    this.closeAllModals();
    this.modalSettings.classList.remove("hidden");
    const settings = storage.getSettings();

    const diffSelect = document.getElementById("settingDifficulty");
    diffSelect.value = settings.difficulty;
    diffSelect.onchange = () => {
      storage.updateSettings({ difficulty: diffSelect.value });
      game.prepareRace(diffSelect.value);
    };

    const ghostCheck = document.getElementById("settingGhostCheck");
    ghostCheck.checked = settings.ghostEnabled;
    ghostCheck.onchange = () => {
      storage.updateSettings({ ghostEnabled: ghostCheck.checked });
      this.renderTrackRacers();
    };
  }

  updateHUDProfile() {
    const profile = storage.getProfile();
    this.headerLevel.textContent = `LVL ${profile.level}`;
    const xpTowardsNext = profile.xp % 250;
    const pct = (xpTowardsNext / 250) * 100;
    this.headerXpBar.style.width = `${pct}%`;
  }

  updateSoundButton(enabled) {
    this.btnSoundToggle.textContent = enabled ? "🔊 SOUND: ON" : "🔇 SOUND: OFF";
    this.btnSoundToggle.classList.toggle("sound-muted", !enabled);
  }

  startNewRace() {
    this.closeAllModals();
    game.prepareRace();
    this.typingInput.value = "";
    this.typingInput.focus();
  }

  closeAllModals() {
    document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.add("hidden"));
    this.typingInput.focus();
  }

  showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "game-toast";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("toast-fade");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  getRankOrdinal(n) {
    if (n === 1) return "1st 🥇";
    if (n === 2) return "2nd 🥈";
    if (n === 3) return "3rd 🥉";
    return `${n}th`;
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}
