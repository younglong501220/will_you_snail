export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SpikeZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SpeedPad {
  x: number;
  y: number;
  w: number;
  h: number;
  direction?: 1 | -1; // 1 = boost right, -1 = boost left
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  tacticalHint: string;
  spawn: { x: number; y: number };
  goal: { x: number; y: number; w: number; h: number };
  platforms: Platform[];
  spikes?: SpikeZone[];
  speedPads?: SpeedPad[];
  squidQuotes: string[];
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '01. 預判入門與加速板',
    subtitle: 'SpeedPad 超頻加速與基礎物理預測',
    tacticalHint: '踩上黃色 SpeedPad 獲得雙倍狂暴極速，誘使 Squid 鎖定遙遠前方，再按 Shift 衝刺反折！',
    spawn: { x: 80, y: 440 },
    goal: { x: 880, y: 440, w: 40, h: 50 },
    platforms: [
      { x: 40, y: 490, w: 880, h: 50 },
      { x: 260, y: 390, w: 120, h: 20 },
      { x: 460, y: 310, w: 120, h: 20 },
      { x: 680, y: 390, w: 120, h: 20 },
    ],
    speedPads: [
      { x: 300, y: 482, w: 100, h: 8, direction: 1 },
      { x: 480, y: 302, w: 80, h: 8, direction: 1 },
    ],
    squidQuotes: [
      '又一隻送死的蝸牛。',
      '你以為踩了加速板就能超脫我的算力？',
      '動得這麼快，我的未來模擬器反而更容易抓到拋物線！',
      '我正在模擬你加速後撞牆的遺照。',
    ],
  },
  {
    id: 2,
    name: '02. 深淵與極速飛躍',
    subtitle: '拋物線落點鎖定與 Shift 空間扭曲衝刺',
    tacticalHint: '踩上 SpeedPad 躍過尖刺深淵，在滯空時按下 Shift 進行短程空間折疊衝刺！',
    spawn: { x: 70, y: 250 },
    goal: { x: 870, y: 150, w: 40, h: 50 },
    platforms: [
      { x: 40, y: 300, w: 140, h: 20 },
      { x: 250, y: 420, w: 100, h: 20 },
      { x: 430, y: 340, w: 90, h: 20 },
      { x: 600, y: 260, w: 90, h: 20 },
      { x: 740, y: 200, w: 80, h: 20 },
      { x: 840, y: 200, w: 100, h: 20 },
      { x: 0, y: 530, w: 960, h: 20 },
    ],
    spikes: [{ x: 0, y: 510, w: 960, h: 20 }],
    speedPads: [
      { x: 260, y: 412, w: 80, h: 8, direction: 1 },
      { x: 610, y: 252, w: 70, h: 8, direction: 1 },
    ],
    squidQuotes: [
      '你摔下去的概率是 99.8%。',
      '那是什麼瞬間加速？空間畸變扭曲了？！',
      '我已經提前預約了你的骨灰罈。',
      '別狂按 Shift 了，小心你的散熱排氣管爆炸！',
    ],
  },
  {
    id: 3,
    name: '03. 極限迴避與雙向板',
    subtitle: 'Z 字型高空折返與 SpeedPad 極速急煞',
    tacticalHint: '利用反向 SpeedPad 瞬間反轉動量，讓 Squid 鎖定在空無一物的懸崖上！',
    spawn: { x: 60, y: 460 },
    goal: { x: 860, y: 100, w: 40, h: 50 },
    platforms: [
      { x: 30, y: 500, w: 180, h: 40 },
      { x: 280, y: 430, w: 100, h: 20 },
      { x: 450, y: 360, w: 100, h: 20 },
      { x: 280, y: 270, w: 100, h: 20 },
      { x: 480, y: 200, w: 100, h: 20 },
      { x: 700, y: 170, w: 80, h: 20 },
      { x: 830, y: 150, w: 100, h: 20 },
    ],
    spikes: [{ x: 200, y: 520, w: 760, h: 20 }],
    speedPads: [
      { x: 70, y: 492, w: 80, h: 8, direction: 1 },
      { x: 460, y: 352, w: 80, h: 8, direction: -1 },
      { x: 490, y: 192, w: 80, h: 8, direction: 1 },
    ],
    squidQuotes: [
      '這是我的終極演算法！',
      '在 SpeedPad 上的假動作？這根本違反牛頓力學！',
      '承認吧，我的雷射已經包夾你了！',
      '連微型曲率衝刺都救不了你！',
    ],
  },
  {
    id: 4,
    name: '04. 雙向誘導迴廊',
    subtitle: '高速雙向加速軌道與長距離空中變向',
    tacticalHint: '先藉由 SpeedPad 累積巨大初速，雷射鎖定後在空中以 Shift 衝刺反切回安全點。',
    spawn: { x: 60, y: 160 },
    goal: { x: 880, y: 140, w: 40, h: 50 },
    platforms: [
      { x: 30, y: 200, w: 120, h: 20 },
      { x: 190, y: 330, w: 95, h: 20 },
      { x: 340, y: 440, w: 110, h: 20 },
      { x: 510, y: 340, w: 95, h: 20 },
      { x: 660, y: 250, w: 95, h: 20 },
      { x: 820, y: 190, w: 110, h: 20 },
    ],
    spikes: [
      { x: 0, y: 520, w: 960, h: 20 },
      { x: 360, y: 210, w: 90, h: 16 },
    ],
    speedPads: [
      { x: 200, y: 322, w: 75, h: 8, direction: 1 },
      { x: 520, y: 332, w: 75, h: 8, direction: 1 },
    ],
    squidQuotes: [
      '上下夾擊，我看你帶著加速往哪裡閃！',
      '這條光速拋物線就是你的墓誌銘。',
      '可惡，衝刺的短暫無敵位移干擾了我的雷達！',
    ],
  },
  {
    id: 5,
    name: '05. Squid 核心審判',
    subtitle: '極小落腳點、雙速加速與終極預判對決',
    tacticalHint: 'SpeedPad 與 Dash 必須交替使用！在高速滑行中騙取雷射，再用 Shift 衝入傳送門！',
    spawn: { x: 55, y: 450 },
    goal: { x: 885, y: 410, w: 40, h: 50 },
    platforms: [
      { x: 30, y: 490, w: 100, h: 30 },
      { x: 185, y: 400, w: 75, h: 18 },
      { x: 320, y: 300, w: 75, h: 18 },
      { x: 460, y: 215, w: 80, h: 18 },
      { x: 615, y: 300, w: 75, h: 18 },
      { x: 745, y: 390, w: 75, h: 18 },
      { x: 860, y: 460, w: 80, h: 30 },
    ],
    spikes: [{ x: 130, y: 520, w: 730, h: 20 }],
    speedPads: [
      { x: 40, y: 482, w: 80, h: 8, direction: 1 },
      { x: 470, y: 207, w: 60, h: 8, direction: 1 },
      { x: 755, y: 382, w: 55, h: 8, direction: 1 },
    ],
    squidQuotes: [
      '不可能！你怎麼可能靠加速和衝刺走到這裡？！',
      '超頻模式全開！我要把整個空間都填滿雷射！',
      '別得意，最後一塊 SpeedPad 也有可能是陷阱！',
    ],
  },
];

export const SQUID_BAIT_QUOTES = [
  '什麼？！你利用加速板在半空臨時變向？',
  '該死！那一瞬間的 Shift 衝刺把我的預測騙到外太空了！',
  '這不科學！速度突然翻倍又瞬間煞車？！',
  '別囂張，下一發雷射我會連你的衝刺距離一起算進去！',
  '滑溜的蝸牛…居然敢用空間扭曲衝刺耍我！',
];

export const SQUID_LASER_KILL_QUOTES = [
  '預測命中！就算速度翻倍也逃不出我的矩陣。',
  '精確命中。你直接光速撞進了我的算力裡。',
  '哈哈！衝刺冷卻了吧？我看你還能閃去哪裡！',
  '別掙扎了，我的物理模擬引擎永遠領先你。',
];

export const STANDALONE_HTML_SOURCE = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Squid AI Challenger - Will You Snail Tribute</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: #0b0813;
            color: #fff;
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
            user-select: none;
        }
        #game-container {
            position: relative;
            box-shadow: 0 0 30px rgba(180, 0, 255, 0.4);
            border: 2px solid #a855f7;
            border-radius: 8px;
        }
        canvas {
            display: block;
            background: #0d0b18;
        }
        .instructions {
            margin-top: 10px;
            color: #a0a0c0;
            font-size: 13px;
            text-align: center;
        }
        .highlight { color: #00ffff; font-weight: bold; }
        .ai-color { color: #ff0055; font-weight: bold; }
        .dash-color { color: #fbbf24; font-weight: bold; }
    </style>
</head>
<body>

    <div id="game-container">
        <canvas id="canvas" width="960" height="540"></canvas>
    </div>
    <div class="instructions">
        [A / D / 左右鍵] 移動 | [W / 空白鍵 / 上] 跳躍 (可二段跳) | <span class="dash-color">[Shift] 衝刺 (Distortion Dash)</span> | [R] 重生<br>
        <span class="ai-color">踩上金黃色 SpeedPad 獲得速度翻倍！善用 Dash 空間扭曲騙過 Squid 的預判！</span>
    </div>

<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.55;
const BASE_SPEED = 5.2;
const JUMP_FORCE = -10.5;

const LEVELS = [
    {
        spawn: { x: 80, y: 440 },
        goal: { x: 880, y: 440, w: 40, h: 50 },
        platforms: [
            { x: 40, y: 490, w: 880, h: 50 },
            { x: 260, y: 390, w: 120, h: 20 },
            { x: 460, y: 310, w: 120, h: 20 },
            { x: 680, y: 390, w: 120, h: 20 }
        ],
        speedPads: [
            { x: 300, y: 482, w: 100, h: 8, direction: 1 },
            { x: 480, y: 302, w: 80, h: 8, direction: 1 }
        ],
        squidQuotes: ["又一隻送死的蝸牛。", "你以為踩了加速板就能超脫我的算力？", "動得這麼快，我的未來模擬器反而更容易抓到拋物線！"]
    },
    {
        spawn: { x: 70, y: 250 },
        goal: { x: 870, y: 150, w: 40, h: 50 },
        platforms: [
            { x: 40, y: 300, w: 140, h: 20 },
            { x: 250, y: 420, w: 100, h: 20 },
            { x: 430, y: 340, w: 90, h: 20 },
            { x: 600, y: 260, w: 90, h: 20 },
            { x: 740, y: 200, w: 80, h: 20 },
            { x: 840, y: 200, w: 100, h: 20 },
            { x: 0, y: 530, w: 960, h: 20 }
        ],
        spikes: [{ x: 0, y: 510, w: 960, h: 20 }],
        speedPads: [
            { x: 260, y: 412, w: 80, h: 8, direction: 1 },
            { x: 610, y: 252, w: 70, h: 8, direction: 1 }
        ],
        squidQuotes: ["你摔下去的概率是 99.8%。", "那是什麼瞬間加速？空間畸變扭曲了？！", "別狂按 Shift 了，小心排氣管爆炸！"]
    },
    {
        spawn: { x: 60, y: 460 },
        goal: { x: 860, y: 100, w: 40, h: 50 },
        platforms: [
            { x: 30, y: 500, w: 180, h: 40 },
            { x: 280, y: 430, w: 100, h: 20 },
            { x: 450, y: 360, w: 100, h: 20 },
            { x: 280, y: 270, w: 100, h: 20 },
            { x: 480, y: 200, w: 100, h: 20 },
            { x: 700, y: 170, w: 80, h: 20 },
            { x: 830, y: 150, w: 100, h: 20 }
        ],
        spikes: [{ x: 200, y: 520, w: 760, h: 20 }],
        speedPads: [
            { x: 70, y: 492, w: 80, h: 8, direction: 1 },
            { x: 460, y: 352, w: 80, h: 8, direction: -1 },
            { x: 490, y: 192, w: 80, h: 8, direction: 1 }
        ],
        squidQuotes: ["這是我的終極演算法！", "在 SpeedPad 上的假動作？違反牛頓力學！", "連微型曲率衝刺都救不了你！"]
    }
];

let currentLevelIdx = 0;
let deathCount = 0;
let baitScore = 0;
let screenShake = 0;
let particles = [];

const DASH_COOLDOWN_MAX = 70;
const DASH_BURST_SPEED = 16;
const DASH_DURATION = 10;

const player = {
    x: 0, y: 0,
    w: 24, h: 20,
    vx: 0, vy: 0,
    grounded: false,
    jumpCount: 0,
    maxJumps: 2,
    facing: 1,
    trail: [],
    speedPadTimer: 0,
    dashTimer: 0,
    dashCooldown: 0,
    reset(lvl) {
        this.x = lvl.spawn.x;
        this.y = lvl.spawn.y;
        this.vx = 0;
        this.vy = 0;
        this.jumpCount = 0;
        this.trail = [];
        this.speedPadTimer = 0;
        this.dashTimer = 0;
        this.dashCooldown = 0;
    }
};

const squid = {
    x: 480, y: 60,
    eyeTargetX: 480, eyeTargetY: 60,
    expression: 'smug',
    dialogue: "歡迎來到我的測試場，蝸牛。",
    dialogueTimer: 180,
    attackTimer: 90,
    traps: [],
    say(text) {
        this.dialogue = text;
        this.dialogueTimer = 180;
    },
    predictFuturePosition(framesAhead, assumedInputX) {
        let simX = player.x;
        let simY = player.y;
        let simVx = player.vx;
        let simVy = player.vy;
        const currentLvl = LEVELS[currentLevelIdx];
        const isBoosted = player.speedPadTimer > 0;
        const speed = isBoosted ? BASE_SPEED * 2 : BASE_SPEED;
        for (let i = 0; i < framesAhead; i++) {
            simVy += GRAVITY;
            if (assumedInputX !== undefined) {
                simVx = assumedInputX * speed;
            }
            simX += simVx;
            simY += simVy;
            for (let plat of currentLvl.platforms) {
                if (simX + player.w > plat.x && simX < plat.x + plat.w &&
                    simY + player.h >= plat.y && simY + player.h <= plat.y + 16 && simVy > 0) {
                    simY = plat.y - player.h;
                    simVy = 0;
                }
            }
        }
        return { x: simX + player.w / 2, y: simY + player.h / 2 };
    },
    update() {
        if (this.dialogueTimer > 0) this.dialogueTimer--;
        this.eyeTargetX += ((player.x + 12) - this.eyeTargetX) * 0.1;
        this.eyeTargetY += ((player.y + 10) - this.eyeTargetY) * 0.1;
        this.attackTimer--;
        if (this.attackTimer <= 0) {
            this.preparePredictionStrike();
            this.attackTimer = Math.max(65, 110 - deathCount * 2);
        }
        for (let i = this.traps.length - 1; i >= 0; i--) {
            const trap = this.traps[i];
            trap.timer--;
            if (trap.timer === 20) this.expression = 'focused';
            if (trap.timer <= 0) {
                for (let p = 0; p < 20; p++) particles.push(new Particle(trap.x, trap.y, '#ff0055'));
                screenShake = 6;
                const dist = Math.hypot((player.x + player.w/2) - trap.x, (player.y + player.h/2) - trap.y);
                if (dist < 38) {
                    killPlayer("預測命中！連小學生都比你好預判。");
                } else if (dist <= 130) {
                    baitScore++;
                    if (Math.random() < 0.4) {
                        squid.say("可惡！居然利用瞬間變向騙過了我！");
                        squid.expression = 'angry';
                    }
                }
                this.traps.splice(i, 1);
            }
        }
    },
    preparePredictionStrike() {
        const lookAheadFrames = 40 + Math.floor(Math.random() * 20);
        let target;
        if (!player.grounded) {
            target = this.predictFuturePosition(lookAheadFrames);
        } else {
            const dir = player.vx !== 0 ? Math.sign(player.vx) : (Math.random() > 0.5 ? 1 : -1);
            target = this.predictFuturePosition(lookAheadFrames, dir);
        }
        this.traps.push({ x: target.x, y: target.y, timer: 50, maxTimer: 50 });
        this.expression = 'laugh';
    }
};

const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) handleJump();
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') handleDash();
    if (e.code === 'KeyR') killPlayer("放棄得真快。");
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function handleJump() {
    if (player.grounded || player.jumpCount < player.maxJumps) {
        player.vy = JUMP_FORCE;
        player.jumpCount++;
        player.grounded = false;
        for (let i = 0; i < 6; i++) particles.push(new Particle(player.x + player.w/2, player.y + player.h, '#00ffff'));
    }
}

function handleDash() {
    if (player.dashCooldown <= 0) {
        player.dashTimer = DASH_DURATION;
        player.dashCooldown = DASH_COOLDOWN_MAX;
        player.vx = player.facing * DASH_BURST_SPEED;
        screenShake = 3;
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(player.x + player.w/2, player.y + player.h/2, '#fbbf24'));
        }
    }
}

function updatePhysics() {
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.speedPadTimer > 0) player.speedPadTimer--;

    let moveInput = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) { moveInput -= 1; player.facing = -1; }
    if (keys['ArrowRight'] || keys['KeyD']) { moveInput += 1; player.facing = 1; }

    const curSpeed = player.speedPadTimer > 0 ? BASE_SPEED * 2 : BASE_SPEED;

    if (player.dashTimer > 0) {
        player.dashTimer--;
        player.vx = player.facing * DASH_BURST_SPEED;
        player.vy = 0; // 短暫抗重力
    } else {
        player.vx = moveInput * curSpeed;
        player.vy += GRAVITY;
    }

    if (player.vy > 14) player.vy = 14;
    const lvl = LEVELS[currentLevelIdx];
    player.x += player.vx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
    player.y += player.vy;
    player.grounded = false;

    // Platform collision
    for (let plat of lvl.platforms) {
        if (player.x + player.w > plat.x && player.x < plat.x + plat.w) {
            if (player.y + player.h >= plat.y && player.y + player.h <= plat.y + 16 && player.vy > 0) {
                player.y = plat.y - player.h;
                player.vy = 0;
                player.grounded = true;
                player.jumpCount = 0;
            }
        }
    }

    // SpeedPad collision
    if (lvl.speedPads) {
        for (let pad of lvl.speedPads) {
            if (player.x + player.w > pad.x && player.x < pad.x + pad.w &&
                player.y + player.h >= pad.y - 4 && player.y <= pad.y + pad.h + 8) {
                player.speedPadTimer = 75; // 雙倍速度持續 ~1.2 秒
                if (pad.direction) {
                    player.facing = pad.direction;
                    player.vx = pad.direction * BASE_SPEED * 2;
                }
                for (let i = 0; i < 3; i++) {
                    particles.push(new Particle(player.x + player.w/2, player.y + player.h, '#fbbf24'));
                }
            }
        }
    }

    if (lvl.spikes) {
        for (let spike of lvl.spikes) {
            if (player.x + player.w > spike.x && player.x < spike.x + spike.w &&
                player.y + player.h > spike.y && player.y < spike.y + spike.h) {
                killPlayer("噗哧。變成蝸牛醬了。");
                return;
            }
        }
    }
    if (player.y > canvas.height + 50) {
        killPlayer("擁抱重力吧。");
        return;
    }
    const goal = lvl.goal;
    if (player.x + player.w > goal.x && player.x < goal.x + goal.w &&
        player.y + player.h > goal.y && player.y < goal.y + goal.h) {
        nextLevel();
    }
    player.trail.push({ x: player.x, y: player.y, alpha: 0.5, isDash: player.dashTimer > 0, isBoost: player.speedPadTimer > 0 });
    if (player.trail.length > 8) player.trail.shift();
}

function killPlayer(mockQuote) {
    deathCount++;
    screenShake = 12;
    for (let i = 0; i < 35; i++) particles.push(new Particle(player.x + player.w/2, player.y + player.h/2, '#00ffff'));
    squid.say(mockQuote || "精確命中。你毫無勝算。");
    squid.expression = 'laugh';
    squid.traps = [];
    player.reset(LEVELS[currentLevelIdx]);
}

function nextLevel() {
    currentLevelIdx++;
    if (currentLevelIdx >= LEVELS.length) {
        currentLevelIdx = 0;
        deathCount = 0;
    }
    const lvl = LEVELS[currentLevelIdx];
    player.reset(lvl);
    squid.traps = [];
    squid.say(lvl.squidQuotes[Math.floor(Math.random() * lvl.squidQuotes.length)]);
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 0.04 + 0.02;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
        ctx.restore();
    }
}

function render() {
    ctx.save();
    if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
        screenShake *= 0.9;
        if (screenShake < 0.2) screenShake = 0;
    }
    ctx.fillStyle = '#08060f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1b1433';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    renderSquidFace();
    const lvl = LEVELS[currentLevelIdx];

    // Platforms
    ctx.fillStyle = '#1c1738';
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2;
    for (let plat of lvl.platforms) { ctx.fillRect(plat.x, plat.y, plat.w, plat.h); ctx.strokeRect(plat.x, plat.y, plat.w, plat.h); }

    // SpeedPads (Glowing Gold with animated directional chevrons)
    if (lvl.speedPads) {
        for (let pad of lvl.speedPads) {
            ctx.save();
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12;
            ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
            ctx.fillStyle = '#fff';
            const dir = pad.direction || 1;
            for (let cx = pad.x + 10; cx < pad.x + pad.w - 10; cx += 20) {
                ctx.beginPath();
                if (dir === 1) {
                    ctx.moveTo(cx, pad.y + 1); ctx.lineTo(cx + 6, pad.y + 4); ctx.lineTo(cx, pad.y + 7);
                } else {
                    ctx.moveTo(cx + 6, pad.y + 1); ctx.lineTo(cx, pad.y + 4); ctx.lineTo(cx + 6, pad.y + 7);
                }
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    // Spikes
    if (lvl.spikes) {
        ctx.fillStyle = '#ff0055';
        for (let spk of lvl.spikes) {
            for (let sx = spk.x; sx < spk.x + spk.w; sx += 15) {
                ctx.beginPath();
                ctx.moveTo(sx, spk.y + spk.h);
                ctx.lineTo(sx + 7.5, spk.y);
                ctx.lineTo(sx + 15, spk.y + spk.h);
                ctx.fill();
            }
        }
    }

    // Goal
    const goal = lvl.goal;
    ctx.save();
    ctx.shadowColor = '#00ffaa'; ctx.shadowBlur = 15; ctx.strokeStyle = '#00ffaa'; ctx.lineWidth = 3;
    ctx.strokeRect(goal.x, goal.y, goal.w, goal.h);
    ctx.fillStyle = 'rgba(0, 255, 170, 0.2)';
    ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    ctx.restore();

    // Traps
    for (let trap of squid.traps) {
        const progress = 1 - (trap.timer / trap.maxTimer);
        ctx.save();
        ctx.strokeStyle = '#ff0055'; ctx.fillStyle = '#ff0055'; ctx.shadowColor = '#ff0055'; ctx.shadowBlur = 10;
        const radius = 35 * (1 - progress * 0.5);
        ctx.beginPath(); ctx.arc(trap.x, trap.y, radius, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = \`rgba(255, 0, 85, \${0.2 + progress * 0.6})\`;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(squid.x, squid.y + 40); ctx.lineTo(trap.x, trap.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(trap.x, trap.y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // Player Trail
    for (let t of player.trail) {
        ctx.fillStyle = t.isDash ? \`rgba(251, 191, 36, \${t.alpha * 0.6})\` :
                        t.isBoost ? \`rgba(56, 189, 248, \${t.alpha * 0.5})\` :
                        \`rgba(0, 255, 255, \${t.alpha * 0.4})\`;
        ctx.fillRect(t.x, t.y, player.w, player.h);
    }

    // Player Sprite with Distortion Effect during Dash
    ctx.save();
    if (player.dashTimer > 0) {
        // Chromatic aberration / glitch distortion
        ctx.save();
        ctx.fillStyle = 'rgba(255, 0, 85, 0.5)';
        ctx.fillRect(player.x - 4 * player.facing, player.y - 1, player.w + 6, player.h + 2);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.fillRect(player.x + 4 * player.facing, player.y + 1, player.w + 6, player.h + 2);
        ctx.restore();

        // Stretched distorted body
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(player.x - 3, player.y + 2, player.w + 6, player.h - 4);
    } else {
        ctx.shadowColor = player.speedPadTimer > 0 ? '#fbbf24' : '#00ffff';
        ctx.shadowBlur = player.speedPadTimer > 0 ? 16 : 12;
        ctx.fillStyle = player.speedPadTimer > 0 ? '#38bdf8' : '#00ffff';
        ctx.fillRect(player.x, player.y + 4, player.w, player.h - 4);
    }

    // Shell
    ctx.fillStyle = player.dashTimer > 0 ? '#f59e0b' : (player.speedPadTimer > 0 ? '#eab308' : '#38bdf8');
    ctx.fillRect(player.x + (player.facing === 1 ? 2 : 10), player.y, 12, 12);

    // Eye
    ctx.fillStyle = '#fff';
    const eyeOffsetX = player.facing === 1 ? player.w - 5 : 2;
    ctx.fillRect(player.x + eyeOffsetX, player.y + 4, 3, 3);
    ctx.restore();

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // UI & Dash Cooldown Bar
    ctx.fillStyle = '#fff';
    ctx.font = '14px Courier New';
    ctx.fillText(\`關卡: \${currentLevelIdx + 1} / \${LEVELS.length}\`, 20, 30);
    ctx.fillText(\`死亡次數: \${deathCount}\`, 20, 50);
    ctx.fillStyle = '#00ffaa';
    ctx.fillText(\`成功騙招: \${baitScore}\`, 20, 70);

    // Dash indicator in Canvas
    const dashReady = player.dashCooldown <= 0;
    ctx.fillStyle = dashReady ? '#fbbf24' : '#64748b';
    ctx.font = '12px Courier New';
    ctx.fillText(\`DASH [Shift]: \${dashReady ? 'READY' : Math.ceil(player.dashCooldown / 60 * 10) / 10 + 's'}\`, 20, 92);
    if (!dashReady) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.fillRect(20, 98, 100, 4);
        ctx.fillStyle = '#fbbf24';
        const pct = 1 - (player.dashCooldown / DASH_COOLDOWN_MAX);
        ctx.fillRect(20, 98, 100 * pct, 4);
    }

    ctx.restore();
}

function renderSquidFace() {
    ctx.save();
    ctx.translate(squid.x, squid.y);
    ctx.shadowColor = '#ff0077'; ctx.shadowBlur = 15; ctx.strokeStyle = '#ff0077'; ctx.lineWidth = 3;
    ctx.strokeRect(-50, -30, 100, 60);
    const eyeRelX = Math.max(-15, Math.min(15, (squid.eyeTargetX - squid.x) * 0.05));
    const eyeRelY = Math.max(-10, Math.min(10, (squid.eyeTargetY - squid.y) * 0.05));
    ctx.fillStyle = '#ff0077';
    if (squid.expression === 'laugh') {
        ctx.fillRect(-30, -5, 20, 4);
        ctx.fillRect(10, -5, 20, 4);
    } else {
        ctx.beginPath();
        ctx.arc(-20 + eyeRelX, eyeRelY, 8, 0, Math.PI * 2);
        ctx.arc(20 + eyeRelX, eyeRelY, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    if (squid.dialogueTimer > 0) {
        ctx.font = 'bold 15px Courier New';
        ctx.fillStyle = '#ff5599';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(\`Squid: "\${squid.dialogue}"\`, 0, 65);
    }
    ctx.restore();
}

function loop() {
    updatePhysics();
    squid.update();
    render();
    requestAnimationFrame(loop);
}

player.reset(LEVELS[0]);
loop();
</script>
</body>
</html>`;
