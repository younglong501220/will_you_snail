import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Play,
  Pause,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Zap,
} from 'lucide-react';
import {
  LEVELS,
  SQUID_BAIT_QUOTES,
  SQUID_LASER_KILL_QUOTES,
  STANDALONE_HTML_SOURCE,
} from './levels';
import { sound } from './sound';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY';
type AIDifficulty = 'mercy' | 'standard' | 'overclock';
type ActiveSection = 'arena' | 'algorithm' | 'source';

interface Trap {
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  isSecondary?: boolean;
}

interface ParticleItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  decay: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const GRAVITY = 0.55;
const BASE_SPEED = 5.2;
const JUMP_FORCE = -10.5;
const DASH_BURST_SPEED = 16;
const DASH_DURATION = 10;
const DASH_COOLDOWN_MAX = 70;
const CANVAS_W = 960;
const CANVAS_H = 540;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // UI React state for HUD & controls
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [activeSection, setActiveSection] = useState<ActiveSection>('arena');
  const [levelIdx, setLevelIdx] = useState<number>(0);
  const [deaths, setDeaths] = useState<number>(0);
  const [baitCount, setBaitCount] = useState<number>(0);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('standard');
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [slowMotion, setSlowMotion] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [dashReady, setDashReady] = useState<boolean>(true);
  const [speedBoostActive, setSpeedBoostActive] = useState<boolean>(false);
  const [squidMood, setSquidMood] = useState<{
    expression: string;
    dialogue: string;
  }>({
    expression: 'smug',
    dialogue: '歡迎來到我的測試場，蝸牛。',
  });

  // Mutable game engine state inside ref for 60fps loop without re-renders
  const engineRef = useRef({
    currentLevelIdx: 0,
    deathCount: 0,
    baitScore: 0,
    screenShake: 0,
    frameTick: 0,
    particles: [] as ParticleItem[],
    floatingTexts: [] as FloatingText[],
    keys: {} as Record<string, boolean>,
    player: {
      x: LEVELS[0].spawn.x,
      y: LEVELS[0].spawn.y,
      w: 24,
      h: 20,
      vx: 0,
      vy: 0,
      grounded: false,
      jumpCount: 0,
      maxJumps: 2,
      facing: 1,
      speedPadTimer: 0,
      dashTimer: 0,
      dashCooldown: 0,
      trail: [] as {
        x: number;
        y: number;
        alpha: number;
        isDash?: boolean;
        isBoost?: boolean;
      }[],
    },
    squid: {
      x: 480,
      y: 60,
      eyeTargetX: 480,
      eyeTargetY: 60,
      expression: 'smug' as 'smug' | 'angry' | 'laugh' | 'focused',
      dialogue: '歡迎來到我的測試場，蝸牛。',
      dialogueTimer: 180,
      attackTimer: 90,
      traps: [] as Trap[],
    },
    settings: {
      gameState: 'PLAYING' as GameState,
      aiDifficulty: 'standard' as AIDifficulty,
      showTrajectory: true,
      slowMotion: false,
    },
  });

  // Sync React controls to mutable engine settings
  useEffect(() => {
    engineRef.current.settings.gameState = gameState;
  }, [gameState]);

  useEffect(() => {
    engineRef.current.settings.aiDifficulty = aiDifficulty;
  }, [aiDifficulty]);

  useEffect(() => {
    engineRef.current.settings.showTrajectory = showTrajectory;
  }, [showTrajectory]);

  useEffect(() => {
    engineRef.current.settings.slowMotion = slowMotion;
  }, [slowMotion]);

  const spawnParticles = (
    x: number,
    y: number,
    color: string,
    count: number,
    speedMultiplier: number = 1
  ) => {
    const arr = engineRef.current.particles;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 5 + 2) * speedMultiplier;
      arr.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02,
      });
    }
  };

  const resetPlayerToLevel = useCallback((idx: number, customQuote?: string) => {
    const eng = engineRef.current;
    const lvl = LEVELS[idx] || LEVELS[0];
    eng.currentLevelIdx = idx;
    eng.player.x = lvl.spawn.x;
    eng.player.y = lvl.spawn.y;
    eng.player.vx = 0;
    eng.player.vy = 0;
    eng.player.jumpCount = 0;
    eng.player.grounded = false;
    eng.player.speedPadTimer = 0;
    eng.player.dashTimer = 0;
    eng.player.dashCooldown = 0;
    eng.player.trail = [];
    eng.squid.traps = [];

    const quote =
      customQuote ||
      lvl.squidQuotes[Math.floor(Math.random() * lvl.squidQuotes.length)];
    eng.squid.dialogue = quote;
    eng.squid.dialogueTimer = 200;
    setLevelIdx(idx);
    setSquidMood({
      expression: eng.squid.expression,
      dialogue: quote,
    });
  }, []);

  const triggerJump = useCallback(() => {
    const eng = engineRef.current;
    if (eng.settings.gameState !== 'PLAYING') return;
    const p = eng.player;
    if (p.grounded || p.jumpCount < p.maxJumps) {
      const isDouble = !p.grounded && p.jumpCount > 0;
      p.vy = JUMP_FORCE;
      p.jumpCount++;
      p.grounded = false;
      sound.playJump(isDouble);
      spawnParticles(
        p.x + p.w / 2,
        p.y + p.h,
        isDouble ? '#c084fc' : '#00ffff',
        7
      );
    }
  }, []);

  const triggerDash = useCallback(() => {
    const eng = engineRef.current;
    if (eng.settings.gameState !== 'PLAYING') return;
    const p = eng.player;

    if (p.dashCooldown <= 0) {
      p.dashTimer = DASH_DURATION;
      p.dashCooldown = DASH_COOLDOWN_MAX;
      p.vx = p.facing * DASH_BURST_SPEED;
      eng.screenShake = 4;
      sound.playDash();
      setDashReady(false);

      // Dash distortion burst particles
      spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#fbbf24', 16, 1.4);
      spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#38bdf8', 10, 1.2);

      eng.floatingTexts.push({
        x: p.x + p.w / 2,
        y: p.y - 12,
        text: 'DASH!',
        color: '#fbbf24',
        life: 0.8,
      });

      if (Math.random() < 0.25) {
        eng.squid.dialogue = '居然還有微型空間折疊？！';
        eng.squid.dialogueTimer = 100;
        eng.squid.expression = 'focused';
      }
    }
  }, []);

  const triggerKillPlayer = useCallback(
    (mockQuote?: string) => {
      const eng = engineRef.current;
      eng.deathCount++;
      eng.screenShake = 12;
      sound.playDeath();
      spawnParticles(
        eng.player.x + eng.player.w / 2,
        eng.player.y + eng.player.h / 2,
        '#00ffff',
        35
      );
      eng.squid.expression = 'laugh';
      const chosenQuote =
        mockQuote ||
        SQUID_LASER_KILL_QUOTES[
          Math.floor(Math.random() * SQUID_LASER_KILL_QUOTES.length)
        ];
      setDeaths(eng.deathCount);
      resetPlayerToLevel(eng.currentLevelIdx, chosenQuote);
    },
    [resetPlayerToLevel]
  );

  // Core Forward Physics Simulator (Accounts for SpeedPad 2x velocity boost)
  const predictFutureTrajectory = (
    framesAhead: number,
    assumedInputX?: number
  ): {
    targetX: number;
    targetY: number;
    points: { x: number; y: number }[];
  } => {
    const eng = engineRef.current;
    let simX = eng.player.x;
    let simY = eng.player.y;
    let simVx = eng.player.vx;
    let simVy = eng.player.vy;
    const pw = eng.player.w;
    const ph = eng.player.h;
    const currentLvl = LEVELS[eng.currentLevelIdx];
    const points: { x: number; y: number }[] = [];

    const isSpeedBoosted = eng.player.speedPadTimer > 0;
    const activeSpeed = isSpeedBoosted ? BASE_SPEED * 2 : BASE_SPEED;

    for (let i = 0; i < framesAhead; i++) {
      simVy += GRAVITY;
      if (simVy > 14) simVy = 14;
      if (assumedInputX !== undefined) {
        simVx = assumedInputX * activeSpeed;
      }

      simX += simVx;
      if (simX < 0) simX = 0;
      if (simX + pw > CANVAS_W) simX = CANVAS_W - pw;

      simY += simVy;

      // Platform landing simulation
      for (const plat of currentLvl.platforms) {
        if (
          simX + pw > plat.x &&
          simX < plat.x + plat.w &&
          simY + ph >= plat.y &&
          simY + ph <= plat.y + 16 &&
          simVy > 0
        ) {
          simY = plat.y - ph;
          simVy = 0;
        }
      }

      if (i % 3 === 0 || i === framesAhead - 1) {
        points.push({ x: simX + pw / 2, y: simY + ph / 2 });
      }
    }

    return {
      targetX: simX + pw / 2,
      targetY: simY + ph / 2,
      points,
    };
  };

  // Keyboard bindings (including Shift for Dash)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code
        ) &&
        activeSection === 'arena'
      ) {
        e.preventDefault();
      }
      engineRef.current.keys[e.code] = true;

      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        if (engineRef.current.settings.gameState === 'PLAYING') {
          triggerJump();
        }
      }
      if (
        ['ShiftLeft', 'ShiftRight', 'KeyK', 'KeyJ'].includes(e.code) &&
        engineRef.current.settings.gameState === 'PLAYING'
      ) {
        e.preventDefault();
        triggerDash();
      }
      if (e.code === 'KeyR' && engineRef.current.settings.gameState === 'PLAYING') {
        triggerKillPlayer('放棄得真快。連自己按 R 都這麼熟練？');
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        setGameState((prev) =>
          prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeSection, triggerJump, triggerDash, triggerKillPlayer]);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const updateGame = () => {
      const eng = engineRef.current;
      eng.frameTick++;

      const shouldStepPhysics =
        eng.settings.gameState === 'PLAYING' &&
        (!eng.settings.slowMotion || eng.frameTick % 2 === 0);

      if (shouldStepPhysics) {
        const p = eng.player;
        const lvl = LEVELS[eng.currentLevelIdx];

        // Dash cooldown & boost timer countdown
        if (p.dashCooldown > 0) {
          p.dashCooldown--;
          if (p.dashCooldown === 0) {
            setDashReady(true);
          }
        }
        if (p.speedPadTimer > 0) {
          p.speedPadTimer--;
          if (p.speedPadTimer === 0) {
            setSpeedBoostActive(false);
          }
        }

        // 1. Horizontal input & SpeedPad 2x velocity multiplier
        let moveInput = 0;
        if (eng.keys['ArrowLeft'] || eng.keys['KeyA']) {
          moveInput -= 1;
          p.facing = -1;
        }
        if (eng.keys['ArrowRight'] || eng.keys['KeyD']) {
          moveInput += 1;
          p.facing = 1;
        }

        const effectiveSpeed =
          p.speedPadTimer > 0 ? BASE_SPEED * 2 : BASE_SPEED;

        if (p.dashTimer > 0) {
          // Dash burst override
          p.dashTimer--;
          p.vx = p.facing * DASH_BURST_SPEED;
          p.vy = 0; // Brief anti-gravity during dash burst
        } else {
          p.vx = moveInput * effectiveSpeed;
          p.vy += GRAVITY;
        }

        if (p.vy > 14) p.vy = 14;

        p.x += p.vx;
        if (p.x < 0) p.x = 0;
        if (p.x + p.w > CANVAS_W) p.x = CANVAS_W - p.w;

        // 2. Vertical movement & one-way platform landing
        p.y += p.vy;
        p.grounded = false;

        for (const plat of lvl.platforms) {
          if (p.x + p.w > plat.x && p.x < plat.x + plat.w) {
            if (
              p.y + p.h >= plat.y &&
              p.y + p.h <= plat.y + 16 &&
              p.vy > 0
            ) {
              p.y = plat.y - plat.h > 0 ? plat.y - p.h : plat.y - p.h;
              p.vy = 0;
              p.grounded = true;
              p.jumpCount = 0;
            }
          }
        }

        // 3. SpeedPad object collision detection (Doubles velocity!)
        if (lvl.speedPads) {
          for (const pad of lvl.speedPads) {
            if (
              p.x + p.w > pad.x &&
              p.x < pad.x + pad.w &&
              p.y + p.h >= pad.y - 4 &&
              p.y <= pad.y + pad.h + 8
            ) {
              if (p.speedPadTimer <= 0) {
                sound.playSpeedPad();
                setSpeedBoostActive(true);
                eng.floatingTexts.push({
                  x: p.x + p.w / 2,
                  y: p.y - 12,
                  text: '2X SPEED BOOST!',
                  color: '#fbbf24',
                  life: 0.9,
                });
              }
              p.speedPadTimer = 75; // ~1.25 seconds of doubled speed
              if (pad.direction) {
                p.facing = pad.direction;
                p.vx = pad.direction * BASE_SPEED * 2;
              }
              spawnParticles(p.x + p.w / 2, p.y + p.h, '#fbbf24', 4, 1.2);
            }
          }
        }

        // 4. Spikes collision
        if (lvl.spikes) {
          for (const spike of lvl.spikes) {
            if (
              p.x + p.w > spike.x &&
              p.x < spike.x + spike.w &&
              p.y + p.h > spike.y &&
              p.y < spike.y + spike.h
            ) {
              triggerKillPlayer('噗哧。直接變成鐵板蝸牛醬了。');
              return;
            }
          }
        }

        // 5. Abyss fall check
        if (p.y > CANVAS_H + 50) {
          triggerKillPlayer('擁抱重力吧，連雷射都省了。');
          return;
        }

        // 6. Goal portal check
        const goal = lvl.goal;
        if (
          p.x + p.w > goal.x &&
          p.x < goal.x + goal.w &&
          p.y + p.h > goal.y &&
          p.y < goal.y + goal.h
        ) {
          sound.playLevelClear();
          const nextIdx = eng.currentLevelIdx + 1;
          if (nextIdx >= LEVELS.length) {
            eng.settings.gameState = 'VICTORY';
            setGameState('VICTORY');
          } else {
            resetPlayerToLevel(nextIdx);
          }
          return;
        }

        // 7. Trail update (Includes dash and speed boost styling)
        p.trail.push({
          x: p.x,
          y: p.y,
          alpha: 0.5,
          isDash: p.dashTimer > 0,
          isBoost: p.speedPadTimer > 0,
        });
        if (p.trail.length > 9) p.trail.shift();

        // 8. Squid AI Update
        const sq = eng.squid;
        if (sq.dialogueTimer > 0) sq.dialogueTimer--;

        sq.eyeTargetX += (p.x + 12 - sq.eyeTargetX) * 0.12;
        sq.eyeTargetY += (p.y + 10 - sq.eyeTargetY) * 0.12;

        sq.attackTimer--;
        if (sq.attackTimer <= 0) {
          const diff = eng.settings.aiDifficulty;
          const lookAheadFrames = 40 + Math.floor(Math.random() * 20);
          let primaryPred;

          if (!p.grounded) {
            primaryPred = predictFutureTrajectory(lookAheadFrames);
          } else {
            const dir =
              p.vx !== 0
                ? Math.sign(p.vx)
                : Math.random() > 0.5
                ? 1
                : -1;
            primaryPred = predictFutureTrajectory(lookAheadFrames, dir);
          }

          const chargeFrames =
            diff === 'mercy' ? 65 : diff === 'overclock' ? 44 : 50;

          sq.traps.push({
            x: primaryPred.targetX,
            y: primaryPred.targetY,
            timer: chargeFrames,
            maxTimer: chargeFrames,
          });

          // Overclock mode: secondary counter-bait trap
          if (diff === 'overclock') {
            const altPred = predictFutureTrajectory(
              Math.floor(lookAheadFrames * 0.65),
              0
            );
            if (
              Math.hypot(
                altPred.targetX - primaryPred.targetX,
                altPred.targetY - primaryPred.targetY
              ) > 48
            ) {
              sq.traps.push({
                x: altPred.targetX,
                y: altPred.targetY,
                timer: chargeFrames + 8,
                maxTimer: chargeFrames + 8,
                isSecondary: true,
              });
            }
          }

          sound.playLockOn();
          sq.expression = 'laugh';

          const baseCooldown =
            diff === 'mercy'
              ? 125
              : diff === 'overclock'
              ? 65
              : Math.max(65, 110 - eng.deathCount * 2);
          sq.attackTimer = baseCooldown;
        }

        // 9. Update active laser traps
        for (let i = sq.traps.length - 1; i >= 0; i--) {
          const trap = sq.traps[i];
          trap.timer--;

          if (trap.timer === 20) {
            sq.expression = 'focused';
          }

          if (trap.timer <= 0) {
            spawnParticles(
              trap.x,
              trap.y,
              trap.isSecondary ? '#f59e0b' : '#ff0055',
              22
            );
            eng.screenShake = 6;
            sound.playLaserBlast();

            const dist = Math.hypot(
              p.x + p.w / 2 - trap.x,
              p.y + p.h / 2 - trap.y
            );

            if (dist < 38) {
              sq.traps.splice(i, 1);
              triggerKillPlayer();
              return;
            } else if (dist >= 38 && dist <= 135) {
              eng.baitScore++;
              setBaitCount(eng.baitScore);
              sound.playBaitSuccess();
              eng.floatingTexts.push({
                x: p.x + p.w / 2,
                y: p.y - 10,
                text: 'BAITED! 騙招成功',
                color: '#00ffaa',
                life: 1.0,
              });
              if (Math.random() < 0.45) {
                sq.expression = 'angry';
                const baitLine =
                  SQUID_BAIT_QUOTES[
                    Math.floor(Math.random() * SQUID_BAIT_QUOTES.length)
                  ];
                sq.dialogue = baitLine;
                sq.dialogueTimer = 150;
                setSquidMood({
                  expression: 'angry',
                  dialogue: baitLine,
                });
              }
            }
            sq.traps.splice(i, 1);
          }
        }
      }

      // Update particles & floating texts
      for (let i = eng.particles.length - 1; i >= 0; i--) {
        const pt = eng.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= pt.decay;
        if (pt.life <= 0) eng.particles.splice(i, 1);
      }

      for (let i = eng.floatingTexts.length - 1; i >= 0; i--) {
        const ft = eng.floatingTexts[i];
        ft.y -= 0.8;
        ft.life -= 0.025;
        if (ft.life <= 0) eng.floatingTexts.splice(i, 1);
      }
    };

    const renderGame = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const eng = engineRef.current;
      const lvl = LEVELS[eng.currentLevelIdx];
      const p = eng.player;
      const sq = eng.squid;

      ctx.save();

      // Screen shake
      if (eng.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * eng.screenShake;
        const shakeY = (Math.random() - 0.5) * eng.screenShake;
        ctx.translate(shakeX, shakeY);
        eng.screenShake *= 0.9;
        if (eng.screenShake < 0.2) eng.screenShake = 0;
      }

      // 1. Cyber-dark background
      ctx.fillStyle = '#08060f';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Subtle grid
      ctx.strokeStyle = '#1b1433';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_H);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }

      // 2. Render Squid Face in background
      ctx.save();
      ctx.translate(sq.x, sq.y);

      const frameColor =
        sq.expression === 'angry'
          ? '#f59e0b'
          : sq.expression === 'focused'
          ? '#ff0055'
          : '#ff0077';

      ctx.shadowColor = frameColor;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(-50, -30, 100, 60);

      ctx.fillStyle = 'rgba(255, 0, 119, 0.05)';
      ctx.fillRect(-48, -28, 96, 56);

      const eyeRelX = Math.max(
        -15,
        Math.min(15, (sq.eyeTargetX - sq.x) * 0.05)
      );
      const eyeRelY = Math.max(
        -10,
        Math.min(10, (sq.eyeTargetY - sq.y) * 0.05)
      );

      ctx.fillStyle = frameColor;
      if (sq.expression === 'laugh') {
        ctx.fillRect(-30, -5, 20, 4);
        ctx.fillRect(10, -5, 20, 4);
      } else if (sq.expression === 'angry') {
        ctx.beginPath();
        ctx.moveTo(-32 + eyeRelX * 0.5, -10 + eyeRelY);
        ctx.lineTo(-10 + eyeRelX * 0.5, -2 + eyeRelY);
        ctx.lineTo(-10 + eyeRelX * 0.5, 5 + eyeRelY);
        ctx.lineTo(-32 + eyeRelX * 0.5, 2 + eyeRelY);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(32 + eyeRelX * 0.5, -10 + eyeRelY);
        ctx.lineTo(10 + eyeRelX * 0.5, -2 + eyeRelY);
        ctx.lineTo(10 + eyeRelX * 0.5, 5 + eyeRelY);
        ctx.lineTo(32 + eyeRelX * 0.5, 2 + eyeRelY);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(-20 + eyeRelX, eyeRelY, 8, 0, Math.PI * 2);
        ctx.arc(20 + eyeRelX, eyeRelY, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      if (sq.dialogueTimer > 0) {
        ctx.font = 'bold 15px "JetBrains Mono", "Courier New", monospace';
        ctx.fillStyle = '#ff5599';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText(`Squid: "${sq.dialogue}"`, 0, 62);
      }
      ctx.restore();

      // 3. Render Platforms
      ctx.fillStyle = '#1c1738';
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 2;
      for (const plat of lvl.platforms) {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      }

      // 4. Render SpeedPads (Neon Gold with animated directional chevrons)
      if (lvl.speedPads) {
        for (const pad of lvl.speedPads) {
          ctx.save();
          // Pad glow base
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 14;
          ctx.fillRect(pad.x, pad.y, pad.w, pad.h);

          // Top reflective stripe
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(pad.x, pad.y, pad.w, 2);

          // Animated moving directional chevrons
          const dir = pad.direction || 1;
          const chevronOffset = ((eng.frameTick * 0.8 * dir) % 20);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;

          for (
            let cx = pad.x + 8 + chevronOffset;
            cx < pad.x + pad.w - 8;
            cx += 20
          ) {
            if (cx >= pad.x + 4 && cx + 6 <= pad.x + pad.w - 4) {
              ctx.beginPath();
              if (dir === 1) {
                ctx.moveTo(cx, pad.y + 1);
                ctx.lineTo(cx + 5, pad.y + 4);
                ctx.lineTo(cx, pad.y + 7);
              } else {
                ctx.moveTo(cx + 5, pad.y + 1);
                ctx.lineTo(cx, pad.y + 4);
                ctx.lineTo(cx + 5, pad.y + 7);
              }
              ctx.stroke();
            }
          }
          ctx.restore();
        }
      }

      // 5. Render Spikes
      if (lvl.spikes) {
        ctx.fillStyle = '#ff0055';
        for (const spk of lvl.spikes) {
          for (let sx = spk.x; sx < spk.x + spk.w; sx += 15) {
            ctx.beginPath();
            ctx.moveTo(sx, spk.y + spk.h);
            ctx.lineTo(sx + 7.5, spk.y);
            ctx.lineTo(sx + 15, spk.y + spk.h);
            ctx.fill();
          }
        }
      }

      // 6. Render Goal Portal
      const goal = lvl.goal;
      ctx.save();
      ctx.shadowColor = '#00ffaa';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 3;
      ctx.strokeRect(goal.x, goal.y, goal.w, goal.h);
      ctx.fillStyle = 'rgba(0, 255, 170, 0.2)';
      ctx.fillRect(goal.x, goal.y, goal.w, goal.h);

      const pulseH = ((eng.frameTick * 1.5) % goal.h);
      ctx.fillStyle = 'rgba(0, 255, 170, 0.55)';
      ctx.fillRect(goal.x + 4, goal.y + pulseH, goal.w - 8, 2);
      ctx.restore();

      // 7. Render Ghost Trajectory (Forward Physics Simulator curve)
      if (eng.settings.showTrajectory) {
        const assumedDir = !p.grounded
          ? undefined
          : p.vx !== 0
          ? Math.sign(p.vx)
          : undefined;
        const sim = predictFutureTrajectory(48, assumedDir);

        ctx.save();
        ctx.strokeStyle = p.speedPadTimer > 0
          ? 'rgba(251, 191, 36, 0.45)'
          : 'rgba(0, 255, 255, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2, p.y + p.h / 2);
        for (const pt of sim.points) {
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = p.speedPadTimer > 0
          ? 'rgba(251, 191, 36, 0.75)'
          : 'rgba(0, 255, 255, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          sim.targetX - p.w / 2,
          sim.targetY - p.h / 2,
          p.w,
          p.h
        );
        ctx.fillStyle = p.speedPadTimer > 0 ? '#fbbf24' : '#00ffff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(
          p.speedPadTimer > 0 ? 'AI 預測落點 (2X極速)' : 'AI 預測落點 (+48f)',
          sim.targetX - 44,
          sim.targetY - 14
        );
        ctx.restore();
      }

      // 8. Render Laser Traps
      for (const trap of sq.traps) {
        const progress = 1 - trap.timer / trap.maxTimer;
        const trapColor = trap.isSecondary ? '#f59e0b' : '#ff0055';
        ctx.save();
        ctx.strokeStyle = trapColor;
        ctx.fillStyle = trapColor;
        ctx.shadowColor = trapColor;
        ctx.shadowBlur = 10;

        const radius = 35 * (1 - progress * 0.5);
        ctx.beginPath();
        ctx.arc(trap.x, trap.y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(trap.x - radius - 5, trap.y);
        ctx.lineTo(trap.x - radius + 4, trap.y);
        ctx.moveTo(trap.x + radius - 4, trap.y);
        ctx.lineTo(trap.x + radius + 5, trap.y);
        ctx.moveTo(trap.x, trap.y - radius - 5);
        ctx.lineTo(trap.x, trap.y - radius + 4);
        ctx.moveTo(trap.x, trap.y + radius - 4);
        ctx.lineTo(trap.x, trap.y + radius + 5);
        ctx.stroke();

        ctx.strokeStyle = trap.isSecondary
          ? `rgba(245, 158, 11, ${0.2 + progress * 0.6})`
          : `rgba(255, 0, 85, ${0.2 + progress * 0.6})`;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(sq.x, sq.y + 30);
        ctx.lineTo(trap.x, trap.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(trap.x, trap.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 9. Render Afterimage Trail
      for (const t of p.trail) {
        ctx.fillStyle = t.isDash
          ? `rgba(251, 191, 36, ${t.alpha * 0.6})`
          : t.isBoost
          ? `rgba(56, 189, 248, ${t.alpha * 0.5})`
          : `rgba(0, 255, 255, ${t.alpha * 0.35})`;
        ctx.fillRect(t.x, t.y, p.w, p.h);
      }

      // 10. Render Player Snail (Shelly) with Visual Distortion on Dash
      ctx.save();
      if (p.dashTimer > 0) {
        // === DISTORTION EFFECT ON PLAYER SPRITE ===
        // Chromatic Aberration Slices (Red + Cyan Shift)
        ctx.fillStyle = 'rgba(255, 0, 85, 0.65)';
        ctx.fillRect(
          p.x - 5 * p.facing,
          p.y - 1,
          p.w + 8,
          p.h + 2
        );
        ctx.fillStyle = 'rgba(0, 255, 255, 0.65)';
        ctx.fillRect(
          p.x + 5 * p.facing,
          p.y + 1,
          p.w + 8,
          p.h + 2
        );

        // Distorted Stretched Sprite Body
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(p.x - 4, p.y + 2, p.w + 8, p.h - 4);

        // Stretched Shell
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(
          p.x + (p.facing === 1 ? 0 : 12),
          p.y - 1,
          16,
          14
        );

        // Motion Glitch Lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(p.x - 8, p.y + 6, p.w + 16, 2);
      } else {
        // Standard or SpeedBoost state
        const glowColor = p.speedPadTimer > 0 ? '#fbbf24' : '#00ffff';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = p.speedPadTimer > 0 ? 18 : 12;

        ctx.fillStyle = p.speedPadTimer > 0 ? '#38bdf8' : '#00ffff';
        ctx.fillRect(p.x, p.y + 4, p.w, p.h - 4);

        // Snail shell
        ctx.fillStyle =
          p.speedPadTimer > 0 ? '#f59e0b' : '#38bdf8';
        ctx.fillRect(
          p.x + (p.facing === 1 ? 2 : 10),
          p.y,
          12,
          12
        );
      }

      // Snail eye
      ctx.fillStyle = '#ffffff';
      const eyeOffsetX = p.facing === 1 ? p.w - 5 : 2;
      ctx.fillRect(p.x + eyeOffsetX, p.y + 4, 3, 3);
      ctx.restore();

      // 11. Render Particles & Floating Texts
      for (const pt of eng.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
        ctx.restore();
      }

      for (const ft of eng.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 12. Canvas HUD Overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px "JetBrains Mono", "Courier New", monospace';
      ctx.fillText(
        `關卡: ${eng.currentLevelIdx + 1} / ${LEVELS.length}`,
        20,
        28
      );
      ctx.fillText(`死亡次數: ${eng.deathCount}`, 20, 48);
      ctx.fillStyle = '#00ffaa';
      ctx.fillText(`成功騙招 (Bait): ${eng.baitScore}`, 20, 68);

      // Dash Status & Cooldown Bar in Canvas
      const canDash = p.dashCooldown <= 0;
      ctx.fillStyle = canDash ? '#fbbf24' : '#64748b';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(
        `DASH [Shift]: ${
          canDash
            ? 'READY'
            : (Math.ceil((p.dashCooldown / 60) * 10) / 10).toFixed(1) + 's'
        }`,
        20,
        90
      );

      if (!canDash) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.fillRect(20, 96, 110, 4);
        ctx.fillStyle = '#fbbf24';
        const pct = 1 - p.dashCooldown / DASH_COOLDOWN_MAX;
        ctx.fillRect(20, 96, 110 * pct, 4);
      }

      // SpeedPad Boost Indicator
      if (p.speedPadTimer > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText('SPEED BOOST 2X ACTIVE', 20, 115);
      }

      ctx.restore();
    };

    const loop = () => {
      updateGame();
      renderGame();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [resetPlayerToLevel, triggerKillPlayer]);

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
  };

  const handleDownloadStandaloneHtml = () => {
    const blob = new Blob([STANDALONE_HTML_SOURCE], {
      type: 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyStandaloneHtml = () => {
    navigator.clipboard.writeText(STANDALONE_HTML_SOURCE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFullRestart = () => {
    engineRef.current.deathCount = 0;
    engineRef.current.baitScore = 0;
    setDeaths(0);
    setBaitCount(0);
    setGameState('PLAYING');
    resetPlayerToLevel(0, '重頭來過？我的算力隨時奉陪。');
  };

  const currentLevel = LEVELS[levelIdx] || LEVELS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0813] text-slate-100">
      {/* Top Bar Contract: 3 Zones (Brand Wordmark — Nav Links — Primary Actions) */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-purple-500/20 bg-[#0d0b18]/90 backdrop-blur-md sticky top-0 z-30">
        <a
          href="#arena"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('arena');
          }}
          className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap"
        >
          Squid AI Challenger
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveSection('arena')}
            className={`hover:text-cyan-300 transition-colors whitespace-nowrap pb-0.5 ${
              activeSection === 'arena'
                ? 'text-cyan-400 border-b border-cyan-400'
                : ''
            }`}
          >
            遊戲測試場
          </button>
          <button
            onClick={() => setActiveSection('algorithm')}
            className={`hover:text-cyan-300 transition-colors whitespace-nowrap pb-0.5 ${
              activeSection === 'algorithm'
                ? 'text-cyan-400 border-b border-cyan-400'
                : ''
            }`}
          >
            預測演算法與加速機制
          </button>
          <button
            onClick={() => setActiveSection('source')}
            className={`hover:text-cyan-300 transition-colors whitespace-nowrap pb-0.5 ${
              activeSection === 'source'
                ? 'text-cyan-400 border-b border-cyan-400'
                : ''
            }`}
          >
            單檔 HTML 原始碼
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            title={soundEnabled ? '關閉音效' : '開啟音效'}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/90 border border-slate-700/80 rounded-lg hover:border-purple-400/60 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{soundEnabled ? '音效開啟' : '靜音'}</span>
          </button>

          <button
            onClick={handleDownloadStandaloneHtml}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載單檔 index.html</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-5 flex flex-col gap-6">
        {/* Mobile Section Switcher */}
        <div className="flex md:hidden items-center gap-1 p-1 bg-[#141026] rounded-lg border border-purple-500/20">
          <button
            onClick={() => setActiveSection('arena')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeSection === 'arena'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300'
            }`}
          >
            測試場
          </button>
          <button
            onClick={() => setActiveSection('algorithm')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeSection === 'algorithm'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300'
            }`}
          >
            演算法
          </button>
          <button
            onClick={() => setActiveSection('source')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeSection === 'source'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300'
            }`}
          >
            單檔源碼
          </button>
        </div>

        {/* SECTION 1: GAME ARENA */}
        {activeSection === 'arena' && (
          <div className="flex flex-col items-center gap-4">
            {/* Control & Level Bar */}
            <div className="w-full max-w-[960px] flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#120e24] border border-purple-500/25 rounded-lg">
              {/* Level Selectors */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs text-slate-400 mr-1 whitespace-nowrap">
                  關卡
                </span>
                {LEVELS.map((lvl, idx) => (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setGameState('PLAYING');
                      resetPlayerToLevel(idx);
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                      levelIdx === idx
                        ? 'bg-purple-600 text-white font-semibold'
                        : 'bg-[#1b1534] text-slate-300 hover:bg-purple-900/50'
                    }`}
                  >
                    0{lvl.id}
                  </button>
                ))}
              </div>

              {/* AI Difficulty & Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-0.5 bg-[#090712] rounded-md border border-slate-800">
                  {(
                    [
                      { id: 'mercy', label: '仁慈訓練' },
                      { id: 'standard', label: '標準算力' },
                      { id: 'overclock', label: '惡夢雙重鎖定' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setAiDifficulty(mode.id)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                        aiDifficulty === mode.id
                          ? mode.id === 'overclock'
                            ? 'bg-rose-600 text-white font-semibold'
                            : 'bg-purple-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowTrajectory((v) => !v)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    showTrajectory
                      ? 'bg-cyan-950/70 border-cyan-400/60 text-cyan-300'
                      : 'bg-[#1b1534] border-slate-700 text-slate-400'
                  }`}
                >
                  {showTrajectory ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  <span>AI 預測軌跡透視</span>
                </button>

                <button
                  onClick={() => setSlowMotion((v) => !v)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap ${
                    slowMotion
                      ? 'bg-amber-950/70 border-amber-400/60 text-amber-300'
                      : 'bg-[#1b1534] border-slate-700 text-slate-400'
                  }`}
                >
                  {slowMotion ? '0.5x 子彈時間' : '1.0x 原速'}
                </button>

                <button
                  onClick={() =>
                    setGameState((s) => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'))
                  }
                  className="px-2.5 py-1 text-xs rounded bg-[#1b1534] hover:bg-purple-900/50 text-slate-200 flex items-center gap-1 whitespace-nowrap"
                >
                  {gameState === 'PAUSED' ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>繼續</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-slate-300" />
                      <span>暫停</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Canvas Stage Container */}
            <div className="relative w-full max-w-[960px] rounded-lg border-2 border-purple-500 shadow-[0_0_30px_rgba(180,0,255,0.35)] overflow-hidden bg-[#0d0b18]">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className="w-full h-auto block"
              />

              {/* PAUSED OVERLAY */}
              {gameState === 'PAUSED' && (
                <div className="absolute inset-0 bg-[#08060f]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mb-2">
                    遊戲暫停 · 戰術分析中
                  </h2>
                  <p className="text-sm text-slate-300 max-w-md mb-6">
                    踩上黃色 SpeedPad 可使水平速度加倍，按 Shift 鍵可觸發短程空間扭曲衝刺（Dash）。
                    善用這兩種機制讓 Squid 的物理模擬落空！
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGameState('PLAYING')}
                      className="px-5 py-2.5 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap"
                    >
                      繼續挑戰
                    </button>
                    <button
                      onClick={handleFullRestart}
                      className="px-4 py-2.5 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors whitespace-nowrap"
                    >
                      從第 1 關重來
                    </button>
                  </div>
                </div>
              )}

              {/* VICTORY MODAL */}
              {gameState === 'VICTORY' && (
                <div className="absolute inset-0 bg-[#08060f]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-xs font-mono text-emerald-400 mb-1">
                    SIMULATION OVERRIDE · 算力突破成功
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white font-display mb-2">
                    恭喜通關！你擊敗了惡魔 AI Squid
                  </h2>
                  <p className="text-sm text-slate-300 max-w-lg mb-6">
                    Squid:
                    「加速板加上空間扭曲衝刺…區區一隻軟體動物，居然徹底打破了我的物理守恆定律？！」
                  </p>

                  <div className="flex items-center gap-8 px-6 py-4 bg-[#141026] border border-purple-500/30 rounded-lg mb-6 font-mono">
                    <div>
                      <div className="text-xs text-slate-400">突破關卡</div>
                      <div className="text-xl font-bold text-white tabular-nums">
                        {LEVELS.length} / {LEVELS.length}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                      <div className="text-xs text-slate-400">總死亡次數</div>
                      <div className="text-xl font-bold text-rose-400 tabular-nums">
                        {deaths}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                      <div className="text-xs text-slate-400">
                        成功騙招 (Bait)
                      </div>
                      <div className="text-xl font-bold text-emerald-400 tabular-nums">
                        {baitCount}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleFullRestart}
                      className="px-6 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap"
                    >
                      再玩一次 (Play Again)
                    </button>
                    <button
                      onClick={() => {
                        setAiDifficulty('overclock');
                        handleFullRestart();
                      }}
                      className="px-5 py-2.5 text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                      挑戰「惡夢雙重鎖定」
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tactical Info & Mobile/Gamepad Controls */}
            <div className="w-full max-w-[960px] flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-[#120e24] border border-purple-500/20 rounded-lg">
              <div className="text-xs sm:text-sm text-slate-300 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-cyan-400">
                    {currentLevel.name}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">
                    ·
                  </span>
                  <span className="text-slate-400">{currentLevel.subtitle}</span>
                  {speedBoostActive && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      2X 速度加速中
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  <span className="text-rose-400 font-semibold">
                    破關秘訣：
                  </span>
                  {currentLevel.tacticalHint}
                </p>
                <p className="text-xs font-mono text-slate-400 pt-0.5">
                  [A / D] 移動 · [Space / W] 跳躍 ·{' '}
                  <span className="text-amber-300 font-semibold">
                    [Shift] 空間扭曲衝刺 (Dash)
                  </span>{' '}
                  · [R] 自殺重來
                </p>
              </div>

              {/* Virtual Touch / Mouse Gamepad */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onMouseDown={() => {
                    engineRef.current.keys['ArrowLeft'] = true;
                  }}
                  onMouseUp={() => {
                    engineRef.current.keys['ArrowLeft'] = false;
                  }}
                  onMouseLeave={() => {
                    engineRef.current.keys['ArrowLeft'] = false;
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    engineRef.current.keys['ArrowLeft'] = true;
                  }}
                  onTouchEnd={() => {
                    engineRef.current.keys['ArrowLeft'] = false;
                  }}
                  className="w-11 h-11 rounded-lg bg-[#1c1738] border border-purple-500/40 active:bg-purple-600 flex items-center justify-center text-white"
                  aria-label="向左移動"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onMouseDown={() => {
                    engineRef.current.keys['ArrowRight'] = true;
                  }}
                  onMouseUp={() => {
                    engineRef.current.keys['ArrowRight'] = false;
                  }}
                  onMouseLeave={() => {
                    engineRef.current.keys['ArrowRight'] = false;
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    engineRef.current.keys['ArrowRight'] = true;
                  }}
                  onTouchEnd={() => {
                    engineRef.current.keys['ArrowRight'] = false;
                  }}
                  className="w-11 h-11 rounded-lg bg-[#1c1738] border border-purple-500/40 active:bg-purple-600 flex items-center justify-center text-white"
                  aria-label="向右移動"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onMouseDown={triggerJump}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    triggerJump();
                  }}
                  className="px-3.5 h-11 rounded-lg bg-cyan-500/20 border border-cyan-400/60 active:bg-cyan-500 active:text-slate-950 flex items-center gap-1 text-xs font-semibold text-cyan-300 whitespace-nowrap"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>跳躍</span>
                </button>

                <button
                  onMouseDown={triggerDash}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    triggerDash();
                  }}
                  className={`px-3.5 h-11 rounded-lg border flex items-center gap-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                    dashReady
                      ? 'bg-amber-500/20 border-amber-400/80 text-amber-300 active:bg-amber-500 active:text-slate-950'
                      : 'bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>衝刺 {dashReady ? '' : '(冷卻)'}</span>
                </button>

                <button
                  onClick={() => triggerKillPlayer('放棄得真快。')}
                  title="重置當前關卡 (R)"
                  className="w-11 h-11 rounded-lg bg-rose-950/50 border border-rose-500/40 hover:bg-rose-900/60 flex items-center justify-center text-rose-300"
                  aria-label="自殺重來"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: FORWARD PHYSICS & SPEED MECHANISMS BREAKDOWN */}
        {activeSection === 'algorithm' && (
          <div className="max-w-[960px] mx-auto w-full space-y-6">
            <div className="border-b border-purple-500/20 pb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Squid 預測演算核心與 SpeedPad / Dash 機制解析
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Forward Physics Simulator 配合全新加速板與空間扭曲衝刺，帶來極限高難度心理博弈。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-lg bg-[#120e24] border border-purple-500/25 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-semibold text-amber-300 font-display">
                    01. SpeedPad 加速板物理加成
                  </h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  踩上發光金黃色 SpeedPad 後，水平速度直接翻倍為{' '}
                  <code className="text-amber-300">10.4 px/frame</code>
                  。由於 Squid 的物理推演引擎實時追蹤你的速度，它會預測出跨越半個螢幕的遠端落點——這為你提供了超遠距離誘餌騙招的完美契機！
                </p>
              </div>

              <div className="p-5 rounded-lg bg-[#120e24] border border-purple-500/25 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-semibold text-cyan-300 font-display">
                    02. Shift 衝刺 (Distortion Dash)
                  </h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  按 <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs">Shift</kbd> 鍵
                  觸發短程高初速衝刺（16 px/frame，維持 10 幀），並附帶短暫抗重力位移與精緻的
                  <strong>色差 RGB 分離與體積拉伸畸變特效</strong>。衝刺冷卻時間為 1.1 秒。
                </p>
              </div>

              <div className="p-5 rounded-lg bg-[#120e24] border border-purple-500/25 space-y-2">
                <h3 className="text-base font-semibold text-rose-400 font-display">
                  03. 前推物理演算 (40～60 幀推演)
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Squid 在後台複製你的重力加速度（0.55）、當前動量與地形碰撞，在 0.8
                  秒前預判你的著地點。只有在看到鎖定紅圈時進行緊急二段跳或反向 Dash，才能成功騙過 AI！
                </p>
              </div>

              <div className="p-5 rounded-lg bg-[#120e24] border border-purple-500/25 space-y-2">
                <h3 className="text-base font-semibold text-purple-400 font-display">
                  04. 毒舌 AI 動態對話與反制反應
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  當你利用 SpeedPad 或 Dash 成功閃開雷射時，Squid 會出現憤怒表情並給出專屬嘲弄破防對話：
                  <span className="text-rose-300 italic block mt-1">
                    「{squidMood.dialogue}」
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveSection('arena')}
                className="px-5 py-2.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap"
              >
                返回測試場實戰演練
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: STANDALONE SINGLE-FILE HTML CODE */}
        {activeSection === 'source' && (
          <div className="max-w-[960px] mx-auto w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">
                  完整單檔 HTML5 Canvas 遊戲原始碼
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  已完整包含 SpeedPad 與 Shift Distortion Dash 機制，直接存為 index.html 即可離線遊玩。
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCopyStandaloneHtml}
                  className="px-3.5 py-2 text-xs font-semibold bg-[#1c1738] hover:bg-purple-900/60 border border-purple-500/40 text-slate-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">已複製到剪貼簿</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>複製完整 HTML</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-3.5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>直接下載 index.html</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-lg bg-[#08060f] border border-purple-500/25 text-xs font-mono text-slate-300 overflow-x-auto max-h-[520px] leading-relaxed select-all">
              <code>{STANDALONE_HTML_SOURCE}</code>
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
