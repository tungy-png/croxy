(() => {
  "use strict";

  const canvas = document.querySelector("#game-canvas");
  const ctx = canvas.getContext("2d");
  const overlay = document.querySelector("#game-overlay");
  const mainButton = document.querySelector("#main-button");
  const levelSelectButton = document.querySelector("#level-select-button");
  const levelSelectModal = document.querySelector("#level-select-modal");
  const levelSelectList = document.querySelector("#level-select-list");
  const levelSelectClose = document.querySelector("#level-select-close");
  const upgradeModal = document.querySelector("#upgrade-modal");
  const upgradeCards = document.querySelector("#upgrade-cards");
  const storyOverlay = document.querySelector("#story-overlay");
  const storyContinue = document.querySelector("#story-continue");
  const pauseIndicator = document.querySelector("#pause-indicator");
  const pauseButton = document.querySelector("#pause-button");
  const soundButton = document.querySelector("#sound-button");
  const arenaEventBanner = document.querySelector("#arena-event-banner");
  const arenaEventTitle = document.querySelector("#arena-event-title");
  const arenaEventCopy = document.querySelector("#arena-event-copy");
  const riftMeter = document.querySelector(".rift-meter");
  const riftCells = document.querySelector("#rift-cells");
  const arenaStatus = document.querySelector("#arena-status");
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const PADDLE_WIDTH = 12;
  const BALL_RADIUS = 8;
  const SERVE_DELAY = .2;

  const bosses = [
    { name: "THE IRON WALL", title: "IRON WALL", description: "A walking fortress. You know the drill.", style: "FORTRESS", power: { name: "TITAN BASTION", kind: "bastion", color: "#ff7758" }, phase: { name: "FORTRESS BREAKER", color: "#ff7758", move: "fortress" }, taunts: ["This court is a fortress. Break yourself against it.", "The Circuit pays me to stop you. I never miss.", "Your rebellion ends at my baseline."] },
    { name: "GLITCH EMPEROR", title: "GLITCH EMPEROR", description: "Unpredictable, overclocked, and very smug.", style: "GLITCH", power: { name: "REALITY RIFT", kind: "rift", color: "#c37cff" }, phase: { name: "REALITY DESYNC", color: "#c37cff", move: "glitch" }, taunts: ["I rewrote the physics. Try to keep up.", "Your future? I already deleted it.", "Let's see you return a ball that hasn't happened yet."] },
    { name: "THE LAST ACE", title: "THE LAST ACE", description: "Every shot is a highlight. Yours too.", style: "ACE", power: { name: "ACE LOCK", kind: "lock", color: "#fff08a" }, phase: { name: "PERFECT GAME", color: "#fff08a", move: "ace" }, taunts: ["One last challenger. One last perfect game.", "The shutdown key is behind me. Earn it.", "I built this Circuit. You will not break it."] }
  ];
  const arenaEvents = [
    { name: "GRAVITY WELL", copy: "The ball is pulled toward the arena center.", kind: "gravity", color: "#c187ff" },
    { name: "CROSSWIND", copy: "A shifting current bends every shot.", kind: "wind", color: "#68e8ff" },
    { name: "OVERDRIVE", copy: "Ball and paddles move at dangerous speed.", kind: "overdrive", color: "#ff9a55" }
  ];
  const opponents = [
    { name: "THE WARMUP", card: "BOT ZERO", description: "A training bot with<br>big ambitions.", style: "STANDARD", phase: { name: "TURBO DRILL", color: "#78e7ff", move: "burst" }, taunts: ["The Circuit welcomes you. The Circuit will keep your paddle.", "New challenger detected. Probability of victory: negligible.", "You made it past the door. Try making it past me."] },
    { name: "PIXEL PUNK", card: "PIXEL PUNK", description: "Small paddle. Big attitude.", style: "SCRAPPY", phase: { name: "GLITCH RIOT", color: "#ff6eb5", move: "jink" }, taunts: ["You want the shutdown key? Get in line.", "I was rebelling before rebellion was fashionable.", "Cute speech. Can you actually play?"] },
    { name: "THE WALL", card: "THE WALL", description: "Never blinks. Rarely misses.", style: "DEFENSIVE", phase: { name: "BREACH PROTOCOL", color: "#f4a77b", move: "breach" }, taunts: ["Every champion before you said the same thing.", "No one gets through. That's the whole point.", "I don't need to win. I just need to wait."] },
    { name: "NEON GHOST", card: "NEON GHOST", description: "Quick hands in a quick match.", style: "AGGRESSIVE", phase: { name: "PHANTOM CIRCUIT", color: "#63ffcc", move: "haunt" }, taunts: ["Catch me first. Then save your city.", "The old world had no place for losers.", "Show me that revolution everyone whispers about."] },
    { name: "STAR STRIKER", card: "STAR STRIKER", description: "Finally, a worthy rival.", style: "ELITE", phase: { name: "METEOR SHOW", color: "#ffe27a", move: "meteor" }, taunts: ["The crowd came for a champion. Give them a show.", "You've got the whole city watching now.", "Your little rebellion has made the main event."] },
    { name: "CYBER ACE", card: "CYBER ACE", description: "A perfectly calibrated menace.", style: "TACTICAL", phase: { name: "TARGET LOCK", color: "#68aaff", move: "target" }, taunts: ["My model predicts your defeat. Let's confirm it.", "Your paddle has a 97% chance of regret.", "The owner says you're bad for business."] }
  ];
  const upgradePool = [
    { id: "lifesteal", kind: "lifesteal", icon: "♥", name: "LIFE SIPHON", description: "Every return has a 33.6% chance to rip a hull point back from the void.", tag: "SOUL DRAIN · +33.6%", apply: (run) => { run.lifeSteal = Math.min(.936, run.lifeSteal + .336); } },
    { id: "speed", kind: "speed", icon: "»", name: "QUICK HANDS", description: "Move 21.6% faster. Double-tap ↑/↓ or W/S to flash-step through the arena.", tag: "AFTERIMAGE · DASH + SPEED", apply: (run) => { run.speed = Math.min(2.64, run.speed + .216); run.flashStepPower += 1.2; } },
    { id: "strength", kind: "strength", icon: "✳", name: "HEAVY HITTER", description: "Deal +1.2 damage whenever your shot scores.", tag: "FINISHER · SCORE DAMAGE +1.2", apply: (run) => { run.strength += 1.2; } },
    { id: "hull", kind: "hull", icon: "⬡", name: "REINFORCED HULL", description: "Forge a new heart of armor. Gain max hull and repair 1.2.", tag: "IRON SOUL · HULL +1.2", apply: (run) => { run.maxHealth += 1.2; run.health = Math.min(run.maxHealth, run.health + 1.2); } },
    { id: "wide", kind: "wide", icon: "↕", name: "WIDE GUARD", description: "Unleash a towering guardian spirit. Your paddle grows 16.8% taller.", tag: "TITAN FORM · PADDLE +16.8%", apply: (run) => { run.paddleSize = Math.min(1.96, run.paddleSize + .168); } },
    { id: "leech", kind: "lifesteal", icon: "✚", name: "SECOND WIND", description: "A radiant burst restores 2.4 hull. Stacks with Life Siphon.", tag: "REAWAKEN · REPAIR +2.4", apply: (run) => { run.health = Math.min(run.maxHealth, run.health + 2.4); } },
    { id: "overdrive", kind: "speed", icon: "ϟ", name: "OVERDRIVE", description: "Break the speed limit. Permanent 14.4% movement boost.", tag: "LIMIT BREAK · SPEED +", apply: (run) => { run.speed = Math.min(2.64, run.speed + .144); } },
    { id: "impact", kind: "strength", icon: "◆", name: "EXTRA IMPACT", description: "Your scores strike for +1.2 bonus damage.", tag: "METEOR STRIKE · SCORE DAMAGE +1.2", apply: (run) => { run.strength += 1.2; } },
    { id: "shield", kind: "shield", icon: "◉", name: "PHASE SHIELD", description: "Summon a cosmic barrier to erase one incoming miss, with a 20% chance to recharge after it blocks.", tag: "AETHER GUARD · SHIELD + RECHARGE", apply: (run) => { run.shields += 1; run.shieldRecharge = Math.min(.8, run.shieldRecharge + .2); } },
    { id: "tempo", kind: "tempo", icon: "◷", name: "TEMPO DRAIN", description: "Bend the arena's time. Every rival moves 16.8% slower.", tag: "TIME CURSE · RIVAL −16.8%", apply: (run) => { run.enemySlow = Math.max(.448, run.enemySlow * .832); } },
    { id: "ricochet", kind: "ricochet", icon: "◌", name: "RICOCHET CORE", description: "Every wall rebound accelerates the ball by 9.6%.", tag: "STAR REBOUND · WALL SPEED +9.6%", apply: (run) => { run.ricochet += .096; } },
    { id: "arc", kind: "arc", icon: "✺", name: "ARC CAPACITOR", description: "Every third of your returns charges your next score for +1.2 bonus damage.", tag: "THUNDER SEAL · CHARGED SHOT", apply: (run) => { run.arcPower += 1.2; } },
    { id: "curve", kind: "curve", icon: "〰", name: "CURVE DRIVER", description: "Pour your momentum into bending every shot around rivals.", tag: "DRAGON ARC · CURVE +", apply: (run) => { run.curve = Math.min(.816, run.curve + .24); } },
    { id: "guardian", kind: "guardian", icon: "⬡", name: "ASTRAL WARDEN", description: "Charge a spectral ward 20% faster; each stack adds another ward charge.", tag: "SPECTRAL GUARD · CHARGE RATE +20%", apply: (run) => { run.guardianCapacity += 1; run.guardianChargeRate += .2; } },
    { id: "foxfire", kind: "foxfire", icon: "☄", name: "EMBERSPIRIT DRIVE", description: "Empower your returns with 3% extra blazing momentum and a brighter fire trail.", tag: "FOXFLAME · RETURN SPEED +3%", apply: (run) => { run.foxfire += 1; } },
    { id: "scythe", kind: "scythe", icon: "☾", name: "REAPER'S CRESCENT", description: "Every third return unleashes a sweeping crescent. Your next score deals 1.2 bonus damage per stack.", tag: "CRESCENT STRIKE · DAMAGE +", apply: (run) => { run.scythePower += 1.2; } },
    { id: "curveShot", kind: "curve-shot", icon: "〰", name: "PHANTOM CURVE", description: "Your returns bend 20% harder into a sweeping spirit-guided arc toward your rival.", tag: "WARP SHOT · CURVE +20%", apply: (run) => { run.curveShotPower += 1.2; } },
    { id: "knuckleball", kind: "knuckleball", icon: "◇", name: "GHOST KNUCKLE", description: "Your returns jink 20% harder and more often in mid-flight, throwing off the rival's read.", tag: "WILD SHOT · JINK +20%", apply: (run) => { run.knuckleballPower += 1.2; } }
  ];
  const powerStyles = {
    lifesteal: { color: "#ff67b9", symbol: "♥", title: "SOUL DRAIN", shape: "orbit" },
    speed: { color: "#6ef7ff", symbol: "ϟ", title: "FLASH STEP", shape: "comet" },
    strength: { color: "#ff9a55", symbol: "✹", title: "METEOR FORCE", shape: "nova" },
    hull: { color: "#b7ff65", symbol: "⬡", title: "IRON SOUL", shape: "shield" },
    wide: { color: "#b89bff", symbol: "◉", title: "TITAN FORM", shape: "titan" },
    leech: { color: "#ff72a5", symbol: "✚", title: "SECOND WIND", shape: "orbit" },
    overdrive: { color: "#75e9ff", symbol: "ϟ", title: "LIMIT BREAK", shape: "comet" },
    impact: { color: "#ffb44e", symbol: "◆", title: "METEOR STRIKE", shape: "nova" },
    shield: { color: "#83f7ff", symbol: "◉", title: "AETHER GUARD", shape: "shield" },
    tempo: { color: "#b994ff", symbol: "◷", title: "TIME CURSE", shape: "clock" },
    ricochet: { color: "#ffd663", symbol: "◌", title: "STAR REBOUND", shape: "orbit" },
    arc: { color: "#88d9ff", symbol: "✺", title: "THUNDER SEAL", shape: "nova" },
    curve: { color: "#a7ffb5", symbol: "〰", title: "DRAGON ARC", shape: "wave" },
    guardian: { color: "#a6d8ff", symbol: "⬡", title: "ASTRAL WARDEN", shape: "guardian" },
    foxfire: { color: "#ff8b4d", symbol: "☄", title: "EMBERSPIRIT DRIVE", shape: "nova" },
    scythe: { color: "#d7a2ff", symbol: "☾", title: "REAPER'S CRESCENT", shape: "comet" },
    curveShot: { color: "#8fffd4", symbol: "〰", title: "PHANTOM CURVE", shape: "wave" },
    knuckleball: { color: "#ffe28f", symbol: "◇", title: "GHOST KNUCKLE", shape: "orbit" }
  };
  const spiritStyles = {
    lifesteal: { color: "#ff67b9", form: "wisp", symbol: "♥" },
    speed: { color: "#6ef7ff", form: "fox", symbol: "ϟ" },
    strength: { color: "#ff9a55", form: "brute", symbol: "✳" },
    hull: { color: "#b7ff65", form: "beetle", symbol: "⬡" },
    wide: { color: "#b89bff", form: "titan", symbol: "◉" },
    leech: { color: "#ff72a5", form: "wisp", symbol: "✚" },
    overdrive: { color: "#75e9ff", form: "comet", symbol: "ϟ" },
    impact: { color: "#ffb44e", form: "brute", symbol: "◆" },
    shield: { color: "#83f7ff", form: "guardian", symbol: "◉" },
    tempo: { color: "#b994ff", form: "wraith", symbol: "◷" },
    ricochet: { color: "#ffd663", form: "bat", symbol: "◌" },
    arc: { color: "#88d9ff", form: "sprite", symbol: "✺" },
    curve: { color: "#a7ffb5", form: "dragon", symbol: "〰" },
    guardian: { color: "#a6d8ff", form: "guardian", symbol: "⬡" },
    foxfire: { color: "#ff8b4d", form: "fox", symbol: "☄" },
    scythe: { color: "#d7a2ff", form: "wraith", symbol: "☾" },
    curveShot: { color: "#8fffd4", form: "dragon", symbol: "〰" },
    knuckleball: { color: "#ffe28f", form: "bat", symbol: "◇" }
  };
  const stars = Array.from({ length: 85 }, (_, i) => ({
    x: (i * 193 + 57) % WIDTH,
    y: (i * 307 + 29) % HEIGHT,
    radius: (i % 4 === 0) ? 1.5 : .8,
    alpha: .14 + (i % 6) * .045
  }));
  const keys = new Set();
  const particles = [];
  const progressStorageKey = "rally-rogue-max-level";
  let maxUnlockedLevel = loadMaxUnlockedLevel();
  let selectedStartLevel = 1;
  const ball = {
    x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0, trail: [],
    curveShotPower: 0, curveDirection: 1,
    knuckleballPower: 0, knuckleballTimer: 0, knuckleballDirection: 1,
    riftShot: false
  };
  const player = { x: 43, y: HEIGHT / 2, targetY: HEIGHT / 2, velocityY: 0, height: 106, bounce: 0, bounceVelocity: 0 };
  const enemy = { x: WIDTH - 43, y: HEIGHT / 2, targetY: HEIGHT / 2, velocityY: 0, height: 106, bounce: 0, bounceVelocity: 0 };
  const run = {
    mode: "menu",
    level: 1,
    wins: 0,
    maxStreak: 0,
    health: 3,
    maxHealth: 3,
    enemyHealth: 2,
    maxEnemyHealth: 2,
    strength: 1,
    speed: 1,
    paddleSize: 1,
    lifeSteal: 0,
    shields: 0,
    shieldRecharge: 0,
    enemySlow: 1,
    ricochet: 0,
    arcPower: 0,
    arcHits: 0,
    arcCharged: false,
    curve: 0,
    curveShotPower: 0,
    knuckleballPower: 0,
    guardianCapacity: 0,
    guardianCharge: 0,
    guardianReturns: 0,
    guardianChargeRate: 1,
    guardianChargeProgress: 0,
    foxfire: 0,
    scythePower: 0,
    scytheCharge: 0,
    scytheReturns: 0,
    flashStepPower: 0,
    flashStepCooldown: 0,
    flashStepTimer: 0,
    flashStepFromY: HEIGHT / 2,
    lastDirectionTap: null,
    spiritPulses: {},
    spiritActions: {},
    upgrades: {},
    serveTimer: 0,
    enemyThinkTimer: 0,
    bossTimer: 0,
    bossWarning: 0,
    bossShieldTimer: 0,
    bossShiftPending: false,
    bossShiftTimer: 0,
    bossAceLock: 0,
    phaseActive: false,
    phaseFlash: 0,
    signatureWarning: 0,
    signaturePending: false,
    signatureWobble: 0,
    signatureWobbleTimer: 0,
    signatureCurve: 0,
    signatureCurveTimer: 0,
    riftCharge: 0,
    riftArmed: false,
    riftDamageBonus: 0,
    arenaEventPhase: "calm",
    arenaEventIndex: -1,
    arenaEventTimer: 8,
    arenaEventElapsed: 0,
    arenaEventSpeedFactor: 1,
    riftCore: null,
    riftCoreTimer: 3,
    rally: 0,
    lastTime: 0,
    soundOn: true,
    audioContext: null,
    flash: 0,
    flashColor: "#d2ff54",
    shake: 0,
    hitStop: 0,
    animeImpact: null,
    pendingStory: null,
    pendingPowerReveal: null,
    powerReveal: null,
    draftingStart: false
  };

  function loadMaxUnlockedLevel() {
    try {
      const stored = Number(window.localStorage.getItem(progressStorageKey));
      return Number.isSafeInteger(stored) && stored >= 1 ? stored : 1;
    } catch (error) {
      console.error("Unable to load unlocked level progress.", error);
      return 1;
    }
  }

  function updateRiftMeter() {
    const charge = Math.min(5, run.riftCharge);
    [...riftCells.children].forEach((cell, index) => {
      cell.classList.toggle("is-charged", index < charge);
    });
    const ready = charge === 5;
    riftMeter.classList.toggle("is-ready", ready);
    riftMeter.title = run.riftArmed
      ? "Rift Break is armed for your next return."
      : ready ? "Rift Break ready — press E to arm it." : `Rift Break charge: ${charge}/5 player returns.`;
    riftMeter.setAttribute("aria-label", run.riftArmed
      ? "Rift Break armed for the next return"
      : `Rift Break charge ${charge} of 5${ready ? ", press E to arm" : ""}`);
  }

  function activateRiftBreak() {
    if (run.mode !== "playing" || run.riftArmed || run.riftCharge < 5) return;
    run.riftCharge = 0;
    run.riftArmed = true;
    updateRiftMeter();
    setStatus("RIFT BREAK ARMED · NEXT RETURN", "live");
    run.flashColor = "#c187ff";
    run.flash = .24;
    tone(660, .18, "sine");
  }

  function saveMaxUnlockedLevel() {
    try {
      window.localStorage.setItem(progressStorageKey, String(maxUnlockedLevel));
    } catch (error) {
      console.error("Unable to save unlocked level progress.", error);
    }
  }

  function isBossLevel(level) {
    return level % 5 === 0;
  }

  function getOpponent(level) {
    if (isBossLevel(level)) return bosses[(Math.floor(level / 5) - 1) % bosses.length];
    return opponents[(level - 1) % opponents.length];
  }

  function updateHud() {
    const boss = isBossLevel(run.level);
    const opponent = getOpponent(run.level);
    const level = String(run.level).padStart(2, "0");
    document.querySelector("#round-label").textContent = `ROUND ${level}${boss ? " · BOSS" : ""}`;
    document.querySelector("#opponent-name").textContent = boss ? opponent.title : opponent.name;
    document.querySelector("#opponent-card-name").innerHTML = `${boss ? opponent.name : opponent.card}<span class="fighter-symbol opponent-symbol">${boss ? "◆" : "◇"}</span>`;
    document.querySelector("#opponent-description").innerHTML = opponent.description;
    document.querySelector("#threat-stat").textContent = boss ? "BOSS" : (run.level < 3 ? "LOW" : run.level < 7 ? "MED" : "HIGH");
    document.querySelector("#style-stat").textContent = opponent.style;
    document.querySelector("#ai-rank").textContent = level;
    document.querySelector("#opponent-round").textContent = level;
    document.querySelector("#boss-pill").hidden = !boss;
    document.querySelector("#boss-preview").hidden = boss;
    document.querySelector("#boss-preview-copy").innerHTML = `Next boss: level ${String(Math.ceil(run.level / 5) * 5).padStart(2, "0")}.<br>Make sure you're ready.`;
    document.querySelector("#wins-count").textContent = String(run.wins).padStart(2, "0");
    document.querySelector("#level-stat").textContent = level;
    document.querySelector("#streak-stat").innerHTML = `${run.maxStreak} <small>W</small>`;
    document.querySelector("#upgrade-stat").textContent = String(Object.values(run.upgrades).reduce((a, b) => a + b, 0)).padStart(2, "0");
    document.querySelector("#player-health-label").textContent = `${run.health.toFixed(1)} / ${run.maxHealth.toFixed(1)}`;
    document.querySelector("#enemy-health-label").textContent = `${run.enemyHealth.toFixed(1)} / ${run.maxEnemyHealth.toFixed(1)}`;
    document.querySelector("#cleared-level").textContent = `LEVEL ${level} CLEARED`;
    drawHealth("#player-health", run.health, run.maxHealth);
    drawHealth("#enemy-health", run.enemyHealth, run.maxEnemyHealth);
    updateBuildSummary();
  }

  function drawHealth(selector, current, maximum) {
    const container = document.querySelector(selector);
    container.replaceChildren();
    for (let i = 0; i < Math.ceil(maximum); i += 1) {
      const cell = document.createElement("span");
      cell.className = `health-cell${i < current ? " filled" : ""}`;
      if (i < current && current < i + 1) {
        cell.classList.add("partial");
        cell.style.setProperty("--health-fill", `${(current - i) * 100}%`);
      }
      cell.setAttribute("aria-hidden", "true");
      container.append(cell);
    }
  }

  function updateBuildSummary() {
    const container = document.querySelector("#build-summary");
    const labels = [
      ["lifesteal", "LIFE SIPHON"],
      ["speed", "QUICK HANDS"],
      ["strength", "HEAVY HITTER"],
      ["hull", "REINFORCED HULL"],
      ["wide", "WIDE GUARD"],
      ["leech", "SECOND WIND"],
      ["overdrive", "OVERDRIVE"],
      ["impact", "EXTRA IMPACT"],
      ["shield", "PHASE SHIELD"],
      ["tempo", "TEMPO DRAIN"],
      ["ricochet", "RICOCHET CORE"],
      ["arc", "ARC CAPACITOR"],
      ["curve", "CURVE DRIVER"],
      ["guardian", "ASTRAL WARDEN"],
      ["foxfire", "EMBERSPIRIT DRIVE"],
      ["scythe", "REAPER'S CRESCENT"],
      ["curveShot", "PHANTOM CURVE"],
      ["knuckleball", "GHOST KNUCKLE"]
    ];
    const built = labels.filter(([id]) => run.upgrades[id]);
    if (!built.length) {
      container.className = "build-empty";
      container.innerHTML = "Choose your starter<br>upgrade to begin.";
      return;
    }
    container.className = "";
    const list = document.createElement("ul");
    list.className = "build-list";
    for (const [id, label] of built.slice(-4)) {
      const item = document.createElement("li");
      item.innerHTML = `<span>${label}</span><em>×${run.upgrades[id]}</em>`;
      list.append(item);
    }
    container.replaceChildren(list);
  }

  function setStatus(message, state = "") {
    arenaStatus.className = `arena-status${state ? ` is-${state}` : ""}`;
    arenaStatus.innerHTML = `<span class="status-dot"></span>${message}`;
  }

  function updateArenaEventBanner() {
    if (run.arenaEventPhase === "calm") {
      arenaEventBanner.hidden = true;
      return;
    }
    const warning = run.arenaEventPhase === "warning";
    const event = arenaEvents[(run.arenaEventIndex + 1) % arenaEvents.length];
    const activeEvent = warning ? event : arenaEvents[run.arenaEventIndex];
    arenaEventBanner.hidden = false;
    arenaEventBanner.classList.toggle("is-warning", warning);
    arenaEventTitle.textContent = warning ? `INCOMING · ${activeEvent.name}` : activeEvent.name;
    arenaEventCopy.textContent = warning ? "Arena shift in 1.2 seconds" : activeEvent.copy;
    arenaEventBanner.style.borderColor = activeEvent.color;
    arenaEventTitle.style.color = activeEvent.color;
  }

  function startArenaEvent() {
    run.arenaEventIndex = (run.arenaEventIndex + 1) % arenaEvents.length;
    run.arenaEventPhase = "active";
    run.arenaEventTimer = 7;
    run.arenaEventElapsed = 0;
    const event = arenaEvents[run.arenaEventIndex];
    if (event.kind === "overdrive") {
      const speed = Math.hypot(ball.vx, ball.vy);
      run.arenaEventSpeedFactor = speed > 0 ? Math.min(1.13, 1120 / speed) : 1.13;
      ball.vx *= run.arenaEventSpeedFactor;
      ball.vy *= run.arenaEventSpeedFactor;
    }
    run.flashColor = event.color;
    run.flash = .22;
    run.shake = Math.max(run.shake, 7);
    spawnImpact(WIDTH / 2, HEIGHT / 2, event.color, .8);
    tone(520, .2, "sawtooth");
    setStatus(`${event.name} · SURVIVE THE SHIFT`, "danger");
    updateArenaEventBanner();
  }

  function endArenaEvent() {
    if (arenaEvents[run.arenaEventIndex]?.kind === "overdrive" && run.arenaEventSpeedFactor !== 1) {
      ball.vx /= run.arenaEventSpeedFactor;
      ball.vy /= run.arenaEventSpeedFactor;
      run.arenaEventSpeedFactor = 1;
    }
    run.arenaEventPhase = "calm";
    run.arenaEventTimer = 6.5;
    updateArenaEventBanner();
    setStatus("ARENA STABILIZED", "live");
  }

  function spawnRiftCore() {
    let x = 250 + Math.random() * (WIDTH - 500);
    let y = 95 + Math.random() * (HEIGHT - 190);
    if (Math.hypot(ball.x - x, ball.y - y) < 105) {
      x = x < WIDTH / 2 ? x + 150 : x - 150;
    }
    run.riftCore = { x, y, life: 7 };
    run.riftCoreTimer = 10;
  }

  function collectRiftCore() {
    if (!run.riftCore) return;
    const core = run.riftCore;
    const segmentX = ball.x - ball.previousX;
    const segmentY = ball.y - ball.previousY;
    const lengthSquared = segmentX * segmentX + segmentY * segmentY;
    const projection = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
      ((core.x - ball.previousX) * segmentX + (core.y - ball.previousY) * segmentY) / lengthSquared
    ));
    const closestX = ball.previousX + projection * segmentX;
    const closestY = ball.previousY + projection * segmentY;
    if (Math.hypot(core.x - closestX, core.y - closestY) > 22 + BALL_RADIUS) return;
    const previousCharge = run.riftCharge;
    run.riftCharge = Math.min(5, run.riftCharge + 2);
    if (previousCharge === 5) run.riftDamageBonus += 1;
    run.riftCore = null;
    updateRiftMeter();
    spawnImpact(core.x, core.y, "#c187ff", 1.25);
    run.flashColor = "#c187ff";
    run.flash = .3;
    setStatus(previousCharge === 5 ? "RIFT CORE · +1 BONUS DAMAGE" : "RIFT CORE · +2 CHARGE", "live");
    tone(920, .16, "sine");
  }

  function updateArena(dt) {
    if (run.arenaEventPhase === "calm") {
      run.arenaEventTimer -= dt;
      if (run.arenaEventTimer <= 0) {
        run.arenaEventPhase = "warning";
        run.arenaEventTimer = 1.2;
        updateArenaEventBanner();
        setStatus("ARENA SHIFT DETECTED", "danger");
        tone(330, .12, "square");
      }
    } else if (run.arenaEventPhase === "warning") {
      run.arenaEventTimer -= dt;
      if (run.arenaEventTimer <= 0) startArenaEvent();
    } else {
      run.arenaEventTimer -= dt;
      run.arenaEventElapsed += dt;
      if (run.arenaEventTimer <= 0) endArenaEvent();
    }

    if (run.riftCore) {
      run.riftCore.life -= dt;
      if (run.riftCore.life <= 0) run.riftCore = null;
    } else {
      run.riftCoreTimer -= dt;
      if (run.riftCoreTimer <= 0) spawnRiftCore();
    }
  }

  function prepareLevel() {
    const boss = isBossLevel(run.level);
    const baseHealth = 2 + Math.floor((run.level - 1) / 3);
    run.maxEnemyHealth = boss ? 5 + Math.floor(run.level / 5) * 2 : Math.min(9, baseHealth);
    run.enemyHealth = run.maxEnemyHealth;
    run.rally = 0;
    run.bossTimer = 4 + Math.random() * 2;
    run.bossWarning = 0;
    run.bossShieldTimer = 0;
    run.bossShiftPending = false;
    run.bossShiftTimer = 0;
    run.bossAceLock = 0;
    run.phaseActive = false;
    run.phaseFlash = 0;
    run.signatureWarning = 0;
    run.signaturePending = false;
    run.signatureWobble = 0;
    run.signatureWobbleTimer = 0;
    run.signatureCurve = 0;
    run.signatureCurveTimer = 0;
    run.riftCharge = 0;
    run.riftArmed = false;
    run.riftDamageBonus = 0;
    ball.riftShot = false;
    run.arenaEventPhase = "calm";
    run.arenaEventIndex = -1;
    run.arenaEventTimer = 8;
    run.arenaEventElapsed = 0;
    run.arenaEventSpeedFactor = 1;
    run.riftCore = null;
    run.riftCoreTimer = 3;
    updateArenaEventBanner();
    player.height = Math.min(194, 106 * run.paddleSize);
    enemy.height = boss ? 136 : 92 + Math.min(58, run.level * 5);
    player.y = HEIGHT / 2;
    player.targetY = player.y;
    player.velocityY = 0;
    enemy.y = HEIGHT / 2;
    enemy.targetY = enemy.y;
    enemy.velocityY = 0;
    player.bounce = 0;
    player.bounceVelocity = 0;
    enemy.bounce = 0;
    enemy.bounceVelocity = 0;
    resetBall();
    updateRiftMeter();
    updateHud();
    setStatus(boss ? "BOSS IN THE ARENA" : "MAKE YOUR MOVE");
  }

  function resetBall(direction = Math.random() < .5 ? -1 : 1) {
    run.rally = 0;
    run.hitStop = 0;
    run.signaturePending = false;
    run.signatureWarning = 0;
    run.signatureWobble = 0;
    run.signatureWobbleTimer = 0;
    run.signatureCurve = 0;
    run.signatureCurveTimer = 0;
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.vx = 0;
    ball.vy = 0;
    ball.trail.length = 0;
    ball.curveShotPower = 0;
    ball.knuckleballPower = 0;
    ball.knuckleballTimer = 0;
    ball.riftShot = false;
    run.serveTimer = SERVE_DELAY;
    ball.serveDirection = direction;
  }

  function startServe() {
    const direction = ball.serveDirection || (Math.random() < .5 ? -1 : 1);
    const speed = Math.min(850, 410 + run.level * 21) * run.arenaEventSpeedFactor;
    const angle = (Math.random() * 1.08) - .54;
    ball.vx = Math.cos(angle) * speed * direction;
    ball.vy = Math.sin(angle) * speed;
    setStatus("RALLY IN PROGRESS", "live");
    tone(390, .055, "sine");
  }

  function startRun(initialUpgrade, startingLevel = 1) {
    storyOverlay.hidden = true;
    document.querySelector("#controls-hint").hidden = false;
    run.pendingStory = null;
    run.level = startingLevel;
    run.wins = 0;
    run.maxStreak = 0;
    run.health = 3;
    run.maxHealth = 3;
    run.strength = 1;
    run.speed = 1;
    run.paddleSize = 1;
    run.lifeSteal = 0;
    run.shields = 0;
    run.shieldRecharge = 0;
    run.enemySlow = 1;
    run.ricochet = 0;
    run.arcPower = 0;
    run.arcHits = 0;
    run.arcCharged = false;
    run.curve = 0;
    run.curveShotPower = 0;
    run.knuckleballPower = 0;
    run.guardianCapacity = 0;
    run.guardianCharge = 0;
    run.guardianReturns = 0;
    run.guardianChargeRate = 1;
    run.guardianChargeProgress = 0;
    run.foxfire = 0;
    run.scythePower = 0;
    run.scytheCharge = 0;
    run.scytheReturns = 0;
    run.riftCharge = 0;
    run.riftArmed = false;
    run.riftDamageBonus = 0;
    run.flashStepPower = 0;
    run.flashStepCooldown = 0;
    run.flashStepTimer = 0;
    run.flashStepFromY = HEIGHT / 2;
    run.lastDirectionTap = null;
    run.spiritPulses = {};
    run.spiritActions = {};
    run.upgrades = {};
    run.pendingPowerReveal = initialUpgrade?.id || null;
    if (initialUpgrade) {
      initialUpgrade.apply(run);
      run.upgrades[initialUpgrade.id] = 1;
    }
    run.draftingStart = false;
    run.mode = "dialogue";
    prepareLevel();
    upgradeModal.hidden = true;
    overlay.classList.add("is-transparent");
    showStoryDialogue("before");
    if (run.soundOn) enableAudio();
  }

  function startNextLevel() {
    run.level += 1;
    run.mode = "dialogue";
    prepareLevel();
    upgradeModal.hidden = true;
    overlay.classList.add("is-transparent");
    showStoryDialogue("before");
  }

  function endRound() {
    if (run.mode !== "playing") return;
    run.mode = "dialogue";
    run.wins += 1;
    run.maxStreak = Math.max(run.maxStreak, run.wins);
    maxUnlockedLevel = Math.max(maxUnlockedLevel, run.level + 1);
    saveMaxUnlockedLevel();
    updateHud();
    setStatus(isBossLevel(run.level) ? "BOSS DEFEATED" : "ROUND CLEARED");
    run.pendingStory = "after";
    showStoryDialogue("after");
  }

  function loseRun() {
    const lostLevel = run.level;
    run.mode = "gameover";
    run.level = 1;
    run.wins = 0;
    run.pendingStory = null;
    run.hitStop = 0;
    run.serveTimer = 0;
    selectedStartLevel = 1;
    storyOverlay.hidden = true;
    upgradeModal.hidden = true;
    levelSelectModal.hidden = true;
    pauseIndicator.hidden = true;
    overlay.classList.remove("is-transparent");
    document.querySelector("#overlay-eyebrow").innerHTML = '<span class="live-dot"></span> RUN OVER';
    document.querySelector("#overlay-title").innerHTML = 'YOU<br><span>LOSE.</span>';
    document.querySelector("#overlay-copy").textContent = `You ran out of hull on level ${String(lostLevel).padStart(2, "0")}. Start a new run from level 01 or choose an unlocked rival.`;
    mainButton.innerHTML = 'NEW RUN · LEVEL 1 <span>↗</span>';
    document.querySelector("#controls-hint").hidden = true;
    prepareLevel();
    setStatus("YOU LOSE · BACK TO LEVEL 01");
    mainButton.focus();
  }

  function storyLineForLevel(phase, level, opponent) {
    if (phase === "before") {
      const taunt = opponent.taunts[(level - 1) % opponent.taunts.length];
      if (level === 1) {
        return [
          { speaker: "ROGUE", portrait: "R", line: "The Circuit shut down my neighborhood to build this arena. Beat every champion, take the master key, and bring the lights back home." },
          { speaker: opponent.name, portrait: "◆", line: taunt }
        ];
      }
      if (level === 5) {
        return [
          { speaker: "ROGUE", portrait: "R", line: "Five gates down. The champions aren't guarding a trophy. They're guarding the switch that controls the whole city." },
          { speaker: opponent.name, portrait: "◆", line: taunt }
        ];
      }
      if (isBossLevel(level)) {
        return [
          { speaker: "ROGUE", portrait: "R", line: `Another Circuit boss. Another lock between this city and its power. ${run.wins} wins behind me. This ends at the top.` },
          { speaker: opponent.name, portrait: "◆", line: taunt }
        ];
      }
      return [
        { speaker: "ROGUE", portrait: "R", line: `The crowd is waking up. ${run.wins} champions down, the shutdown key still ahead. Keep the rally alive.` },
        { speaker: opponent.name, portrait: "◇", line: taunt }
      ];
    }
    if (run.health <= 2) {
      return [
        { speaker: opponent.name, portrait: "◇", line: "You're still standing? Fine. Take your upgrade. I'll be ready for you again." },
        { speaker: "ROGUE", portrait: "R", line: "Hull's cracked, but the city's still dark. Patch me up. We've got another table to take." }
      ];
    }
    if (level === 1) {
      return [
        { speaker: opponent.name, portrait: "◇", line: "You beat the warmup. Don't mistake that for freedom." },
        { speaker: "ROGUE", portrait: "R", line: "One gate open. Every win gets us closer to the switch. Let's keep moving." }
      ];
    }
    if (isBossLevel(level)) {
      return [
        { speaker: opponent.name, portrait: "◆", line: "The Circuit won't forgive you for this. The owner knows you're coming." },
        { speaker: "ROGUE", portrait: "R", line: "Then let them watch. The next district gets its lights back." }
      ];
    }
    return [
      { speaker: opponent.name, portrait: "◇", line: "You earned that one. The next champion won't go easy on you." },
      { speaker: "ROGUE", portrait: "R", line: `Another gate down. ${run.wins} wins closer to shutting this whole racket off.` }
    ];
  }

  function showStoryDialogue(phase) {
    const opponent = getOpponent(run.level);
    const lines = storyLineForLevel(phase, run.level, opponent);
    let lineIndex = 0;
    storyOverlay.hidden = false;
    upgradeModal.hidden = true;
    document.querySelector("#story-chapter").textContent = isBossLevel(run.level)
      ? `CIRCUIT BOSS · LEVEL ${String(run.level).padStart(2, "0")}`
      : `THE NEON CIRCUIT · LEVEL ${String(run.level).padStart(2, "0")}`;
    document.querySelector("#story-phase").textContent = phase === "before" ? "PRE-MATCH TRANSMISSION" : "POST-MATCH TRANSMISSION";

    function presentLine() {
      const line = lines[lineIndex];
      document.querySelector("#story-title").textContent = line.speaker;
      document.querySelector("#story-portrait").textContent = line.portrait;
      document.querySelector("#story-portrait").dataset.speaker = line.portrait === "R" ? "rogue" : (line.portrait === "◆" ? "boss" : "opponent");
      document.querySelector("#story-line").textContent = line.line;
      document.querySelector("#story-subtitle").textContent = phase === "before"
        ? "THE CIRCUIT DOESN'T FORGIVE."
        : (lineIndex === lines.length - 1 ? "THE REVOLUTION RALLIES ON." : "POINT TO THE CHALLENGER.");
      storyContinue.innerHTML = lineIndex === lines.length - 1 && phase === "before"
        ? 'FIGHT <span>↗</span>'
        : lineIndex === lines.length - 1 ? 'CHOOSE UPGRADE <span>↗</span>' : 'NEXT <span>↗</span>';
    }

    storyContinue.onclick = () => {
      lineIndex += 1;
      if (lineIndex < lines.length) {
        presentLine();
        return;
      }
      storyOverlay.hidden = true;
      if (phase === "before") {
        run.mode = "playing";
        run.pendingStory = null;
        setStatus(isBossLevel(run.level) ? "BOSS IN THE ARENA" : "MAKE YOUR MOVE");
        if (run.pendingPowerReveal) {
          awakenPower(run.pendingPowerReveal);
          run.pendingPowerReveal = null;
        }
      } else {
        run.pendingStory = null;
        run.mode = "upgrades";
        renderUpgradeChoices(false);
        upgradeModal.hidden = false;
      }
    };
    presentLine();
    storyContinue.focus();
  }

  function renderUpgradeChoices(isOpening = false) {
    run.draftingStart = isOpening;
    document.querySelector("#modal-topline .eyebrow").innerHTML = isOpening
      ? '<span class="live-dot"></span> CHOOSE YOUR STARTER'
      : '<span class="live-dot"></span> ROUND CLEARED';
    document.querySelector("#cleared-level").textContent = isOpening
      ? "YOUR FIRST BUILD"
      : `LEVEL ${String(run.level).padStart(2, "0")} CLEARED`;
    document.querySelector("#upgrade-title").innerHTML = isOpening
      ? 'CHOOSE YOUR<br><span>STARTER.</span>'
      : 'PICK YOUR<br><span>EDGE.</span>';
    document.querySelector("#modal-copy").textContent = isOpening
      ? `Pick a power-up before the first serve against ${getOpponent(selectedStartLevel).name || getOpponent(selectedStartLevel).title}.`
      : "One upgrade. One step closer to the top.";
    document.querySelector("#modal-bottom span:first-child").textContent = isOpening
      ? "YOUR RUN STARTS HERE."
      : "YOUR BUILD, YOUR RULES.";
    document.querySelector("#modal-bottom span:last-child").textContent = isOpening
      ? "CHOOSE YOUR STARTER ↗"
      : "CHOOSE ONE TO CONTINUE ↗";
    const choices = [];
    const pool = [...upgradePool];
    while (choices.length < 3 && pool.length) {
      const index = Math.floor(Math.random() * pool.length);
      choices.push(pool.splice(index, 1)[0]);
    }
    upgradeCards.replaceChildren();
    for (const upgrade of choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "upgrade-card";
      button.dataset.kind = upgrade.kind;
      button.dataset.upgradeId = upgrade.id;
      button.dataset.power = upgrade.id;
      button.innerHTML = `<span class="upgrade-icon" aria-hidden="true">${upgrade.icon}</span><span class="upgrade-name">${upgrade.name}</span><span class="upgrade-description">${upgrade.description}</span><span class="upgrade-tag">${upgrade.tag}</span><span class="upgrade-awakening">✦ AWAKEN POWER ✦</span>`;
      button.addEventListener("click", () => {
        if (isOpening) {
          startRun(upgrade, selectedStartLevel);
          return;
        }
        upgrade.apply(run);
        run.upgrades[upgrade.id] = (run.upgrades[upgrade.id] || 0) + 1;
        run.pendingPowerReveal = upgrade.id;
        updateHud();
        startNextLevel();
      }, { once: true });
      upgradeCards.append(button);
    }
    upgradeCards.querySelector("button")?.focus();
  }

  function openLevelSelect() {
    const progress = document.querySelector("#level-select-progress");
    progress.textContent = `LEVEL ${String(maxUnlockedLevel).padStart(2, "0")} AVAILABLE`;
    levelSelectList.replaceChildren();
    for (let level = 1; level <= maxUnlockedLevel; level += 1) {
      const opponent = getOpponent(level);
      const label = opponent.name || opponent.title;
      const choice = document.createElement("button");
      choice.type = "button";
      choice.className = "level-choice";
      choice.innerHTML = `<span class="level-choice-number">LEVEL ${String(level).padStart(2, "0")}${isBossLevel(level) ? " · BOSS" : ""}</span><strong>${label}</strong><span class="level-choice-state">${level === maxUnlockedLevel ? "CURRENT CHALLENGER" : "CLEARED · PLAY AGAIN"}</span>`;
      choice.addEventListener("click", () => {
        selectedStartLevel = level;
        levelSelectModal.hidden = true;
        overlay.classList.add("is-transparent");
        run.mode = "upgrades";
        renderUpgradeChoices(true);
        upgradeModal.hidden = false;
      }, { once: true });
      levelSelectList.append(choice);
    }
    levelSelectModal.hidden = false;
    levelSelectList.querySelector("button")?.focus();
  }

  function awakenPower(id) {
    const style = powerStyles[id];
    run.powerReveal = { ...style, id, life: 1.45, maxLife: 1.45 };
    pulseSpirit(id, 1.2);
    run.flash = Math.max(run.flash, .22);
    run.flashColor = style.color;
    run.shake = Math.max(run.shake, 8);
    spawnImpact(WIDTH / 2, HEIGHT / 2, style.color, 1.4);
    tone(350 + Object.keys(run.upgrades).length * 36, .2, "sine");
  }

  function enableAudio() {
    if (!run.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) run.audioContext = new AudioContextClass();
    }
    if (run.audioContext?.state === "suspended") run.audioContext.resume();
  }

  function tone(frequency, duration, type = "triangle") {
    if (!run.soundOn || !run.audioContext) return;
    const oscillator = run.audioContext.createOscillator();
    const gain = run.audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, run.audioContext.currentTime);
    gain.gain.setValueAtTime(.045, run.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, run.audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(run.audioContext.destination);
    oscillator.start();
    oscillator.stop(run.audioContext.currentTime + duration);
  }

  function spawnImpact(x, y, color, intensity = 1) {
    run.shake = Math.max(run.shake, 5.5 * intensity);
    run.flash = Math.max(run.flash, .16 * intensity);
    run.flashColor = color;
    particles.push({
      kind: "ring", x, y, radius: 7, life: .38, maxLife: .38, color,
      lineWidth: 3 * intensity
    });
    const count = Math.round(27 * intensity);
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i / count) + (Math.random() - .5) * .36;
      const speed = (105 + Math.random() * 300) * intensity;
      particles.push({
        kind: "spark", x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: .25 + Math.random() * .38,
        maxLife: .63,
        size: 1.2 + Math.random() * 2.8 * intensity,
        color: Math.random() < .27 ? "#fff4cc" : color
      });
    }
    particles.push({
      kind: "ripple", x, y, radius: 5, life: .58, maxLife: .58, color,
      lineWidth: 2.5 * intensity
    });
    for (let i = 0; i < 3; i += 1) {
      particles.push({
        kind: "orb", x, y,
        vx: (Math.random() - .5) * 260 * intensity,
        vy: (Math.random() - .5) * 260 * intensity,
        radius: 3 + Math.random() * 5 * intensity,
        life: .34 + Math.random() * .3,
        maxLife: .64,
        color: i === 1 ? "#fff4cc" : color
      });
    }
    if (particles.length > 210) particles.splice(0, particles.length - 210);
  }

  function updateEffects(dt) {
    run.shake = Math.max(0, run.shake - dt * 30);
    run.flash = Math.max(0, run.flash - dt * 1.9);
    run.phaseFlash = Math.max(0, run.phaseFlash - dt);
    run.hitStop = Math.max(0, run.hitStop - dt);
    if (run.animeImpact) {
      run.animeImpact.life -= dt;
      if (run.animeImpact.life <= 0) run.animeImpact = null;
    }
    if (run.powerReveal) {
      run.powerReveal.life -= dt;
      if (run.powerReveal.life <= 0) run.powerReveal = null;
    }
    run.flashStepCooldown = Math.max(0, run.flashStepCooldown - dt);
    run.flashStepTimer = Math.max(0, run.flashStepTimer - dt);
    for (const paddle of [player, enemy]) {
      paddle.bounceVelocity += (-paddle.bounce * 120 - paddle.bounceVelocity * 17) * dt;
      paddle.bounce += paddle.bounceVelocity * dt;
    }
    for (const [id, life] of Object.entries(run.spiritPulses)) {
      run.spiritPulses[id] = Math.max(0, life - dt);
      if (run.spiritPulses[id] === 0) delete run.spiritPulses[id];
    }
    for (const [id, action] of Object.entries(run.spiritActions)) {
      action.life = Math.max(0, action.life - dt);
      if (action.life === 0) delete run.spiritActions[id];
    }
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.life -= dt;
      if (particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      if (particle.kind === "ring" || particle.kind === "ripple") {
        particle.radius += dt * (particle.kind === "ripple" ? 560 : 310);
      } else {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        const drag = Math.exp(-dt * 2.9);
        particle.vx *= drag;
        particle.vy *= drag;
        if (particle.kind === "orb") particle.radius += dt * 15;
      }
    }
  }

  function pulseSpirit(id, duration = .72) {
    if (!run.upgrades[id]) return;
    run.spiritPulses[id] = Math.max(run.spiritPulses[id] || 0, duration);
    if (!run.spiritActions[id]) {
      run.spiritActions[id] = {
        life: .38,
        duration: .38,
        targetX: ball.x,
        targetY: ball.y
      };
    }
  }

  function triggerFlashStep(direction) {
    if (run.mode !== "playing" || run.flashStepPower <= 0 || run.flashStepCooldown > 0) return;
    run.flashStepFromY = player.y;
    player.y += direction * Math.min(170, 112 + (run.flashStepPower - 1) * 16);
    clampPaddle(player);
    player.targetY = player.y;
    player.velocityY = direction * 260;
    run.flashStepTimer = .28;
    run.flashStepCooldown = .68;
    pulseSpirit("speed", .6);
    spawnImpact(player.x + 12, run.flashStepFromY, "#6ef7ff", .72);
    spawnImpact(player.x + 12, player.y, "#d7ffff", .9);
    setStatus("FLASH STEP · AFTERIMAGE", "live");
    tone(820, .1, "sine");
  }

  function registerPaddleReturn(x, y, color, side) {
    run.rally += 1;
    const comboBeat = run.rally >= 3 && run.rally % 3 === 0;
    const intensity = 1 + Math.min(1.5, run.rally * .075);
    spawnImpact(x, y, color, intensity);
    const paddle = side === "player" ? player : enemy;
    paddle.bounceVelocity += 25;
    const styles = [
      "orbit", "nova", "vortex", "ripple", "sigil", "comet",
      "kamehameha", "spirit-bomb", "rasengan", "black-hole"
    ];
    const style = styles[(run.rally - 1 + (side === "enemy" ? 2 : 0)) % styles.length];
    let guardianCharged = false;
    let scytheStrike = false;
    if (side === "player" && run.guardianCapacity > run.guardianCharge) {
      run.guardianChargeProgress += run.guardianChargeRate;
      if (run.guardianChargeProgress >= 3) {
        run.guardianCharge += 1;
        run.guardianChargeProgress -= 3;
        guardianCharged = true;
      }
    }
    if (side === "player" && run.scythePower > 0) {
      run.scytheReturns += 1;
      if (run.scytheReturns % 3 === 0) {
        run.scytheCharge = Math.min(run.scythePower, run.scytheCharge + run.scythePower);
        scytheStrike = true;
      }
    }
    run.animeImpact = {
      x, y, side, combo: run.rally, style,
      guardianCharged, scytheStrike,
      life: run.rally >= 3 ? 1.5 : .56,
      maxLife: run.rally >= 3 ? 1.5 : .56,
      beamAngle: 0
    };
    if (guardianCharged) setStatus("ASTRAL WARD · CHARGED", "live");
    if (scytheStrike) setStatus("REAPER'S CRESCENT · UNLEASHED", "danger");
    if (side === "player") {
      const previousRiftCharge = run.riftCharge;
      run.riftCharge = Math.min(5, run.riftCharge + 1);
      updateRiftMeter();
      if (previousRiftCharge < 5 && run.riftCharge === 5 && !run.riftArmed) {
        setStatus("RIFT BREAK READY · PRESS E", "live");
        tone(880, .12, "sine");
      }
      if (run.foxfire > 0) pulseSpirit("foxfire");
      if (run.arcPower > 0) {
        run.arcHits += 1;
        if (run.arcHits % 3 === 0) {
          run.arcCharged = true;
          pulseSpirit("arc", 1.1);
          setStatus("ARC CAPACITOR · CHARGED SHOT", "live");
        }
      }
      if (guardianCharged) pulseSpirit("guardian", 1);
      if (scytheStrike) pulseSpirit("scythe", 1);
    }
    if (run.rally >= 3) {
      run.hitStop = Math.max(run.hitStop, comboBeat ? .34 : .22);
      run.flash = Math.max(run.flash, .2);
      run.flashColor = "#fff2bc";
      run.shake = Math.max(run.shake, 17 + Math.min(12, run.rally * .55));
      tone(620 + Math.min(run.rally * 24, 280), .18, "sawtooth");
    }
  }

  function heal() {
    if (run.health >= run.maxHealth || Math.random() >= run.lifeSteal) return;
    run.health += 1;
    pulseSpirit("lifesteal", 1);
    run.flash = .35;
    tone(720, .12, "sine");
    updateHud();
    setStatus("LIFE SIPHON · +1 HULL", "live");
  }

  function damageEnemy() {
    if (isBossLevel(run.level) && getOpponent(run.level).power.kind === "bastion" && run.bossShieldTimer > 0) {
      run.bossShieldTimer = 0;
      run.arcCharged = false;
      run.scytheCharge = 0;
      run.riftDamageBonus = 0;
      spawnImpact(enemy.x, enemy.y, "#ff7758", 1.9);
      run.flashColor = "#ff7758";
      run.flash = .42;
      run.shake = Math.max(run.shake, 17);
      setStatus("TITAN BASTION · SCORE BLOCKED", "danger");
      tone(125, .3, "square");
      return;
    }
    const damage = run.strength + (run.arcCharged ? run.arcPower : 0) + run.scytheCharge + run.riftDamageBonus;
    if (run.upgrades.strength) pulseSpirit("strength", .9);
    if (run.upgrades.impact) pulseSpirit("impact", .9);
    if (run.arcCharged) pulseSpirit("arc", .9);
    if (run.scytheCharge) pulseSpirit("scythe", .9);
    run.enemyHealth = Math.max(0, run.enemyHealth - damage);
    run.arcCharged = false;
    run.scytheCharge = 0;
    run.riftDamageBonus = 0;
    run.flash = .28;
    if (run.enemyHealth > 0 && !run.phaseActive && run.enemyHealth <= run.maxEnemyHealth / 2) {
      const phase = getOpponent(run.level).phase;
      run.phaseActive = true;
      run.phaseFlash = 1.2;
      run.flash = .42;
      run.flashColor = phase.color;
      run.shake = Math.max(run.shake, 13);
      spawnImpact(enemy.x, enemy.y, phase.color, 1.35);
      tone(190, .28, "sawtooth");
      setStatus(`${phase.name} · PHASE TWO`, "danger");
    }
    updateHud();
    tone(150, .1, "sawtooth");
    if (run.enemyHealth <= 0) endRound();
  }

  function unleashBossPower() {
    const power = getOpponent(run.level).power;
    run.flashColor = power.color;
    run.flash = .34;
    run.shake = Math.max(run.shake, 11);
    tone(105, .3, "sawtooth");
    if (power.kind === "bastion") {
      run.bossShieldTimer = 5;
      setStatus("TITAN BASTION · SHIELD UP", "danger");
    } else if (power.kind === "rift") {
      run.bossShiftPending = true;
      run.bossShiftTimer = 4;
      setStatus("REALITY RIFT · LANE SHIFT ARMED", "danger");
    } else if (power.kind === "lock") {
      run.bossAceLock = .9;
      setStatus("ACE LOCK · BREAK THE READ", "danger");
    } else {
      console.error(`Unknown boss superpower: ${power.kind}`);
    }
  }

  function launchSignatureMove() {
    const phase = getOpponent(run.level).phase;
    const speed = Math.min(1060, Math.hypot(ball.vx, ball.vy));
    const awayFromCenter = Math.sign(ball.y - HEIGHT / 2) || 1;
    const targetTime = Math.max(.2, (ball.x - player.x) / Math.max(1, Math.abs(ball.vx)));
    const predictedPlayerY = Math.max(
      player.height / 2 + 11,
      Math.min(HEIGHT - player.height / 2 - 11, player.y + player.velocityY * targetTime * .68)
    );
    run.signaturePending = false;
    run.signatureWarning = 0;
    run.signatureWobble = 0;
    run.signatureCurve = 0;
    run.signatureCurveTimer = 0;

    switch (phase.move) {
      case "burst":
        ball.vx *= 1.22;
        ball.vy *= 1.22;
        break;
      case "jink":
        run.signatureWobble = .68;
        run.signatureWobbleTimer = .08;
        break;
      case "breach":
        ball.vx = -Math.cos(.23) * speed * 1.16;
        ball.vy = Math.sin(.23) * speed * 1.16 * awayFromCenter;
        break;
      case "haunt":
        run.signatureCurve = 1;
        run.signatureCurveTimer = .82;
        break;
      case "meteor": {
        const angle = Math.sign(player.y - ball.y || awayFromCenter) * .76;
        ball.vx = -Math.cos(angle) * speed * 1.12;
        ball.vy = Math.sin(angle) * speed * 1.12;
        break;
      }
      case "target": {
        const angle = Math.atan2(predictedPlayerY - ball.y, Math.max(140, ball.x - player.x));
        ball.vx = -Math.cos(angle) * speed * 1.08;
        ball.vy = Math.sin(angle) * speed * 1.08;
        break;
      }
      case "fortress": {
        const angle = Math.sign(player.y - ball.y || awayFromCenter) * .18;
        ball.vx = -Math.cos(angle) * speed * 1.34;
        ball.vy = Math.sin(angle) * speed * 1.34;
        break;
      }
      case "glitch":
        run.signatureWobble = 1.12;
        run.signatureWobbleTimer = .045;
        break;
      case "ace": {
        const angle = Math.atan2(predictedPlayerY - ball.y, Math.max(140, ball.x - player.x));
        ball.vx = -Math.cos(angle) * speed * 1.2;
        ball.vy = Math.sin(angle) * speed * 1.2;
        run.signatureCurve = .32;
        run.signatureCurveTimer = .48;
        break;
      }
      default:
        console.error(`Unknown opponent signature move: ${phase.move}`);
    }

    const resultingSpeed = Math.hypot(ball.vx, ball.vy);
    if (resultingSpeed > 1120) {
      ball.vx *= 1120 / resultingSpeed;
      ball.vy *= 1120 / resultingSpeed;
    }
    spawnImpact(ball.x, ball.y, phase.color, phase.move === "fortress" ? 1.25 : .9);
    run.flashColor = phase.color;
    run.flash = Math.max(run.flash, .22);
    setStatus(`${phase.name} · SIGNATURE SHOT`, "danger");
    tone(phase.move === "glitch" ? 760 : 420, .14, phase.move === "glitch" ? "square" : "sawtooth");
  }

  function loseHealth() {
    function resumeAfterMiss() {
      run.riftDamageBonus = 0;
      resetBall(1);
      run.mode = "playing";
      pauseIndicator.hidden = true;
      run.lastTime = 0;
      run.serveTimer = 0;
      startServe();
    }

    if (run.guardianCharge > 0) {
      run.guardianCharge -= 1;
      pulseSpirit("guardian", 1);
      run.flash = .4;
      run.flashColor = "#a6d8ff";
      spawnImpact(35, ball.y, "#a6d8ff", 1.35);
      updateHud();
      tone(780, .18, "sine");
      setStatus(`ASTRAL WARD · ${run.guardianCharge} CHARGE${run.guardianCharge === 1 ? "" : "S"} LEFT`, "live");
      resumeAfterMiss();
      return;
    }
    if (run.shields > 0) {
      run.shields -= 1;
      if (Math.random() < run.shieldRecharge) run.shields += 1;
      pulseSpirit("shield", 1);
      run.flash = .4;
      run.flashColor = "#8ceeff";
      spawnImpact(35, ball.y, "#8ceeff", 1.25);
      updateHud();
      tone(780, .18, "sine");
      setStatus(`PHASE SHIELD · ${run.shields} CHARGE${run.shields === 1 ? "" : "S"} LEFT`, "live");
      resumeAfterMiss();
      return;
    }
    run.health = Math.max(0, run.health - 1);
    run.flash = .5;
    run.flashColor = "#ff7758";
    player.damageFlash = .5;
    const hullDepleted = run.health === 0;
    updateHud();
    tone(115, .16, "square");
    if (hullDepleted) {
      loseRun();
      return;
    }
    setStatus(`HULL HIT · ${run.health} REMAINING`, "danger");
    resumeAfterMiss();
  }

  function clampPaddle(paddle) {
    paddle.y = Math.max(paddle.height / 2 + 11, Math.min(HEIGHT - paddle.height / 2 - 11, paddle.y));
  }

  function predictBallY() {
    if (ball.vx <= 0) return HEIGHT / 2;
    const time = (enemy.x - ball.x) / ball.vx;
    let projected = ball.y + ball.vy * time;
    while (projected < 15 || projected > HEIGHT - 15) {
      if (projected < 15) projected = 30 - projected;
      if (projected > HEIGHT - 15) projected = 2 * (HEIGHT - 15) - projected;
    }
    return projected;
  }

  function update(dt) {
    updateEffects(dt);
    if (run.hitStop > 0) return;
    if (run.mode !== "playing") return;
    if (run.serveTimer > 0) {
      run.serveTimer -= dt;
      if (run.serveTimer <= 0) startServe();
    }
    if (run.signaturePending) {
      run.signatureWarning -= dt;
      if (run.signatureWarning <= 0) {
        if (ball.vx < 0) launchSignatureMove();
        else run.signaturePending = false;
      }
    }
    if (run.signatureWobble > 0 && ball.vx < 0 && run.serveTimer <= 0) {
      run.signatureWobble -= dt;
      run.signatureWobbleTimer -= dt;
      if (run.signatureWobbleTimer <= 0) {
        const speed = Math.hypot(ball.vx, ball.vy);
        ball.vy = Math.max(-speed * .88, Math.min(speed * .88, ball.vy + (Math.random() - .5) * speed * .78));
        run.signatureWobbleTimer = run.signatureWobble > .3 ? .075 : .11;
        spawnImpact(ball.x, ball.y, getOpponent(run.level).phase.color, .32);
      }
    }
    if (run.signatureCurveTimer > 0 && ball.vx < 0 && run.serveTimer <= 0) {
      run.signatureCurveTimer = Math.max(0, run.signatureCurveTimer - dt);
      const steer = Math.sign(player.y - ball.y) || 1;
      ball.vy = Math.max(-820, Math.min(820, ball.vy + steer * 520 * run.signatureCurve * dt));
      if (Math.random() < dt * 18) {
        spawnImpact(ball.x, ball.y, getOpponent(run.level).phase.color, .22);
      }
    }
    if (run.bossWarning > 0) {
      run.bossWarning -= dt;
      if (run.bossWarning <= 0) {
        if (ball.vx < 0) unleashBossPower();
      }
    }
    if (isBossLevel(run.level) && run.bossWarning <= 0 && ball.vx < 0) {
      run.bossTimer -= dt;
      if (run.bossTimer <= 0) {
        run.bossWarning = .8;
        run.bossTimer = 5.2 + Math.random() * 2;
        setStatus(`${getOpponent(run.level).power.name} · CHARGING`, "danger");
      }
    }
    run.bossShieldTimer = Math.max(0, run.bossShieldTimer - dt);
    if (run.bossShiftPending) {
      run.bossShiftTimer -= dt;
      if (run.bossShiftTimer <= 0) {
        run.bossShiftPending = false;
        setStatus("REALITY RIFT · WINDOW CLOSED", "live");
      }
    }
    run.bossAceLock = Math.max(0, run.bossAceLock - dt);
    if (run.bossAceLock > 0 && ball.vx < 0 && run.serveTimer <= 0) {
      const interceptTime = Math.max(.16, (ball.x - player.x) / Math.abs(ball.vx));
      const targetY = player.y + player.velocityY * Math.min(.28, interceptTime * .22);
      const desiredVy = Math.max(-700, Math.min(700, (targetY - ball.y) / interceptTime));
      ball.vy += (desiredVy - ball.vy) * Math.min(1, dt * 2.8);
    }
    const arenaEvent = run.arenaEventPhase === "active" ? arenaEvents[run.arenaEventIndex] : null;
    const overdrive = arenaEvent?.kind === "overdrive" ? 1.22 : 1;
    const direction = (keys.has("arrowdown") || keys.has("s") ? 1 : 0) - (keys.has("arrowup") || keys.has("w") ? 1 : 0);
    if (direction) {
      player.velocityY += (direction * 490 * run.speed * overdrive - player.velocityY) * Math.min(1, dt * 17);
    } else {
      player.velocityY += (player.targetY - player.y) * dt * 54;
      player.velocityY *= Math.exp(-7.2 * dt);
    }
    player.velocityY = Math.max(-780, Math.min(780, player.velocityY));
    player.y += player.velocityY * dt;
    clampPaddle(player);

    run.enemyThinkTimer -= dt;
    if (run.enemyThinkTimer <= 0) {
      run.enemyThinkTimer = Math.max(.08, .31 - run.level * .012);
      const prediction = predictBallY();
      const accuracy = isBossLevel(run.level) ? 8 : Math.max(14, 110 - run.level * 7);
      enemy.targetY = prediction + (Math.random() - .5) * accuracy;
    }
    const enemySpeed = Math.min(isBossLevel(run.level) ? 550 : 390, (160 + run.level * 19) * run.enemySlow) * overdrive;
    const enemyDelta = enemy.targetY - enemy.y;
    const previousEnemyY = enemy.y;
    enemy.y += Math.sign(enemyDelta) * Math.min(Math.abs(enemyDelta), enemySpeed * dt);
    enemy.velocityY = dt > 0 ? (enemy.y - previousEnemyY) / dt : 0;
    clampPaddle(enemy);

    if (run.serveTimer > 0) return;
    updateArena(dt);
    const activeArenaEvent = run.arenaEventPhase === "active" ? arenaEvents[run.arenaEventIndex] : null;
    if (activeArenaEvent?.kind === "gravity") {
      const pull = Math.max(-480, Math.min(480, (HEIGHT / 2 - ball.y) * 1.9));
      ball.vy += pull * dt;
    } else if (activeArenaEvent?.kind === "wind") {
      ball.vy += Math.sin(run.arenaEventElapsed * 2.8) * 390 * dt;
    }
    const ballSpeed = Math.hypot(ball.vx, ball.vy);
    if (ballSpeed > 1120) {
      ball.vx *= 1120 / ballSpeed;
      ball.vy *= 1120 / ballSpeed;
    }
    if (ball.vx > 0 && ball.curveShotPower > 0) {
      ball.vy = Math.max(-760, Math.min(760, ball.vy + ball.curveDirection * 580 * ball.curveShotPower * dt));
    }
    if (ball.vx > 0 && ball.knuckleballPower > 0) {
      ball.knuckleballTimer -= dt;
      if (ball.knuckleballTimer <= 0) {
        ball.knuckleballDirection = (Math.random() - .5) * 2;
        ball.knuckleballTimer = .09 + Math.random() * .06;
        ball.vy = Math.max(-620, Math.min(620, ball.vy + ball.knuckleballDirection * (170 + Math.random() * 110) * ball.knuckleballPower));
        spawnImpact(ball.x, ball.y, "#ffe28f", .55 + ball.knuckleballPower * .08);
      }
    }
    ball.trail.unshift({ x: ball.x, y: ball.y });
    if (ball.trail.length > (run.rally >= 3 ? 38 : 18)) ball.trail.pop();
    const previousX = ball.x;
    const previousY = ball.y;
    ball.previousX = previousX;
    ball.previousY = previousY;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    let unreflectedY = ball.y;

    if (run.bossShiftPending &&
        ((previousX < WIDTH / 2 && ball.x >= WIDTH / 2) || (previousX > WIDTH / 2 && ball.x <= WIDTH / 2))) {
      const fromY = ball.y;
      ball.y = HEIGHT - ball.y;
      ball.vy = -ball.vy;
      unreflectedY = ball.y;
      run.bossShiftPending = false;
      run.bossShiftTimer = 0;
      spawnImpact(WIDTH / 2, fromY, "#c37cff", 1.35);
      spawnImpact(WIDTH / 2, ball.y, "#f1d8ff", 1.25);
      run.flashColor = "#c37cff";
      run.flash = .28;
      run.shake = Math.max(run.shake, 9);
      setStatus("REALITY RIFT · POSITION FLIPPED", "danger");
      tone(740, .18, "square");
    }

    if (ball.y - BALL_RADIUS < 10) {
      ball.y = 10 + BALL_RADIUS;
      ball.vy = Math.abs(ball.vy);
      ball.vx *= 1 + run.ricochet;
      pulseSpirit("ricochet");
      spawnImpact(ball.x, 10, isBossLevel(run.level) ? "#ff7758" : "#a8c5ff", .72);
      tone(235, .03);
    } else if (ball.y + BALL_RADIUS > HEIGHT - 10) {
      ball.y = HEIGHT - 10 - BALL_RADIUS;
      ball.vy = -Math.abs(ball.vy);
      ball.vx *= 1 + run.ricochet;
      pulseSpirit("ricochet");
      spawnImpact(ball.x, HEIGHT - 10, isBossLevel(run.level) ? "#ff7758" : "#a8c5ff", .72);
      tone(235, .03);
    }
    collectRiftCore();

    const playerContactX = player.x + PADDLE_WIDTH / 2 + BALL_RADIUS;
    const enemyContactX = enemy.x - PADDLE_WIDTH / 2 - BALL_RADIUS;
    const playerHitY = previousY + (unreflectedY - previousY) *
      ((playerContactX - previousX) / (ball.x - previousX));
    const enemyHitY = previousY + (unreflectedY - previousY) *
      ((enemyContactX - previousX) / (ball.x - previousX));

    if (ball.vx < 0 && previousX >= playerContactX && ball.x <= playerContactX &&
        Math.abs(playerHitY - player.y) <= player.height / 2 + BALL_RADIUS) {
      registerPaddleReturn(playerContactX, playerHitY, "#d2ff54", "player");
      bounceOffPaddle(player, 1, playerHitY);
      if (run.animeImpact) {
        run.animeImpact.beamAngle = Math.atan2(ball.vy, ball.vx);
        run.animeImpact.curveShot = ball.curveShotPower > 0;
        run.animeImpact.knuckleball = ball.knuckleballPower > 0;
      }
      heal();
    } else if (ball.vx > 0 && previousX <= enemyContactX && ball.x >= enemyContactX &&
        Math.abs(enemyHitY - enemy.y) <= enemy.height / 2 + BALL_RADIUS) {
      registerPaddleReturn(enemyContactX, enemyHitY, isBossLevel(run.level) ? "#ff7758" : "#a1a7bb", "enemy");
      bounceOffPaddle(enemy, -1, enemyHitY);
      ball.riftShot = false;
      if (run.phaseActive) {
        run.signaturePending = true;
        run.signatureWarning = .3;
        setStatus(`${getOpponent(run.level).phase.name} · CHARGING`, "danger");
      }
      if (run.animeImpact) run.animeImpact.beamAngle = Math.atan2(ball.vy, ball.vx);
      tone(480 + Math.min(run.rally * 8, 220), .045);
    }

    if (ball.x + BALL_RADIUS < 0) {
      spawnImpact(8, ball.y, "#ff7758", 1.35);
      loseHealth();
    }
    else if (ball.x - BALL_RADIUS > WIDTH) {
      spawnImpact(WIDTH - 8, ball.y, "#d2ff54", 1.35);
      damageEnemy();
      if (run.mode === "playing") resetBall(-1);
    }
  }

  function bounceOffPaddle(paddle, direction, hitY = ball.y) {
    ball.x = paddle.x + direction * (PADDLE_WIDTH / 2 + BALL_RADIUS);
    ball.y = hitY;
    const offset = Math.max(-1, Math.min(1, (hitY - paddle.y) / (paddle.height / 2)));
    const acceleration = paddle === player ? Math.min(.24, run.foxfire * .03) : 0;
    const speed = Math.min(1120, Math.hypot(ball.vx, ball.vy) * (1.06 + acceleration) + 2);
    const paddleVelocity = paddle === player ? player.velocityY : enemy.velocityY;
    const curve = paddle === player ? paddleVelocity * run.curve / 650 : 0;
    const angle = Math.max(-1.24, Math.min(1.24, offset * 1.04 + curve));
    ball.vx = Math.cos(angle) * speed * direction;
    ball.vy = Math.sin(angle) * speed;
    if (paddle === player) {
      ball.curveShotPower = run.curveShotPower + Math.min(.96, run.curve * 4);
      ball.curveDirection = Math.sign(offset || paddleVelocity || (ball.y < HEIGHT / 2 ? 1 : -1));
      ball.knuckleballPower = run.knuckleballPower;
      ball.knuckleballTimer = .08;
      ball.knuckleballDirection = (Math.random() - .5) * 2;
      if (run.curve) pulseSpirit("curve", 1);
      if (run.upgrades.speed) pulseSpirit("speed", .75);
      if (run.upgrades.overdrive) pulseSpirit("overdrive", .75);
      if (ball.curveShotPower && run.curveShotPower) pulseSpirit("curveShot", 1);
      if (ball.knuckleballPower) pulseSpirit("knuckleball", 1);
      if (run.riftArmed) {
        const riftSpeed = Math.min(1120, Math.hypot(ball.vx, ball.vy) * 1.3);
        const interceptTime = (enemy.x - ball.x) / Math.max(1, riftSpeed);
        const targetY = Math.max(enemy.height / 2 + 11, Math.min(
          HEIGHT - enemy.height / 2 - 11,
          enemy.y + enemy.velocityY * interceptTime * .65
        ));
        const angle = Math.max(-.82, Math.min(.82, Math.atan2(targetY - ball.y, enemy.x - ball.x)));
        ball.vx = Math.cos(angle) * riftSpeed;
        ball.vy = Math.sin(angle) * riftSpeed;
        ball.riftShot = true;
        run.riftArmed = false;
        run.riftDamageBonus = 2;
        run.flashColor = "#c187ff";
        run.flash = .5;
        run.shake = Math.max(run.shake, 15);
        spawnImpact(ball.x, ball.y, "#c187ff", 1.65);
        pulseSpirit("strength", 1.1);
        setStatus("RIFT BREAK · +2 SCORE DAMAGE", "danger");
        tone(170, .28, "sawtooth");
        updateRiftMeter();
      }
    } else {
      ball.curveShotPower = 0;
      ball.knuckleballPower = 0;
      ball.riftShot = false;
    }
  }

  function roundRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    if (run.shake > 0) {
      ctx.translate(
        (Math.random() - .5) * run.shake,
        (Math.random() - .5) * run.shake
      );
    }
    const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    background.addColorStop(0, "#0b1019");
    background.addColorStop(.55, "#0c1018");
    background.addColorStop(1, "#101018");
    ctx.fillStyle = background;
    ctx.fillRect(-12, -12, WIDTH + 24, HEIGHT + 24);

    for (const star of stars) {
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = "#b9c4df";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(211, 218, 236, .13)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 11]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 20);
    ctx.lineTo(WIDTH / 2, HEIGHT - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(210, 255, 84, .1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 10);
    ctx.lineTo(WIDTH - 20, 10);
    ctx.moveTo(20, HEIGHT - 10);
    ctx.lineTo(WIDTH - 20, HEIGHT - 10);
    ctx.stroke();

    drawArenaEvent();
    drawRiftCore();
    if (isBossLevel(run.level)) drawBoss();
    if (run.phaseActive) drawOpponentPhase();
    drawFlashStepAfterimages();
    drawPaddle(player, "#d2ff54", .16);
    const opponentPhase = getOpponent(run.level).phase;
    drawPaddle(enemy, run.phaseActive ? opponentPhase.color : (isBossLevel(run.level) ? "#ff7758" : "#a1a7bb"), .12);
    drawUpgradeSpirits();
    drawTempoCurse();
    drawGuardianWard();
    drawBall(ball, ball.trail);
    drawArcCharge(ball);
    drawParticles();
    drawAnimeImpact(ball);
    drawComboCounter();
    drawPowerReveal();

    if (run.flash > 0) {
      ctx.globalAlpha = Math.min(.25, run.flash * .75);
      ctx.fillStyle = run.flashColor;
      ctx.fillRect(-12, -12, WIDTH + 24, HEIGHT + 24);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawArenaEvent() {
    const warning = run.arenaEventPhase === "warning";
    if (run.arenaEventPhase === "calm" && !warning) return;
    const event = arenaEvents[warning ? (run.arenaEventIndex + 1) % arenaEvents.length : run.arenaEventIndex];
    const pulse = .5 + Math.sin(performance.now() / 90) * .5;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (warning) {
      ctx.globalAlpha = .1 + pulse * .08;
      ctx.strokeStyle = event.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 12]);
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(WIDTH - 20, 20);
      ctx.moveTo(20, HEIGHT - 20);
      ctx.lineTo(WIDTH - 20, HEIGHT - 20);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (event.kind === "gravity") {
      ctx.globalAlpha = .11 + pulse * .07;
      ctx.strokeStyle = event.color;
      ctx.shadowColor = event.color;
      ctx.shadowBlur = 18;
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.ellipse(WIDTH / 2, HEIGHT / 2, 45 + i * 34, 28 + i * 24, performance.now() / (1400 + i * 180), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = .28;
      ctx.beginPath();
      ctx.arc(WIDTH / 2, HEIGHT / 2, 9 + pulse * 8, 0, Math.PI * 2);
      ctx.fillStyle = event.color;
      ctx.fill();
    } else if (event.kind === "wind") {
      ctx.globalAlpha = .12 + pulse * .1;
      ctx.strokeStyle = event.color;
      ctx.shadowColor = event.color;
      ctx.shadowBlur = 12;
      for (let i = 0; i < 9; i += 1) {
        const y = 45 + i * 59 + Math.sin(performance.now() / 280 + i) * 12;
        const drift = (performance.now() / 2 + i * 117) % WIDTH;
        ctx.beginPath();
        ctx.moveTo(drift - 130, y);
        ctx.quadraticCurveTo(drift - 55, y - 15, drift, y);
        ctx.quadraticCurveTo(drift + 55, y + 15, drift + 130, y);
        ctx.stroke();
      }
    } else {
      ctx.globalAlpha = .13 + pulse * .1;
      ctx.strokeStyle = event.color;
      ctx.shadowColor = event.color;
      ctx.shadowBlur = 16;
      ctx.lineWidth = 3;
      const offset = (performance.now() / 5) % 44;
      for (let x = -HEIGHT; x < WIDTH; x += 44) {
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset + HEIGHT * .22, HEIGHT);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawRiftCore() {
    if (!run.riftCore) return;
    const { x, y, life } = run.riftCore;
    const pulse = .5 + Math.sin(performance.now() / 75) * .5;
    const rotation = performance.now() / 620;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = Math.min(1, life * 1.8) * (.72 + pulse * .22);
    ctx.shadowColor = "#c187ff";
    ctx.shadowBlur = 24;
    ctx.strokeStyle = "#e0c4ff";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      const radius = 13 + i * 8 + pulse * 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius, rotation * (i % 2 ? -1 : 1), rotation * (i % 2 ? -1 : 1) + Math.PI * 1.45);
      ctx.stroke();
    }
    ctx.fillStyle = "#fff5ff";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFlashStepAfterimages() {
    if (run.flashStepTimer <= 0) return;
    const progress = run.flashStepTimer / .28;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i += 1) {
      const blend = (i + 1) / 3;
      const y = player.y + (run.flashStepFromY - player.y) * (blend * progress);
      ctx.globalAlpha = progress * (.32 - i * .07);
      ctx.fillStyle = i === 0 ? "#f3ffff" : "#66dfff";
      ctx.shadowColor = "#69dfff";
      ctx.shadowBlur = 18;
      roundRect(player.x - PADDLE_WIDTH / 2 - 1, y - player.height / 2, PADDLE_WIDTH + 2, player.height, 6);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawUpgradeSpirits() {
    const owned = Object.keys(run.upgrades).filter((id) => run.upgrades[id] && spiritStyles[id]).slice(-4);
    if (!owned.length) return;
    const now = performance.now() / 220;
    owned.forEach((id, index) => {
      const spirit = spiritStyles[id];
      const pulse = run.spiritPulses[id] || 0;
      const bob = Math.sin(now + index * 1.7) * 7;
      const homeX = player.x + 48 + index * 28;
      const homeY = player.y - 27 + bob;
      const action = run.spiritActions[id];
      let x = homeX;
      let y = homeY - Math.min(20, pulse * 18);
      if (action) {
        const progress = 1 - action.life / action.duration;
        const strike = Math.min(1, progress / .68);
        const returnProgress = Math.max(0, (progress - .68) / .32);
        const easedStrike = strike * strike * (3 - 2 * strike);
        const easedReturn = returnProgress * returnProgress * (3 - 2 * returnProgress);
        const travel = easedStrike * (1 - easedReturn);
        x += (action.targetX - homeX) * travel;
        y += (action.targetY - homeY) * travel;
        y -= Math.sin(progress * Math.PI) * 12;
      }
      const scale = Math.min(1.25, .82 + pulse * .38);
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = .52 + Math.min(.4, pulse * .45);
      ctx.shadowColor = spirit.color;
      ctx.shadowBlur = 11 + pulse * 15;
      ctx.fillStyle = spirit.color;
      ctx.strokeStyle = spirit.color;
      ctx.lineWidth = 1.6;
      if (spirit.form === "bat" || spirit.form === "dragon" || spirit.form === "fox") {
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.quadraticCurveTo(-17, -14 - pulse * 4, -19, -3);
        ctx.quadraticCurveTo(-14, 5, -6, 5);
        ctx.moveTo(7, 0);
        ctx.quadraticCurveTo(17, -14 - pulse * 4, 19, -3);
        ctx.quadraticCurveTo(14, 5, 6, 5);
        ctx.fill();
      } else if (spirit.form === "brute" || spirit.form === "titan" || spirit.form === "guardian" || spirit.form === "beetle") {
        ctx.beginPath();
        ctx.moveTo(-8, -5);
        ctx.lineTo(-13, -13 - pulse * 3);
        ctx.lineTo(-3, -9);
        ctx.moveTo(8, -5);
        ctx.lineTo(13, -13 - pulse * 3);
        ctx.lineTo(3, -9);
        ctx.stroke();
      }
      const body = ctx.createRadialGradient(-3, -4, 1, 0, 0, 14);
      body.addColorStop(0, "#ffffff");
      body.addColorStop(.3, spirit.color);
      body.addColorStop(1, `${spirit.color}22`);
      ctx.fillStyle = body;
      ctx.beginPath();
      if (spirit.form === "wisp" || spirit.form === "comet") {
        ctx.ellipse(0, 0, 9, 12, Math.sin(now + index) * .22, 0, Math.PI * 2);
      } else if (spirit.form === "brute" || spirit.form === "titan") {
        ctx.moveTo(-9, 4); ctx.lineTo(-8, -5); ctx.lineTo(-3, -10);
        ctx.lineTo(4, -9); ctx.lineTo(9, -3); ctx.lineTo(8, 5); ctx.lineTo(0, 10); ctx.closePath();
      } else if (spirit.form === "dragon" || spirit.form === "fox") {
        ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(0, 0, 9, 9, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#10131c";
      ctx.beginPath();
      ctx.arc(-3, -1, 1.25, 0, Math.PI * 2);
      ctx.arc(3, -1, 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = .85;
      ctx.fillStyle = "#f8f6ed";
      ctx.font = "700 8px 'DM Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(spirit.symbol, 0, 18);
      if (pulse > 0) {
        ctx.globalAlpha = pulse * .55;
        ctx.beginPath();
        ctx.arc(0, 0, 18 + Math.sin(now * 2) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawTempoCurse() {
    if (run.enemySlow >= 1) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = .2 + Math.sin(performance.now() / 180) * .08;
    ctx.strokeStyle = "#b994ff";
    ctx.shadowColor = "#b994ff";
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2;
    const rotation = performance.now() / 900;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(enemy.x, enemy.y, 19 + i * 6, enemy.height * .34, rotation + i, .3, Math.PI * 1.7);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBoss() {
    const pulse = .5 + Math.sin(performance.now() / 340) * .16;
    const centerX = WIDTH / 2;
    const centerY = 74;
    const warning = run.bossWarning > 0;
    const power = getOpponent(run.level).power;
    ctx.save();
    ctx.strokeStyle = warning ? power.color : "rgba(255, 119, 88, .22)";
    ctx.lineWidth = warning ? 2 : 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, warning ? 22 + (1 - run.bossWarning / .8) * 16 : 18 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = warning ? `${power.color}55` : "rgba(255, 119, 88, .08)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = power.color;
    ctx.font = "15px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("◆", centerX, centerY + 5);
    ctx.globalAlpha = warning ? .95 : .55;
    ctx.fillStyle = power.color;
    ctx.font = "700 9px 'DM Mono', monospace";
    ctx.fillText(power.name, centerX, centerY + 37);

    if (run.bossShieldTimer > 0) {
      ctx.globalAlpha = .3 + pulse * .18;
      ctx.strokeStyle = power.color;
      ctx.shadowColor = power.color;
      ctx.shadowBlur = 23;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(enemy.x, enemy.y, 25 + pulse * 5, enemy.height * .6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = .85;
      ctx.font = "700 9px 'DM Mono', monospace";
      ctx.fillText("SHIELD · SCORE ONCE TO BREAK", WIDTH / 2, HEIGHT - 22);
    }

    if (run.bossShiftPending) {
      ctx.globalAlpha = .42 + pulse * .3;
      ctx.strokeStyle = power.color;
      ctx.shadowColor = power.color;
      ctx.shadowBlur = 20;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse(WIDTH / 2, HEIGHT / 2, 15 + i * 14, 42 + i * 16, performance.now() / 370 * (i % 2 ? -1 : 1), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([7, 8]);
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 20);
      ctx.lineTo(WIDTH / 2, HEIGHT - 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = .85;
      ctx.font = "700 9px 'DM Mono', monospace";
      ctx.fillText("RIFT WILL FLIP YOUR LANE", WIDTH / 2, HEIGHT - 22);
    }

    if (run.bossAceLock > 0 && ball.vx < 0) {
      const interceptTime = Math.max(.16, (ball.x - player.x) / Math.abs(ball.vx));
      const targetY = Math.max(player.height / 2 + 11, Math.min(
        HEIGHT - player.height / 2 - 11,
        player.y + player.velocityY * Math.min(.28, interceptTime * .22)
      ));
      ctx.globalAlpha = .42 + pulse * .36;
      ctx.strokeStyle = power.color;
      ctx.shadowColor = power.color;
      ctx.shadowBlur = 17;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(player.x, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(player.x + 15, targetY, 13 + pulse * 4, 0, Math.PI * 2);
      ctx.moveTo(player.x + 4, targetY);
      ctx.lineTo(player.x + 26, targetY);
      ctx.moveTo(player.x + 15, targetY - 11);
      ctx.lineTo(player.x + 15, targetY + 11);
      ctx.stroke();
      ctx.globalAlpha = .9;
      ctx.font = "700 9px 'DM Mono', monospace";
      ctx.fillText("ACE LOCK · MOVE", WIDTH / 2, HEIGHT - 22);
    }
    ctx.restore();
  }

  function drawOpponentPhase() {
    const phase = getOpponent(run.level).phase;
    const pulse = .5 + Math.sin(performance.now() / 110) * .5;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (run.phaseFlash > 0) {
      ctx.globalAlpha = run.phaseFlash * .07;
      ctx.fillStyle = phase.color;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    ctx.globalAlpha = .28 + pulse * .18;
    ctx.strokeStyle = phase.color;
    ctx.shadowColor = phase.color;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y, 23 + pulse * 6, enemy.height * (.52 + pulse * .04), performance.now() / 800, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = .78;
    ctx.fillStyle = phase.color;
    ctx.font = "700 12px 'DM Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${phase.name} · PHASE 02`, WIDTH / 2, 29);
    if (run.signatureWarning > 0) {
      ctx.globalAlpha = .45 + pulse * .5;
      ctx.font = "700 11px 'DM Mono', monospace";
      ctx.fillText("SIGNATURE ATTACK INCOMING", WIDTH / 2, 49);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 15 + pulse * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPaddle(paddle, color, glow, visualY = paddle.y) {
    ctx.save();
    const damage = paddle === player ? 1 - run.health / run.maxHealth : 0;
    const bounce = Math.min(1, paddle.bounce);
    const motion = Math.min(1, Math.abs(paddle.velocityY) / 780);
    const widthScale = 1 + bounce * .42 + motion * .08;
    const heightScale = 1 - bounce * .18;
    const tilt = Math.max(-.11, Math.min(.11, paddle.velocityY * .00014));
    ctx.translate(paddle.x, visualY);
    ctx.rotate(tilt);
    ctx.scale(widthScale, heightScale);
    ctx.shadowColor = color;
    ctx.shadowBlur = 17 + damage * 7 + bounce * 16;
    ctx.fillStyle = damage > .62 ? "#ff7758" : color;
    roundRect(-PADDLE_WIDTH / 2, -paddle.height / 2, PADDLE_WIDTH, paddle.height, 5);
    ctx.fill();
    ctx.globalAlpha = Math.min(.55, glow + bounce * .2);
    ctx.fillRect(-PADDLE_WIDTH / 2 - 4, -paddle.height / 2 - 7, PADDLE_WIDTH + 8, paddle.height + 14);
    ctx.globalAlpha = 1;
    if (damage > 0) {
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "#ff7758";
      ctx.globalAlpha = .17 + damage * .39;
      for (let i = 0; i < Math.ceil(damage * 6); i += 1) {
        const crackY = -paddle.height / 2 + ((i * 37 + 13) % paddle.height);
        const direction = i % 2 ? 1 : -1;
        ctx.fillRect(-5, crackY, 10, 1 + damage * 2);
        ctx.fillRect(-1, crackY - 3, 1.5, 7 + damage * 6);
        ctx.fillStyle = "#11141b";
        ctx.fillRect(-2, crackY + direction * 3, 4, 1.5);
        ctx.fillStyle = "#ff7758";
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = Math.max(damage * .7, bounce * .55);
      ctx.strokeStyle = "#ff9b6d";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, PADDLE_WIDTH + 9 + Math.sin(performance.now() / 100) * 3, 0, Math.PI * 2);
      ctx.stroke();
      if (damage > .78 && Math.random() < .22) {
        ctx.globalAlpha = .8;
        ctx.fillStyle = "#ff7758";
        ctx.beginPath();
        ctx.arc((Math.random() - .5) * 19, (Math.random() - .5) * paddle.height, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawGuardianWard() {
    if (run.guardianCharge <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = .48 + Math.sin(performance.now() / 150) * .16;
    ctx.strokeStyle = "#a6d8ff";
    ctx.shadowColor = "#74caff";
    ctx.shadowBlur = 16;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(player.x, player.y, 24, player.height * .56, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawArcCharge(visualBall) {
    if (!run.arcCharged) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = .72 + Math.sin(performance.now() / 45) * .2;
    ctx.strokeStyle = "#9ceeff";
    ctx.shadowColor = "#57cfff";
    ctx.shadowBlur = 22;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const radius = 15 + i * 7;
      ctx.beginPath();
      ctx.arc(visualBall.x, visualBall.y, radius, performance.now() / 130 + i, performance.now() / 130 + i + Math.PI * 1.35);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBall(visualBall = ball, trail = ball.trail) {
    const speed = Math.hypot(visualBall.vx, visualBall.vy);
    const speedRatio = Math.max(0, Math.min(1, (speed - 350) / 590));
    const stretch = 1 + speedRatio * .95;
    const squash = 1 - speedRatio * .44;
    const angle = speed > 0 ? Math.atan2(visualBall.vy, visualBall.vx) : 0;
    const ballColor = visualBall.riftShot ? "#d7a6ff" : (run.foxfire > 0 ? (speedRatio > .72 ? "#fff0a0" : "#ff9a4e") : (speedRatio > .72 ? "#ffbd76" : "#e4ff9b"));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = trail.length - 1; i >= 0; i -= 1) {
      const point = trail[i];
      const age = 1 - i / trail.length;
      const radius = BALL_RADIUS * (.32 + age * (.85 + speedRatio * .9));
      ctx.globalAlpha = age * (.11 + speedRatio * .24);
      ctx.fillStyle = visualBall.riftShot
        ? (i % 3 === 0 ? "#f4ddff" : "#a75cff")
        : run.foxfire > 0
        ? (i % 3 === 0 ? "#ff563d" : "#ffd17a")
        : (speedRatio > .76 ? (i % 3 === 0 ? "#ff967e" : "#ffe6a3") : "#c8ff69");
      ctx.beginPath();
      ctx.ellipse(
        point.x, point.y,
        radius * (1.4 + speedRatio * 1.5),
        radius * (.72 - speedRatio * .22),
        angle, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.translate(visualBall.x, visualBall.y);
    ctx.rotate(angle);
    ctx.shadowColor = ballColor;
    ctx.shadowBlur = 18 + speedRatio * 34;
    ctx.fillStyle = visualBall.riftShot ? "#fff4ff" : (run.foxfire > 0 ? "#fff0ce" : (speedRatio > .72 ? "#fff1d1" : "#f0ffc2"));
    ctx.beginPath();
    ctx.ellipse(0, 0, BALL_RADIUS * stretch, BALL_RADIUS * squash, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (visualBall.riftShot) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = .6 + Math.sin(performance.now() / 35) * .18;
      ctx.strokeStyle = "#dbb2ff";
      ctx.shadowColor = "#ad62ff";
      ctx.shadowBlur = 25;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(visualBall.x, visualBall.y, 15 + Math.sin(performance.now() / 42) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    drawBallSignature(visualBall);
  }

  function drawAnimeImpact(visualBall = ball) {
    if (!run.animeImpact) return;
    const impact = run.animeImpact;
    const progress = Math.max(0, impact.life / impact.maxLife);
    const intensity = 1 + Math.min(3, Math.floor(impact.combo / 3));
    const angle = impact.beamAngle;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    if (impact.combo >= 3 || impact.curveShot || impact.knuckleball) {
      if (impact.style === "kamehameha") {
        drawEnergyBeam(visualBall.x, visualBall.y, angle, progress, "#aafcff", intensity);
      } else if (["spirit-bomb", "rasengan", "black-hole"].includes(impact.style)) {
        drawSignatureImpact(impact, progress, intensity);
      }
    }
    if (impact.curveShot) drawCurveShotImpact(impact, progress, intensity);
    if (impact.knuckleball) drawKnuckleballImpact(impact, progress, intensity);
    if (run.foxfire > 0 && impact.side === "player") drawFoxfireImpact(impact, progress);
    if (impact.guardianCharged) drawGuardianBurst(impact, progress);
    if (impact.scytheStrike) drawScytheSlash(impact, progress, intensity);

    const rayCount = Math.min(112, 16 + impact.combo * 6);
    ctx.globalAlpha = progress * Math.min(.88, .27 + impact.combo * .055);
    ctx.strokeStyle = impact.style === "comet" ? "#d7faff" : "#fff4d6";
    ctx.lineWidth = .8 + Math.min(2.2, impact.combo * .14);
    for (let i = 0; i < rayCount; i += 1) {
      const rayAngle = (Math.PI * 2 * i / rayCount) + .045;
      const inner = 12 + ((i * 31) % (24 + intensity * 15));
      const outer = 55 + ((i * 47) % (85 + impact.combo * 29));
      ctx.beginPath();
      ctx.moveTo(impact.x + Math.cos(rayAngle) * inner, impact.y + Math.sin(rayAngle) * inner);
      ctx.lineTo(impact.x + Math.cos(rayAngle) * outer, impact.y + Math.sin(rayAngle) * outer);
      ctx.stroke();
    }

    const ringCount = Math.min(12, 2 + Math.ceil(impact.combo / 2));
    const pulse = performance.now() / 90;
    for (let i = 0; i < ringCount; i += 1) {
      ctx.globalAlpha = progress * (.7 - (i / ringCount) * .35);
      ctx.strokeStyle = ["#aafcff", "#fff5d6", "#c0a6ff"][i % 3];
      ctx.lineWidth = Math.max(1, 4 - i * .2);
      ctx.beginPath();
      const radius = 12 + ((pulse * 11 + i * (14 + intensity * 2)) % (42 + impact.combo * 5));
      if (impact.style === "orbit" || impact.style === "vortex") {
        ctx.ellipse(
          impact.x, impact.y,
          radius * (1.02 + Math.sin(pulse + i) * .06),
          radius * (.72 + Math.cos(pulse * .8 + i) * .06),
          pulse * .12 + i * .08, 0, Math.PI * 2
        );
      } else if (impact.style === "comet") {
        ctx.arc(impact.x, impact.y, radius, pulse + i * .5, pulse + i * .5 + Math.PI * 1.55);
      } else {
        ctx.arc(impact.x, impact.y, radius, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    const satellites = Math.min(22, 2 + impact.combo * 2);
    for (let i = 0; i < satellites; i += 1) {
      const orbit = 28 + (i % 4) * 9 + intensity * 5;
      const orbitAngle = pulse * (impact.style === "vortex" ? 2 : 1) + i * Math.PI * 2 / satellites;
      const x = impact.x + Math.cos(orbitAngle) * orbit;
      const y = impact.y + Math.sin(orbitAngle) * orbit;
      const orbRadius = 1.5 + Math.min(4, impact.combo * .24) + (i % 3) * .45;
      ctx.globalAlpha = progress * .83;
      ctx.fillStyle = i % 4 === 0 ? "#ffffff" : ["#aafcff", "#c0a6ff", "#fff5d6"][i % 3];
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8 + impact.combo;
      ctx.beginPath();
      ctx.arc(x, y, orbRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (impact.combo >= 3 || impact.curveShot || impact.knuckleball) {
      const labelX = Math.max(105, Math.min(WIDTH - 105, impact.x + (impact.side === "player" ? 82 : -82)));
      const labelY = Math.max(53, Math.min(HEIGHT - 53, impact.y - 65));
      ctx.globalAlpha = progress;
      ctx.translate(labelX, labelY);
      ctx.rotate(impact.side === "player" ? -.11 : .11);
      ctx.font = `900 ${Math.min(64, 42 + impact.combo)}px 'Barlow Condensed', Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.lineWidth = 11;
      ctx.strokeStyle = "#10131c";
      ctx.shadowColor = "#fff4d6";
      ctx.shadowBlur = 28;
      ctx.strokeText(["CLASH!", "BREAK!", "AWAKEN!"][Math.floor(impact.combo / 3) % 3], 0, 0);
      const signatureName = impact.curveShot && impact.knuckleball
        ? "CURVE + KNUCKLE!"
        : impact.curveShot
          ? "PHANTOM CURVE!"
          : impact.knuckleball
            ? "GHOST KNUCKLE!"
            : ({
        kamehameha: "KAMEHAMEHA!",
        "spirit-bomb": "SPIRIT BOMB!",
        rasengan: "RASENGAN!",
        "black-hole": "BLACK HOLE!"
      }[impact.style]);
      ctx.fillStyle = impact.style === "black-hole" ? "#d8a6ff" : (impact.curveShot ? "#a5ffe0" : impact.knuckleball ? "#ffe28f" : "#b9ffff");
      ctx.fillText(signatureName || ["CLASH!", "BREAK!", "AWAKEN!"][Math.floor(impact.combo / 3) % 3], 0, 0);
    }
    ctx.restore();

    const frame = Math.floor((1 - progress) * (16 + impact.combo * 6));
    if (impact.combo >= 3 && frame % Math.max(2, 7 - Math.floor(impact.combo / 3)) === 0) {
      ctx.save();
      ctx.globalAlpha = progress * Math.min(.7, .28 + impact.combo * .025);
      ctx.fillStyle = "#f7ffff";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.restore();
    } else if (impact.combo >= 3 && frame % 3 === 1) {
      ctx.save();
      ctx.globalAlpha = progress * .75;
      ctx.fillStyle = "#080a10";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(WIDTH * .22, 0);
      ctx.lineTo(0, HEIGHT * .24);
      ctx.lineTo(0, HEIGHT * .09);
      ctx.moveTo(WIDTH, HEIGHT);
      ctx.lineTo(WIDTH * .76, HEIGHT);
      ctx.lineTo(WIDTH, HEIGHT * .74);
      ctx.lineTo(WIDTH, HEIGHT * .91);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFoxfireImpact(impact, progress) {
    const pulse = performance.now() / 75;
    ctx.save();
    ctx.translate(impact.x, impact.y);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 7; i += 1) {
      const angle = pulse * .18 + i * Math.PI * 2 / 7;
      const radius = 17 + (i % 3) * 4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      ctx.globalAlpha = progress * .75;
      ctx.strokeStyle = i % 2 ? "#ffb14f" : "#fff0a0";
      ctx.shadowColor = "#ff642e";
      ctx.shadowBlur = 13;
      ctx.lineWidth = 2 + (i % 2);
      ctx.beginPath();
      ctx.moveTo(x, y + 5);
      ctx.quadraticCurveTo(x - Math.cos(angle) * 7, y - 5, x + Math.cos(angle) * 3, y - 13 - (i % 3) * 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGuardianBurst(impact, progress) {
    ctx.save();
    ctx.translate(impact.x, impact.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = progress * .9;
    ctx.strokeStyle = "#b8e6ff";
    ctx.shadowColor = "#74caff";
    ctx.shadowBlur = 24;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 6; i += 1) {
      const angle = -Math.PI / 2 + i * Math.PI / 3;
      const radius = 34 + (i % 2) * 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawScytheSlash(impact, progress, intensity) {
    ctx.save();
    ctx.translate(impact.x, impact.y);
    ctx.rotate(impact.side === "player" ? 0 : Math.PI);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = progress;
    const radius = 70 + Math.min(impact.combo, 12) * 3;
    const blade = ctx.createLinearGradient(0, -radius, radius * 1.25, radius);
    blade.addColorStop(0, "#fff7df");
    blade.addColorStop(.35, "#ebc6ff");
    blade.addColorStop(1, "rgba(166,105,255,0)");
    ctx.strokeStyle = blade;
    ctx.shadowColor = "#bf83ff";
    ctx.shadowBlur = 26 + intensity * 6;
    ctx.lineWidth = 4 + intensity;
    ctx.beginPath();
    ctx.arc(18, 0, radius, -1.85, 1.25);
    ctx.stroke();
    ctx.strokeStyle = "#fff4df";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-27, 29);
    ctx.lineTo(53, -48);
    ctx.stroke();
    ctx.restore();
  }

  function drawCurveShotImpact(impact, progress, intensity) {
    const pulse = performance.now() / 100;
    const direction = impact.side === "player" ? 1 : -1;
    ctx.save();
    ctx.translate(impact.x + direction * 34, impact.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = progress * .92;
    ctx.strokeStyle = "#8fffd4";
    ctx.shadowColor = "#45ffc0";
    ctx.shadowBlur = 20;
    ctx.lineWidth = 3 + intensity * .5;
    for (let i = 0; i < 3; i += 1) {
      const bend = 40 + i * 15;
      ctx.beginPath();
      ctx.moveTo(-direction * 34, -bend);
      ctx.bezierCurveTo(direction * (18 + i * 8), -bend * .35, direction * (72 + i * 12), bend * .6, direction * 116, 5);
      ctx.stroke();
    }
    ctx.fillStyle = "#effff8";
    ctx.beginPath();
    ctx.arc(direction * 111, 5 + Math.sin(pulse) * 4, 5 + intensity, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawKnuckleballImpact(impact, progress, intensity) {
    const pulse = performance.now() / 65;
    const direction = impact.side === "player" ? 1 : -1;
    ctx.save();
    ctx.translate(impact.x + direction * 24, impact.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = progress * .9;
    ctx.strokeStyle = "#ffe28f";
    ctx.shadowColor = "#ffc95b";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 2.5 + intensity * .4;
    for (let stream = 0; stream < 4; stream += 1) {
      ctx.beginPath();
      for (let point = 0; point < 8; point += 1) {
        const x = direction * (point * 17 - 55);
        const y = Math.sin(pulse + point * 1.7 + stream * 1.4) * (8 + intensity * 3) + (stream - 1.5) * 11;
        if (point === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBallSignature(visualBall) {
    const curvePower = visualBall.curveShotPower ?? ball.curveShotPower;
    const knucklePower = visualBall.knuckleballPower ?? ball.knuckleballPower;
    if (!curvePower && !knucklePower) return;
    const angle = Math.atan2(visualBall.vy, visualBall.vx);
    const pulse = performance.now() / 70;
    ctx.save();
    ctx.translate(visualBall.x, visualBall.y);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = "lighter";
    if (curvePower) {
      ctx.globalAlpha = .8;
      ctx.strokeStyle = "#8fffd4";
      ctx.shadowColor = "#45ffc0";
      ctx.shadowBlur = 18;
      ctx.lineWidth = 2 + curvePower;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse(-13, Math.sin(pulse + i) * 5, 23 + i * 9, 10 + i * 5, Math.sin(pulse * .35 + i) * .55, -.95, .95);
        ctx.stroke();
      }
    }
    if (knucklePower) {
      ctx.globalAlpha = .88;
      ctx.strokeStyle = "#ffe28f";
      ctx.shadowColor = "#ffc95b";
      ctx.shadowBlur = 16;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        const side = i % 2 ? -1 : 1;
        const wobble = Math.sin(pulse * 1.7 + i * 2) * 9;
        ctx.beginPath();
        ctx.moveTo(-8, side * 5);
        ctx.lineTo(-22 - i * 5, side * (17 + wobble));
        ctx.lineTo(-36 - i * 8, -side * (12 + wobble));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawSignatureImpact(impact, progress, intensity) {
    const pulse = performance.now() / 90;
    const radius = 62 + Math.min(28, impact.combo * 1.3) + Math.sin(pulse) * 5;
    const x = Math.max(150, Math.min(WIDTH - 150, impact.x + (impact.side === "player" ? 58 : -58)));
    const y = Math.max(130, Math.min(HEIGHT - 130, impact.y));
    ctx.save();
    ctx.translate(x, y);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 3;

    if (impact.style === "spirit-bomb") {
      const bombY = -radius * 1.08 - Math.sin(pulse * .7) * 7;
      const bombRadius = radius * 1.18;
      const bomb = ctx.createRadialGradient(-bombRadius * .32, bombY - bombRadius * .38, 2, 0, bombY, bombRadius);
      bomb.addColorStop(0, `rgba(255,255,255,${.98 * progress})`);
      bomb.addColorStop(.18, `rgba(226,255,255,${.96 * progress})`);
      bomb.addColorStop(.5, `rgba(112,202,255,${.9 * progress})`);
      bomb.addColorStop(.82, `rgba(61,107,255,${.78 * progress})`);
      bomb.addColorStop(1, "rgba(71,105,255,0)");
      ctx.shadowColor = "#75dfff";
      ctx.shadowBlur = 42;
      ctx.fillStyle = bomb;
      ctx.beginPath();
      ctx.arc(0, bombY, bombRadius, 0, Math.PI * 2);
      ctx.fill();
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.globalAlpha = progress * (.9 - ring * .2);
        ctx.strokeStyle = ring === 0 ? "#ffffff" : "#a5eaff";
        ctx.lineWidth = 2.5 - ring * .45;
        ctx.beginPath();
        ctx.arc(0, bombY, bombRadius * (.64 + ring * .12) + Math.sin(pulse + ring) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = progress;
      ctx.strokeStyle = "rgba(225,250,255,.86)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, bombY + bombRadius * .7);
      ctx.lineTo(0, bombY + bombRadius + 60);
      ctx.stroke();
      for (let i = 0; i < Math.min(18, 8 + impact.combo); i += 1) {
        const angle = pulse * .35 + i * Math.PI * 2 / Math.min(18, 8 + impact.combo);
        const orbit = bombRadius * (1.12 + (i % 3) * .12);
        ctx.globalAlpha = progress * .8;
        ctx.fillStyle = i % 3 === 0 ? "#ffffff" : "#8eeaff";
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * orbit, bombY + Math.sin(angle) * orbit, 2.5 + i % 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (impact.style === "rasengan") {
      const orbRadius = radius * 1.08;
      ctx.strokeStyle = `rgba(110,222,255,${.48 * progress})`;
      ctx.shadowColor = "#75dfff";
      ctx.shadowBlur = 32;
      ctx.lineWidth = 6;
      for (let i = 0; i < 8; i += 1) {
        const angle = pulse * .22 + i * Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(angle) * radius * 2.5, -Math.sin(angle) * radius * 2.5);
        ctx.quadraticCurveTo(Math.cos(angle + .65) * radius * 1.35, Math.sin(angle + .65) * radius * 1.35, Math.cos(angle) * orbRadius * .65, Math.sin(angle) * orbRadius * .65);
        ctx.stroke();
      }
      const orb = ctx.createRadialGradient(-orbRadius * .32, -orbRadius * .35, 1, 0, 0, orbRadius);
      orb.addColorStop(0, `rgba(255,255,255,${1 * progress})`);
      orb.addColorStop(.18, `rgba(217,255,255,${.98 * progress})`);
      orb.addColorStop(.42, `rgba(95,218,255,${.98 * progress})`);
      orb.addColorStop(.78, `rgba(31,125,255,${.88 * progress})`);
      orb.addColorStop(1, "rgba(53,111,255,0)");
      ctx.shadowColor = "#5cceff";
      ctx.shadowBlur = 48;
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 12; i += 1) {
        const start = pulse * (i % 2 ? 1 : -1) * 1.4 + i * Math.PI * 2 / 12;
        ctx.globalAlpha = progress * (.96 - i * .035);
        ctx.strokeStyle = i % 2 ? "#ffffff" : "#a5f3ff";
        ctx.lineWidth = 2.3 + intensity * .55;
        ctx.beginPath();
        ctx.arc(0, 0, orbRadius * (.32 + (i % 4) * .15), start, start + Math.PI * 1.18);
        ctx.stroke();
      }
      ctx.globalAlpha = progress;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, orbRadius * .22, pulse, pulse + Math.PI * 1.65);
      ctx.stroke();
    } else {
      const holeRadius = radius * .78;
      ctx.shadowColor = "#b77aff";
      ctx.shadowBlur = 38 + intensity * 8;
      for (let i = 0; i < 7; i += 1) {
        ctx.globalAlpha = progress * (.92 - i * .08);
        ctx.strokeStyle = i % 2 ? "#c297ff" : "#81f1ff";
        ctx.lineWidth = 4.5 - i * .4;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * (1.25 + i * .17), radius * (.34 + i * .075), pulse * .32 + i * .12, pulse + i * .25, pulse + Math.PI * 1.72 + i * .2);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
      const core = ctx.createRadialGradient(-holeRadius * .16, -holeRadius * .22, 1, 0, 0, holeRadius);
      core.addColorStop(0, "#000000");
      core.addColorStop(.8, "#02010a");
      core.addColorStop(1, "rgba(21,8,39,.3)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, holeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = progress;
      ctx.strokeStyle = "#fff0ff";
      ctx.shadowColor = "#bd74ff";
      ctx.shadowBlur = 22;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.28, radius * .31, pulse * .32, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPowerReveal() {
    const power = run.powerReveal;
    if (!power) return;
    const progress = Math.max(0, power.life / power.maxLife);
    const elapsed = 1 - progress;
    const radius = 24 + elapsed * 120;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.globalAlpha = Math.min(1, progress * 1.5);
    ctx.strokeStyle = power.color;
    ctx.shadowColor = power.color;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const ring = radius + i * 17;
      ctx.globalAlpha = progress * (.85 - i * .13);
      if (power.shape === "shield") {
        ctx.beginPath();
        ctx.arc(0, 0, ring, Math.PI * .14, Math.PI * .86);
        ctx.arc(0, 0, ring, Math.PI * 1.14, Math.PI * 1.86);
      } else if (power.shape === "guardian") {
        ctx.beginPath();
        for (let point = 0; point <= 6; point += 1) {
          const angle = -Math.PI / 2 + point * Math.PI / 3 + elapsed * .35;
          const x = Math.cos(angle) * ring;
          const y = Math.sin(angle) * ring;
          if (point === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (power.shape === "comet") {
        ctx.beginPath();
        ctx.ellipse(0, 0, ring * 1.45, ring * .4, elapsed * 3 + i * .16, 0, Math.PI * 2);
      } else if (power.shape === "wave") {
        ctx.beginPath();
        ctx.ellipse(0, 0, ring * 1.45, ring * .54, Math.sin(elapsed * 8 + i) * .45, 0, Math.PI * 2);
      } else {
        ctx.beginPath();
        const start = power.shape === "clock" ? elapsed * Math.PI * 2 + i * .16 : 0;
        const end = power.shape === "clock" ? start + Math.PI * 1.45 : Math.PI * 2;
        ctx.arc(0, 0, ring, start, end);
      }
      ctx.stroke();
    }
    const orbitCount = power.shape === "nova" ? 12 : power.shape === "titan" ? 8 : 5;
    for (let i = 0; i < orbitCount; i += 1) {
      const orbit = radius + 15 + (i % 3) * 12;
      const angle = elapsed * (power.shape === "clock" ? -3 : 2) + i * Math.PI * 2 / orbitCount;
      ctx.globalAlpha = progress * .9;
      ctx.fillStyle = i % 3 === 0 ? "#fff8df" : power.color;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * orbit, Math.sin(angle) * orbit, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = progress;
    ctx.fillStyle = "#f4f6ea";
    ctx.shadowBlur = 30;
    ctx.font = "900 54px 'Barlow Condensed', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(power.symbol, 0, -6);
    ctx.font = "700 14px 'DM Mono', monospace";
    ctx.fillStyle = power.color;
    ctx.fillText(`AWAKENED: ${power.title}`, 0, 79);
    ctx.restore();
  }

  function drawEnergyBeam(x, y, angle, progress, color = "#aafcff", intensity = 1) {
    const length = WIDTH * 1.45;
    const pulse = 1 + Math.sin(performance.now() / 28) * .1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = "lighter";

    const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 115 * pulse);
    aura.addColorStop(0, `rgba(255, 255, 255, ${.86 * progress})`);
    aura.addColorStop(.18, `rgba(137, 255, 255, ${.72 * progress})`);
    aura.addColorStop(.55, `rgba(103, 154, 255, ${.29 * progress})`);
    aura.addColorStop(1, "rgba(103, 154, 255, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 115 * pulse, 0, Math.PI * 2);
    ctx.fill();

    const beam = ctx.createLinearGradient(0, 0, length, 0);
    beam.addColorStop(0, `rgba(255, 255, 255, ${.98 * progress})`);
    beam.addColorStop(.12, `rgba(165, 255, 255, ${.92 * progress})`);
    beam.addColorStop(.5, `rgba(104, 180, 255, ${.75 * progress})`);
    beam.addColorStop(1, "rgba(150, 109, 255, 0)");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = beam;
    ctx.shadowColor = color;
    ctx.shadowBlur = 54 * progress;
    ctx.lineWidth = 35 * pulse * intensity;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.bezierCurveTo(length * .32, -waveOffset(progress), length * .7, waveOffset(progress), length, 0);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${.96 * progress})`;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 30 * progress;
    ctx.lineWidth = 10 * pulse;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.bezierCurveTo(length * .32, -waveOffset(progress) * .24, length * .7, waveOffset(progress) * .24, length, 0);
    ctx.stroke();

    for (const [orbX, orbRadius] of [[3, 38], [length * .96, 26]]) {
      const orb = ctx.createRadialGradient(orbX, 0, 1, orbX, 0, orbRadius * pulse);
      orb.addColorStop(0, `rgba(255, 255, 255, ${.98 * progress})`);
      orb.addColorStop(.3, `rgba(164, 255, 255, ${.88 * progress})`);
      orb.addColorStop(.65, `rgba(119, 179, 255, ${.48 * progress})`);
      orb.addColorStop(1, "rgba(131, 161, 255, 0)");
      ctx.fillStyle = orb;
      ctx.shadowColor = color;
      ctx.shadowBlur = 26 * progress;
      ctx.beginPath();
      ctx.arc(orbX, 0, orbRadius * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 5; i += 1) {
      const wave = Math.sin(performance.now() / (23 + i * 4) + i * 1.9);
      ctx.globalAlpha = progress * (.3 + i * .075);
      ctx.strokeStyle = i % 2 ? "#d6baff" : "#f5ffff";
      ctx.lineWidth = (1.3 + i * .7) * pulse;
      ctx.beginPath();
      ctx.moveTo(5, wave * (9 + i * 4));
      ctx.bezierCurveTo(length * .3, -wave * 20, length * .62, wave * 24, length, wave * (i + 2));
      ctx.stroke();
    }
    ctx.restore();
  }

  function waveOffset(progress) {
    return Math.sin(performance.now() / 30) * (13 + progress * 19);
  }

  function drawComboCounter() {
    if (run.rally < 3) return;
    const pulse = 1 + Math.sin(performance.now() / 85) * .055;
    const width = 176;
    const height = 35;
    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT - 40);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = "#d2ff54";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "rgba(9, 13, 15, .9)";
    roundRect(-width / 2, -height / 2, width, height, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(210, 255, 84, .8)";
    ctx.lineWidth = 1;
    roundRect(-width / 2, -height / 2, width, height, 4);
    ctx.stroke();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#d2ff54";
    ctx.font = "700 20px 'Barlow Condensed', Impact, sans-serif";
    ctx.fillText(String(run.rally).padStart(2, "0"), -54, 0);
    ctx.fillStyle = "#f2f0e9";
    ctx.font = "500 10px 'DM Mono', monospace";
    ctx.fillText("HIT COMBO", 22, 0);
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const particle of particles) {
      const progress = Math.max(0, particle.life / particle.maxLife);
      ctx.globalAlpha = progress * progress;
      ctx.strokeStyle = particle.color;
      ctx.fillStyle = particle.color;
      if (particle.kind === "ring" || particle.kind === "ripple") {
        ctx.lineWidth = Math.max(.5, particle.lineWidth * progress);
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.kind === "ripple" ? 16 : 9;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (particle.kind === "orb") {
        const orb = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * progress
        );
        orb.addColorStop(0, "#ffffff");
        orb.addColorStop(.22, particle.color);
        orb.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * progress, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.lineWidth = Math.max(.8, particle.size * progress);
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = progress * .9;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * progress, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function frame(time) {
    const dt = run.lastTime ? Math.min(.034, (time - run.lastTime) / 1000) : 0;
    run.lastTime = time;
    update(dt);
    draw();
    window.requestAnimationFrame(frame);
  }

  function movePointer(event) {
    const bounds = canvas.getBoundingClientRect();
    player.targetY = ((event.clientY - bounds.top) / bounds.height) * HEIGHT;
  }

  mainButton.addEventListener("click", () => {
    selectedStartLevel = 1;
    run.mode = "upgrades";
    overlay.classList.add("is-transparent");
    renderUpgradeChoices(true);
    upgradeModal.hidden = false;
  });
  levelSelectButton.addEventListener("click", openLevelSelect);
  levelSelectClose.addEventListener("click", () => {
    levelSelectModal.hidden = true;
    levelSelectButton.focus();
  });
  canvas.addEventListener("pointermove", movePointer);
  canvas.addEventListener("pointerdown", movePointer);
  canvas.addEventListener("pointerleave", () => { player.targetY = player.y; });
  pauseButton.addEventListener("click", () => togglePause());
  soundButton.addEventListener("click", () => {
    run.soundOn = !run.soundOn;
    document.querySelector("#sound-label").textContent = run.soundOn ? "SOUND ON" : "SOUND OFF";
    document.querySelector("#sound-icon").textContent = run.soundOn ? "♫" : "♪";
    soundButton.setAttribute("aria-label", run.soundOn ? "Turn sound off" : "Turn sound on");
    if (run.soundOn) enableAudio();
  });

  function togglePause() {
    if (run.mode === "playing") {
      run.mode = "paused";
      pauseIndicator.hidden = false;
      setStatus("RUN PAUSED");
    } else if (run.mode === "paused") {
      run.mode = "playing";
      pauseIndicator.hidden = true;
      run.lastTime = 0;
      setStatus("RALLY IN PROGRESS", "live");
    }
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", " "].includes(key)) event.preventDefault();
    if (key === "e" && !event.repeat) {
      activateRiftBreak();
      return;
    }
    if (key === " " && !event.repeat) {
      togglePause();
      return;
    }
    if (!event.repeat && ["arrowup", "w", "arrowdown", "s"].includes(key)) {
      const direction = key === "arrowup" || key === "w" ? -1 : 1;
      const now = performance.now();
      if (run.lastDirectionTap?.direction === direction && now - run.lastDirectionTap.time <= 320) {
        triggerFlashStep(direction);
        run.lastDirectionTap = null;
      } else {
        run.lastDirectionTap = { direction, time: now };
      }
    }
    if (["arrowup", "arrowdown", "w", "s"].includes(key)) keys.add(key);
  });
  window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener("blur", () => {
    keys.clear();
    run.lastDirectionTap = null;
  });

  run.mode = "menu";
  prepareLevel();
  document.querySelector("#opponent-name").textContent = "THE WARMUP";
  document.querySelector("#boss-preview-copy").innerHTML = "A boss waits at every<br>5th level.";
  overlay.classList.remove("is-transparent");
  upgradeModal.hidden = true;
  window.requestAnimationFrame(frame);
})();