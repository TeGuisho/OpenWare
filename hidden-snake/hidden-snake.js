/* ===================== CONSTANTES & ETAT GLOBAL ===================== */

const canvas = document.getElementById("hidden-snake-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("hs-score");
const bestEl = document.getElementById("hs-best");
const restartBtn = document.getElementById("hs-restart-btn");
const pauseBtn = document.getElementById("hs-pause-btn");

const gridSize = 21;
const tileSize = canvas.width / gridSize;

let snake = [];
let direction = { x: 1, y: 0 };
let inputQueue = [];
let foods = [];
let score = 0;
let cumulativeScore = 0;
let best = Number(localStorage.getItem("hs-best-score") || 0);
let baseTickMs = 120;
let displayedSpeed = 1;
let tickMs = baseTickMs;
let timerId = null;
let gameState = "ready";
let readyAnimationId = null;

let ambientMessage = null;
let effectChromaticUntil = 0;
let effectMirrorUntil = 0;
let effectFakeGlitchUntil = 0;
let weirdEntities = [];

let glitchBursts = [];
let floatingTexts = [];

let catOverlayEl = document.getElementById("hs-cat-overlay");
let catOverlayTimerId = null;
let catFollowActive = false;
let catFollowUntil = 0;

/* emojis qui passent devant le jeu (chat très fréquent, autres plus rares) */
const CAT_OVERLAY_EMOJIS = [
  { symbol: "🐱", weight: 40 },
  { symbol: "🐈‍⬛", weight: 20 },
  { symbol: "😼", weight: 10 },
  { symbol: "🦊", weight: 8 },
  { symbol: "👻", weight: 6 },
  { symbol: "👽", weight: 5 },
  { symbol: "🛸", weight: 4 },
  { symbol: "🧠", weight: 3 },
  { symbol: "🌀", weight: 2 },
  { symbol: "🐍", weight: 2 }
];

bestEl.textContent = best.toString();

/* ===================== MESSAGES ===================== */

const AMBIENT_MESSAGES = [
    "Signal parasite détecté...",
    "Le serpent entre en phase quantique.",
    "Anomalie de trajectoire évitée de justesse.",
    "Flux de données saturé, tiens bon.",
    "Echo lumineux dans la nuit numérique.",
    "Tu es observé... mais par qui ?"
];

const FLOATING_TEXTS = [
    "404",
    "ping...",
    "???",
    "Nuit ∞",
    "glitch()",
    "snake.exe",
    "erreur douce",
    "no signal",
    "wake up",
    "sync..."
];

/* ===================== INIT & RESET ===================== */

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    inputQueue = [];
    score = 0;
    cumulativeScore = 0;
    displayedSpeed = 1;
    document.getElementById("hs-speed").textContent = displayedSpeed.toString();
    tickMs = baseTickMs;
    scoreEl.textContent = score.toString();
    foods = [];
    ambientMessage = null;
    effectChromaticUntil = 0;
    effectMirrorUntil = 0;
    effectFakeGlitchUntil = 0;
    weirdEntity = [];
    glitchBursts = [];
    floatingTexts = [];

    catFollowActive = false;
    catFollowUntil = 0;
    if (catOverlayEl) {
        catOverlayEl.style.opacity = "0";
    }

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }

    spawnNormalAndSpecialFoods();

    gameState = "ready";

    draw();

    if (readyAnimationId) cancelAnimationFrame(readyAnimationId);
    readyAnimationId = requestAnimationFrame(drawReady);
}

/* ===================== FOOD & CASES LIBRES ===================== */

function getFreeCells() {
    const occupied = new Set();
    for (let i = 0; i < snake.length; i++) {
        const seg = snake[i];
        occupied.add(seg.x + "," + seg.y);
    }
    for (let j = 0; j < foods.length; j++) {
        const f = foods[j];
        occupied.add(f.x + "," + f.y);
    }

    const free = [];
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const key = x + "," + y;
            if (!occupied.has(key)) {
                free.push({ x, y });
            }
        }
    }
    return free;
}

function spawnNormalAndSpecialFoods() {
    const free = getFreeCells();
    foods = [];
    if (free.length === 0) {
        return;
    }

    const indexNormal = Math.floor(Math.random() * free.length);
    const normalCell = free.splice(indexNormal, 1)[0];
    foods.push({
        x: normalCell.x,
        y: normalCell.y,
        type: "normal"
    });

    if (free.length === 0) {
        return;
    }

    const roll = Math.random();

    if (roll < 0.1) {
        const indexGold = Math.floor(Math.random() * free.length);
        const goldCell = free.splice(indexGold, 1)[0];
        foods.push({
            x: goldCell.x,
            y: goldCell.y,
            type: "gold"
        });
    } else if (roll < 0.2) {
        const indexFake = Math.floor(Math.random() * free.length);
        const fakeCell = free.splice(indexFake, 1)[0];
        foods.push({
            x: fakeCell.x,
            y: fakeCell.y,
            type: "fake"
        });
    }
}

/* ===================== BOUCLE DE JEU ===================== */

function startLoop() {
    if (readyAnimationId) {
        cancelAnimationFrame(readyAnimationId);
        readyAnimationId = null;
    }

    if (timerId) clearInterval(timerId);
    timerId = setInterval(tick, tickMs);
    gameState = "running";
    pauseBtn.textContent = "Pause";
}

function pauseGame() {
    if (gameState === "running") {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        gameState = "paused";
        pauseBtn.textContent = "Reprendre";
        draw();
    } else if (gameState === "paused") {
        startLoop();
    }
}

function gameOver() {
    gameState = "over";
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }

    ctx.save();
    ctx.fillStyle = "rgba(5, 8, 22, 0.78)";
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
    ctx.fillStyle = "#ec5b5b";
    ctx.font = "bold 20px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
        "Game Over – Espace pour rejouer",
        canvas.width / 2,
        canvas.height / 2
    );
    ctx.restore();
}

function enqueueDirection(newDir) {
    const lastDir = inputQueue.length > 0
        ? inputQueue[inputQueue.length - 1]
        : direction;

    const isOpposite = newDir.x === -lastDir.x && newDir.y === -lastDir.y;
    if (isOpposite) return;

    if (inputQueue.length >= 3) return;

    inputQueue.push(newDir);
}

/* ===================== TRIGGERS ET EFFETS ===================== */

function maybeTriggerAmbientMessage() {
    if (ambientMessage) return;
    if (Math.random() < 0.15) {
        const text = AMBIENT_MESSAGES[
            Math.floor(Math.random() * AMBIENT_MESSAGES.length)
            ];
        ambientMessage = {
            text: text,
            start: Date.now(),
            duration: 2600
        };
    }
}

function maybeTriggerWeirdEntity() {
    var now = Date.now();
    var roll = Math.random();

    if (roll < 0.35) {
        var type;
        var r = Math.random();
        if (r < 0.33) {
            type = "eye";
        } else if (r < 0.66) {
            type = "cat";
        } else {
            type = "ghost";
        }

        var yRandom = canvas.height * (0.2 + 0.6 * Math.random());
        var entity = {
            type: type,
            start: now,
            duration: 2600,
            y: yRandom
        };
        weirdEntities.push(entity);

        if (!ambientMessage) {
            ambientMessage = {
                text: "Quelque chose traverse le système.",
                start: now,
                duration: 2400
            };
        }
    }
}

function spawnGlitchBurst() {
    glitchBursts.push({
        start: Date.now(),
        duration: 800,
        x: Math.random() * canvas.width,
        width: 20 + Math.random() * 40
    });
}

function spawnFloatingText() {
    const text = FLOATING_TEXTS[
        Math.floor(Math.random() * FLOATING_TEXTS.length)
        ];
    floatingTexts.push({
        text: text,
        start: Date.now(),
        duration: 1800,
        x: 40 + Math.random() * (canvas.width - 80),
        yStart: canvas.height * (0.3 + 0.4 * Math.random())
    });
}

function maybeExtraWeirdStuffOnEat() {
    if (Math.random() < 0.5) {
        spawnGlitchBurst();
    }
    if (Math.random() < 0.4) {
        spawnFloatingText();
    }
}

/* ===================== CHAT OVERLAY RANDOM ===================== */

function scheduleCatOverlay() {
    if (!catOverlayEl) return;

    var delay = 4000 + Math.random() * 10000;

    if (catOverlayTimerId) {
        clearTimeout(catOverlayTimerId);
    }

    catOverlayTimerId = setTimeout(function () {
        if (!catOverlayEl) return;

        var chosen = pickWeightedEmoji();
        catOverlayEl.textContent = chosen.symbol;

        var fromRight = Math.random() < 0.5;
        if (fromRight) {
            catOverlayEl.classList.add("hs-cat-right");
        } else {
            catOverlayEl.classList.remove("hs-cat-right");
        }

        var canFollow =
            gameState === "running" &&
            snake.length > 2 &&
            (chosen.symbol === "🐱" || chosen.symbol === "🐈‍⬛") &&
            Math.random() < 0.6;

        if (canFollow) {
            catFollowActive = true;
            catFollowUntil = Date.now() + 3000;
            catOverlayEl.classList.remove("hs-cat-anim");
            catOverlayEl.style.opacity = "1";

            setTimeout(function () {
                catFollowActive = false;
                if (catOverlayEl) {
                    catOverlayEl.style.opacity = "0";
                }
                scheduleCatOverlay();
            }, 3100);
        } else {
            catOverlayEl.classList.add("hs-cat-anim");
            setTimeout(function () {
                if (!catOverlayEl) return;
                catOverlayEl.classList.remove("hs-cat-anim");
                catOverlayEl.style.opacity = "0";
                scheduleCatOverlay();
            }, 4000);
        }
    }, delay);
}

function updateCatFollower(now) {
    if (!catFollowActive || !catOverlayEl) return;
    if (now > catFollowUntil) return;
    if (!snake || snake.length === 0) return;

    var card = document.querySelector(".hs-card");
    if (!card) return;

    var cardRect = card.getBoundingClientRect();
    var canvasRect = canvas.getBoundingClientRect();
    var head = snake[0];

    var cx = canvasRect.left - cardRect.left + head.x * tileSize + tileSize / 2;
    var cy = canvasRect.top - cardRect.top + head.y * tileSize + tileSize / 2;

    catOverlayEl.style.left = cx - 14 + "px";
    catOverlayEl.style.top = cy - 14 + "px";
    catOverlayEl.style.opacity = "1";
}

function pickWeightedEmoji() {
    var total = 0;
    for (var i = 0; i < CAT_OVERLAY_EMOJIS.length; i++) {
        total += CAT_OVERLAY_EMOJIS[i].weight;
    }
    var r = Math.random() * total;
    for (var j = 0; j < CAT_OVERLAY_EMOJIS.length; j++) {
        var item = CAT_OVERLAY_EMOJIS[j];
        if (r < item.weight) return item;
        r -= item.weight;
    }
    return CAT_OVERLAY_EMOJIS[0];
}

/* ===================== TICK ===================== */

function tick() {
    if (gameState !== "running") return;

    if (inputQueue.length > 0) {
        direction = inputQueue.shift();
    }

    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    if (
        newHead.x < 0 ||
        newHead.x >= gridSize ||
        newHead.y < 0 ||
        newHead.y >= gridSize
    ) {
        gameOver();
        return;
    }

    for (let i = 0; i < snake.length; i++) {
        const seg = snake[i];
        if (seg.x === newHead.x && seg.y === newHead.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(newHead);

    let ateNormalOrGold = false;
    let now = Date.now();
    let newFoods = [];

    for (let i = 0; i < foods.length; i++) {
        const f = foods[i];
        if (f.x === newHead.x && f.y === newHead.y) {
            if (f.type === "fake") {
                effectFakeGlitchUntil = now + 900;
                effectMirrorUntil = now + 2600;
                ambientMessage = {
                    text: "Le fruit était... faux.",
                    start: now,
                    duration: 2400
                };
                newFoods = foods.filter(function (ff, idx) { return idx !== i; });
                maybeTriggerWeirdEntity();
                spawnGlitchBurst();
            } else if (f.type === "gold") {
                score += 5;
                cumulativeScore += 5;
                scoreEl.textContent = score.toString();
                if (score > best) {
                    best = score;
                    localStorage.setItem("hs-best-score", String(best));
                    bestEl.textContent = best.toString();
                }
                effectChromaticUntil = now + 2600;
                ambientMessage = {
                    text: "Instant doré capturé.",
                    start: now,
                    duration: 2600
                };
                ateNormalOrGold = true;
                newFoods = foods.filter(function (ff, idx) { return idx !== i; });
                maybeTriggerWeirdEntity();
                spawnGlitchBurst();
                spawnFloatingText();
            } else {
                score += 1;
                cumulativeScore += 1;
                scoreEl.textContent = score.toString();
                if (score > best) {
                    best = score;
                    localStorage.setItem("hs-best-score", String(best));
                    bestEl.textContent = best.toString();
                }
                maybeTriggerAmbientMessage();
                maybeTriggerWeirdEntity();
                ateNormalOrGold = true;
                newFoods = foods.filter(function (ff, idx) { return idx !== i; });
                maybeExtraWeirdStuffOnEat();
            }
            break;
        }
    }

    if (!ateNormalOrGold && newFoods.length === 0) {
        snake.pop();
    } else if (ateNormalOrGold) {
        foods = newFoods;
        spawnNormalAndSpecialFoods();

        if (cumulativeScore >= 5 && tickMs > 70) {
            displayedSpeed += 1;
            document.getElementById("hs-speed").textContent = displayedSpeed.toString();
            tickMs -= 8;
            cumulativeScore -= 5;
            startLoop();
        }
    }

    if (Math.random() < 0.08) {
        spawnFloatingText();
    }
    if (Math.random() < 0.06) {
        spawnGlitchBurst();
    }

    draw();
}

/* ===================== DESSIN ===================== */

function draw() {
    const now = Date.now();
    const chromaticActive = now < effectChromaticUntil;
    const mirrorActive = now < effectMirrorUntil;
    const fakeGlitchActive = now < effectFakeGlitchUntil;
    const overdrive = score >= 15;updateCatFollower(now);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "#050816";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(120,255,200,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i < gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
    }

    for (let i = 0; i < foods.length; i++) {
        const f = foods[i];
        const fx = f.x * tileSize;
        const fy = f.y * tileSize;
        const cx = fx + tileSize / 2;
        const cy = fy + tileSize / 2;
        const radius = tileSize * 0.35;

        ctx.save();

        let gradient = ctx.createRadialGradient(
            cx, cy, radius * 0.2,
            cx, cy, radius
        );

        if (f.type === "gold") {
            gradient.addColorStop(0, "#ffeaa7");
            gradient.addColorStop(1, "#fdcb6e");
            ctx.fillStyle = gradient;
            ctx.shadowColor = "rgba(255, 234, 167, 0.95)";
            ctx.shadowBlur = 22;
        } else if (f.type === "fake") {
            gradient.addColorStop(0, "#a29bfe");
            gradient.addColorStop(1, "#6c5ce7");
            ctx.fillStyle = gradient;
            ctx.shadowColor = "rgba(162, 155, 254, 0.9)";
            ctx.shadowBlur = 18;
        } else {
            gradient.addColorStop(0, "#ffdf6b");
            gradient.addColorStop(1, "#ff6b6b");
            ctx.fillStyle = gradient;
            ctx.shadowColor = "rgba(255, 219, 128, 0.9)";
            ctx.shadowBlur = 18;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    for (let i = 0; i < snake.length; i++) {
        const seg = snake[i];
        const x = seg.x * tileSize;
        const y = seg.y * tileSize;

        const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
        if (i === 0) {
            if (overdrive) {
                grad.addColorStop(0, "#ff9ff3");
                grad.addColorStop(1, "#feca57");
            } else {
                grad.addColorStop(0, "#74ffa9");
                grad.addColorStop(1, "#21c98f");
            }
        } else {
            if (overdrive) {
                grad.addColorStop(0, "#54a0ff");
                grad.addColorStop(1, "#1dd1a1");
            } else {
                grad.addColorStop(0, "#19b4ff");
                grad.addColorStop(1, "#39f4c5");
            }
        }

        ctx.save();
        ctx.fillStyle = grad;
        ctx.shadowColor = i === 0
            ? "rgba(116,255,169,0.9)"
            : "rgba(57,244,197,0.8)";
        ctx.shadowBlur = i === 0 ? 20 : 12;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, tileSize - 4, tileSize - 4, 6);
        ctx.fill();
        ctx.restore();
    }

    if (ambientMessage) {
        const elapsed = now - ambientMessage.start;
        const t = Math.min(1, elapsed / ambientMessage.duration);
        if (elapsed > ambientMessage.duration) {
            ambientMessage = null;
        } else {
            const alphaBase = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
            const alpha = alphaBase * 0.9;

            ctx.save();
            ctx.fillStyle = "rgba(5, 8, 22, 0.52)";
            ctx.fillRect(0, 0, canvas.width, 32);
            ctx.fillStyle = "rgba(144, 203, 255," + alpha + ")";
            ctx.font = "italic 13px system-ui";
            ctx.textAlign = "center";
            ctx.fillText(ambientMessage.text, canvas.width / 2, 21);
            ctx.restore();
        }
    }

    var newWeird = [];

    for (var i = 0; i < weirdEntities.length; i++) {
        var e = weirdEntities[i];
        var t = (now - e.start) / e.duration;
        if (t >= 1) {
            continue;
        }

        if (e.type === "eye") {
            var xEye = -80 + t * (canvas.width + 160);
            var yEye = e.y;
            var rEye = 26;

            ctx.save();
            ctx.globalAlpha = 0.9;
            var eyeGradient = ctx.createRadialGradient(
                xEye, yEye, rEye * 0.2,
                xEye, yEye, rEye
            );
            eyeGradient.addColorStop(0, "rgba(255,255,255,0.95)");
            eyeGradient.addColorStop(1, "rgba(150,200,255,0.05)");
            ctx.fillStyle = eyeGradient;
            ctx.shadowColor = "rgba(150,200,255,0.9)";
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(xEye, yEye, rEye, 0, Math.PI * 2);
            ctx.fill();

            var pupilREye = rEye * 0.35;
            ctx.fillStyle = "rgba(40, 60, 120, 1)";
            ctx.beginPath();
            ctx.arc(xEye, yEye, pupilREye, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.beginPath();
            ctx.arc(
                xEye + pupilREye * 0.4,
                yEye - pupilREye * 0.4,
                pupilREye * 0.35,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
        } else if (e.type === "cat") {
            var xCat = canvas.width * (0.2 + 0.6 * Math.sin(t * Math.PI * 2));
            var yCat = -50 + t * (canvas.height + 100);

            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.beginPath();
            ctx.roundRect(xCat - 18, yCat - 12, 36, 24, 8);
            ctx.fill();

            ctx.fillStyle = "rgba(60, 60, 120, 1)";
            ctx.font = "12px system-ui";
            ctx.textAlign = "center";
            ctx.fillText("=^.^=", xCat, yCat + 4);
            ctx.restore();
        } else if (e.type === "ghost") {
            var xGhost = -40 + t * (canvas.width + 80);
            var yGhost = canvas.height * 0.2 + Math.sin(t * Math.PI * 3) * 40;
            var rGhost = 18;

            ctx.save();
            ctx.globalAlpha = 0.85;
            var ghostGradient = ctx.createRadialGradient(
                xGhost, yGhost, rGhost * 0.2,
                xGhost, yGhost, rGhost
            );
            ghostGradient.addColorStop(0, "rgba(255,255,255,0.98)");
            ghostGradient.addColorStop(1, "rgba(180,180,255,0.05)");
            ctx.fillStyle = ghostGradient;
            ctx.shadowColor = "rgba(180,180,255,0.85)";
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.arc(xGhost, yGhost, rGhost, Math.PI, Math.PI * 2);
            ctx.lineTo(xGhost + rGhost, yGhost + rGhost);
            ctx.lineTo(xGhost - rGhost, yGhost + rGhost);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(40, 50, 120, 1)";
            ctx.beginPath();
            ctx.arc(xGhost - 6, yGhost - 2, 2.5, 0, Math.PI * 2);
            ctx.arc(xGhost + 6, yGhost - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        newWeird.push(e);
    }
    weirdEntities = newWeird;

    const newGlitchBursts = [];
    for (let i = 0; i < glitchBursts.length; i++) {
        const g = glitchBursts[i];
        const elapsed = now - g.start;
        const t = elapsed / g.duration;
        if (t >= 1) continue;
        const alpha = 0.18 * (1 - t);
        ctx.save();
        ctx.fillStyle = "rgba(80,250,200," + alpha + ")";
        ctx.fillRect(g.x, 0, g.width, canvas.height);
        ctx.restore();
        newGlitchBursts.push(g);
    }
    glitchBursts = newGlitchBursts;

    const newFloatingTexts = [];
    for (let i = 0; i < floatingTexts.length; i++) {
        const ft = floatingTexts[i];
        const elapsed = now - ft.start;
        const t = elapsed / ft.duration;
        if (t >= 1) continue;
        const y = ft.yStart - t * 35;
        const alpha = 0.8 * (1 - t);
        ctx.save();
        ctx.fillStyle = "rgba(200,220,255," + alpha + ")";
        ctx.font = "11px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, y);
        ctx.restore();
        newFloatingTexts.push(ft);
    }
    floatingTexts = newFloatingTexts;

    if (chromaticActive || fakeGlitchActive) {
        ctx.save();
        ctx.globalAlpha = chromaticActive ? 0.22 : 0.16;
        ctx.globalCompositeOperation = "screen";
        const gradOverlay = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (chromaticActive) {
            gradOverlay.addColorStop(0, "rgba(80,250,123,0.8)");
            gradOverlay.addColorStop(1, "rgba(10,132,255,0.8)");
        } else {
            gradOverlay.addColorStop(0, "rgba(255,118,117,0.7)");
            gradOverlay.addColorStop(1, "rgba(9,132,227,0.7)");
        }
        ctx.fillStyle = gradOverlay;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    if (fakeGlitchActive) {
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.09)";
        for (let i = 0; i < 5; i++) {
            const y = Math.random() * canvas.height;
            ctx.fillRect(0, y, canvas.width, 1);
        }
        ctx.restore();
    }

    if (mirrorActive) {
        ctx.save();
        ctx.fillStyle = "rgba(5,8,22,0.7)";
        ctx.fillRect(0, canvas.height - 34, canvas.width, 34);
        ctx.fillStyle = "#ffeaa7";
        ctx.font = "bold 13px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(
            "CONTROLES MIROIR ACTIFS",
            canvas.width / 2,
            canvas.height - 14
        );
        ctx.restore();
    }

    if (gameState === "paused") {
        ctx.save();
        ctx.fillStyle = "rgba(5, 8, 22, 0.75)";
        ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
        ctx.fillStyle = "#8ad5ff";
        ctx.font = "bold 20px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(
            "PAUSE – P pour reprendre",
            canvas.width / 2,
            canvas.height / 2
        );
        ctx.restore();
    }
}

/* ===================== TEXTE READY ANIME ===================== */

function drawReady() {
    if (gameState !== "ready") return;

    draw();

    const t = Date.now() / 600;
    const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t));
    const yOffset = Math.sin(t * 1.5) * 6;

    ctx.save();
    ctx.fillStyle = "rgba(180, 255, 220," + alpha + ")";
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
        "ESPACE POUR COMMENCER",
        canvas.width / 2,
        canvas.height / 2 + yOffset
    );
    ctx.restore();

    readyAnimationId = requestAnimationFrame(drawReady);
}

/* ===================== CONTROLES ===================== */

function getDirectionFromKey(key) {
    const mirrorActive = Date.now() < effectMirrorUntil;
    if (!mirrorActive) {
        if (key === "ArrowUp") return { x: 0, y: -1 };
        if (key === "ArrowDown") return { x: 0, y: 1 };
        if (key === "ArrowLeft") return { x: -1, y: 0 };
        if (key === "ArrowRight") return { x: 1, y: 0 };
        return null;
    } else {
        if (key === "ArrowUp") return { x: 0, y: 1 };
        if (key === "ArrowDown") return { x: 0, y: -1 };
        if (key === "ArrowLeft") return { x: 1, y: 0 };
        if (key === "ArrowRight") return { x: -1, y: 0 };
        return null;
    }
}

window.addEventListener("keydown", function (e) {
    const key = e.key;

    if (key === " ") {
        e.preventDefault();
        if (gameState === "ready" || gameState === "over") {
            initGame();
            startLoop();
        }
        return;
    }

    if (key === "p" || key === "P") {
        e.preventDefault();
        if (gameState === "running" || gameState === "paused") {
            pauseGame();
        }
        return;
    }

    if (
        key !== "ArrowUp" &&
        key !== "ArrowDown" &&
        key !== "ArrowLeft" &&
        key !== "ArrowRight"
    ) {
        return;
    }

    e.preventDefault();

    if (gameState !== "running") return;

    const dir = getDirectionFromKey(key);
    if (!dir) return;
    enqueueDirection(dir);
});

/* ===================== BOUTONS UI ===================== */

restartBtn.addEventListener("click", function () {
    initGame();
    startLoop();
});

pauseBtn.addEventListener("click", function () {
    if (gameState === "running" || gameState === "paused") {
        pauseGame();
    }
});

/* ===================== LANCEMENT ===================== */

initGame();
scheduleCatOverlay();