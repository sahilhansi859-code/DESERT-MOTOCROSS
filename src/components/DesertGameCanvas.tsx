import React, { useEffect, useRef } from 'react';
import { BikeConfig, Particle, StuntEvent, OutType, WeatherType, WeatherState, StuntStats } from '../types';
import { DesertTerrain } from '../game/terrain';
import { BikePhysics, ControlsState } from '../game/physics';
import { soundFX } from '../game/audio';
import { getThemeForLevel, EnvironmentTheme } from '../game/themes';
import { WeatherManager } from '../game/weather';
import { renderCompleteBike } from '../game/bikeRenderers';

interface Props {
  bikeConfig: BikeConfig;
  terrain: DesertTerrain;
  physics: BikePhysics;
  controls: ControlsState;
  gameState: 'playing' | 'crashed' | 'level_completed' | 'menu';
  isPaused?: boolean;
  onCrash: (reason: string, outType: OutType, timeTaken?: number) => void;
  onLevelComplete: (timeSec: number, score: number, stuntXp?: number, stuntStats?: StuntStats) => void;
  onUpdateStats: (
    speedKmh: number,
    rpm: number,
    fuel: number,
    nitro: number,
    distance: number,
    score: number,
    coins: number,
    timeRemaining?: number,
    weather?: WeatherState,
    stunts?: StuntStats
  ) => void;
}

// Pre-cache all active stage background photos immediately so they are available without delay
const STAGE_IMAGES_CACHE: Record<number, HTMLImageElement> = {};
const ACTIVE_STAGE_IDS = [1, 2, 4, 5, 6, 7, 8];

if (typeof window !== 'undefined') {
  ACTIVE_STAGE_IDS.forEach((id) => {
    const img = new Image();
    img.src = `/stages/stage${id}.jpg`;
    STAGE_IMAGES_CACHE[id] = img;
  });
}

export const DesertGameCanvas: React.FC<Props> = ({
  bikeConfig,
  terrain,
  physics,
  controls,
  gameState,
  isPaused = false,
  onCrash,
  onLevelComplete,
  onUpdateStats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const stageImagesRef = useRef<Record<number, HTMLImageElement>>({});
  const startTimeRef = useRef<number>(Date.now());
  const hasCompletedRef = useRef<boolean>(false);
  const gameStateRef = useRef(gameState);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Weather Manager (locked to clear skies, no dynamic changes)
  const weatherRef = useRef<WeatherManager>(new WeatherManager(terrain.levelId, terrain.isEndless));

  // Camera smooth state
  const cameraRef = useRef({ x: 0, y: 300, zoom: 1 });

  // Keep controls and callbacks in refs so render loop stays stable at 60fps without tearing down
  const controlsRef = useRef<ControlsState>(controls);
  const onCrashRef = useRef(onCrash);
  const onLevelCompleteRef = useRef(onLevelComplete);
  const onUpdateStatsRef = useRef(onUpdateStats);

  useEffect(() => {
    weatherRef.current.reset(terrain.levelId, terrain.isEndless);
  }, [terrain.levelId, terrain.isEndless]);

  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  useEffect(() => {
    onCrashRef.current = onCrash;
    onLevelCompleteRef.current = onLevelComplete;
    onUpdateStatsRef.current = onUpdateStats;
  });

  // Preload all photographic stage backgrounds (matching the stage photos shown in Desert Stages)
  useEffect(() => {
    const activeStageIds = [1, 2, 4, 5, 6, 7, 8];
    activeStageIds.forEach((i) => {
      const img = new Image();
      img.src = `/stages/stage${i}.jpg`;
      img.onload = () => {
        stageImagesRef.current[i] = img;
      };
    });
    const defImg = new Image();
    defImg.src = `/stages/stage${terrain.levelId || 1}.jpg`;
    defImg.onload = () => {
      bgImageRef.current = defImg;
    };
  }, [terrain.levelId]);

  useEffect(() => {
    if (gameState === 'playing') {
      hasCompletedRef.current = false;
      startTimeRef.current = Date.now();
      cameraRef.current.x = physics.cx;
      cameraRef.current.y = physics.cy - 15;
    }
  }, [gameState, terrain.levelId, terrain.isEndless]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let lastStatsSync = 0;

    const render = (now: number) => {
      // Cap dt strictly at 0.032 (~30fps drop) so physics never explodes if frame takes long
      const dt = Math.min(0.032, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Handle canvas resize
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Update dynamic desert weather (sandstorms, sun glare, friction, wind, visibility)
      const weatherState = weatherRef.current.update(dt, physics.cx, terrain.levelLength);
      const currentControls = controlsRef.current;

      // Physics update: strictly ONLY when actively playing (not menu, not paused, not crashed)
      const isPlaying = gameStateRef.current === 'playing' && !isPausedRef.current && !physics.isCrashed;
      if (isPlaying) {
        const subSteps = 2;
        for (let s = 0; s < subSteps; s++) {
          physics.update(currentControls, dt / subSteps, weatherState);
        }
      } else if (gameStateRef.current === 'playing' && isPausedRef.current && !physics.isCrashed) {
        // Paused state: keep bike engine idling audibly and sound effects active!
        soundFX.updateEngine(0, false, false, true);
        soundFX.stopWeatherAmbience();
      } else {
        // Keep bike engine sound silent when on menus or crashed
        soundFX.updateEngine(0, false, false, false);
        soundFX.stopWeatherAmbience();
      }

      // Update endless terrain generation if needed
      terrain.ensureEndlessArea(physics.cx);

      // Check level finish line
      if (!terrain.isEndless && !hasCompletedRef.current && physics.cx >= terrain.levelLength - 100) {
        hasCompletedRef.current = true;
        const totalTime = Math.max(1, Math.round(physics.elapsedTime || (Date.now() - startTimeRef.current) / 1000));
        soundFX.playLevelWin();
        onLevelCompleteRef.current(totalTime, physics.score, physics.stuntXp, physics.getStuntStats());
      }

      // Check crash / rider out / fuel out / time out callback
      if (physics.isCrashed && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        const totalTime = Math.max(1, Math.round(physics.elapsedTime || (Date.now() - startTimeRef.current) / 1000));
        onCrashRef.current(physics.crashReason, physics.outType || 'crash_out', totalTime);
      }

      // Sync stats up to HUD smoothly (~15 updates/sec to prevent React re-render thrashing)
      if (now - lastStatsSync > 60) {
        lastStatsSync = now;
        onUpdateStatsRef.current(
          physics.speedKmh,
          physics.rpm,
          physics.fuel,
          physics.nitro,
          physics.distanceTraveled,
          physics.score,
          physics.coins,
          physics.timeRemaining,
          weatherState,
          physics.getStuntStats()
        );
      }

      // Stable camera zoom based on speed
      const targetZoom = Math.max(0.82, 0.96 - (physics.speedKmh / 140) * 0.12);
      cameraRef.current.zoom += (targetZoom - cameraRef.current.zoom) * 0.05;
      const zoom = cameraRef.current.zoom;

      // Bike starts near the beginning (left side) of the screen and can move forward up to 58% (50%-65% range) of the screen width
      const bikeStartScreenX = Math.max(75, width * 0.14);
      const maxBikeScreenX = width * 0.58;
      const maxWorldOffset = Math.max(0, (maxBikeScreenX - bikeStartScreenX) / zoom);

      // Vertical camera tracking: anchored primarily to road height so when bike jumps high it visibly goes UP above the road and comes back down onto the road
      const groundAtBike = terrain.getHeight(physics.cx);
      const airOffset = Math.min(0, physics.cy - (groundAtBike - 34));
      const targetCamY = (groundAtBike - 48) + airOffset * 0.22;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.14;

      // Horizontal camera clamping:
      // - Bike starts at bikeStartScreenX (when camX === physics.cx)
      // - As bike drives forward, it moves across the screen up to 70% (maxBikeScreenX), and never goes past 70%
      if (physics.cx - cameraRef.current.x > maxWorldOffset) {
        cameraRef.current.x = physics.cx - maxWorldOffset;
      } else if (physics.cx < cameraRef.current.x) {
        cameraRef.current.x = physics.cx;
      }

      const camX = cameraRef.current.x;
      const camY = cameraRef.current.y;

      // Active Environment Theme (unique across 30 levels)
      const currentTheme = getThemeForLevel(terrain.levelId, terrain.isEndless, camX);

      // Clear screen
      ctx.clearRect(0, 0, width, height);

      // 1. Render Sky & Parallax Desert Background (matches selected stage photo)
      renderBackground(ctx, width, height, camX, camY, currentTheme, terrain.levelId);

      // Transform context for World coordinates
      ctx.save();
      ctx.translate(bikeStartScreenX, height * 0.72);
      ctx.scale(zoom, zoom);
      ctx.translate(-camX, -camY);

      // 2. Render Checkpoints & Finish Banner
      renderCheckpointsAndFinish(ctx, terrain);

      // 3. Render Collectibles (Coins, Fuel, Nitro)
      renderCollectibles(ctx, terrain, now);

      // 4. Render Desert Terrain Ground (colored dynamically according to stage theme)
      renderTerrain(ctx, terrain, camX, width, height, zoom, currentTheme);

      // 5. Spawn & Render Particles (Tire Sand Roost, Nitro Flames, Sparks)
      handleParticles(ctx, physics, currentControls, dt, currentTheme);

      // 6. Render Dirt Bike and Rider
      renderBikeAndRider(ctx, physics, currentControls);

      // 7. Render Floating Stunt Popups in World space
      renderStuntText(ctx, physics.stunts, physics.cx, physics.cy);

      ctx.restore();

      // 8. Screen-Space Crash Out / Rider Out / Fuel Out / Time Out Impact Alert
      if (physics.isCrashed) {
        ctx.save();
        const isTimeOut = physics.outType === 'time_out';
        const isFuelOut = physics.outType === 'fuel_out';
        const isRiderOut = physics.outType === 'rider_out';
        const vignette = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.75);
        vignette.addColorStop(0, 'rgba(0,0,0,0.1)');
        vignette.addColorStop(
          1,
          isTimeOut
            ? 'rgba(225, 29, 72, 0.75)'
            : isFuelOut
            ? 'rgba(180, 83, 9, 0.65)'
            : isRiderOut
            ? 'rgba(234, 88, 12, 0.7)'
            : 'rgba(220, 38, 38, 0.7)'
        );
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const mainText = isTimeOut
          ? '⏱️ TIME OUT!'
          : isFuelOut
          ? '⛽ FUEL OUT!'
          : isRiderOut
          ? '👤 RIDER OUT!'
          : '💥 CRASHED OUT!';
        const mainColor = isTimeOut ? '#f43f5e' : isFuelOut ? '#fbbf24' : isRiderOut ? '#fb923c' : '#ef4444';
        const subText = isTimeOut
          ? 'STAGE TIME EXPIRED'
          : isFuelOut
          ? ''
          : isRiderOut
          ? ''
          : 'BIKE CRASHED';

        // Background shadow & bold title
        ctx.font = '900 38px sans-serif';
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(mainText, width / 2, height * 0.36);
        ctx.fillStyle = mainColor;
        ctx.fillText(mainText, width / 2, height * 0.36);

        // Subtitle (if available)
        if (subText) {
          ctx.font = '900 16px sans-serif';
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#000000';
          ctx.strokeText(subText, width / 2, height * 0.36 + 38);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(subText, width / 2, height * 0.36 + 38);
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      soundFX.stopEngine();
    };
  }, [bikeConfig, terrain, physics, gameState]);

  // Helper for rendering atmospheric stars, auroras, and embers
  const renderAtmosphere = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    camX: number,
    camY: number,
    theme: EnvironmentTheme
  ) => {
    // 1. Shimmering Starlight Field
    if (theme.hasStars) {
      ctx.save();
      const starCount = 65;
      for (let i = 0; i < starCount; i++) {
        // Deterministic pseudo-random positions based on star index
        const sx = ((i * 137.5 + camX * 0.008) % w + w) % w;
        const sy = (i * 93.7) % (h * 0.65) - camY * 0.005;
        const twinkle = Math.sin(Date.now() * 0.003 + i * 1.5) * 0.35 + 0.65;
        const radius = (i % 5 === 0) ? 2.2 : (i % 2 === 0 ? 1.4 : 0.9);

        ctx.fillStyle = i % 7 === 0 ? '#67e8f9' : (i % 11 === 0 ? '#fbcfe8' : '#ffffff');
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Star 4-point twinkle cross on brightest stars
        if (i % 8 === 0) {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(sx - 4, sy);
          ctx.lineTo(sx + 4, sy);
          ctx.moveTo(sx, sy - 4);
          ctx.lineTo(sx, sy + 4);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 2. Cosmic Twilight Auroras
    if (theme.hasAuroras) {
      ctx.save();
      const time = Date.now() * 0.0008;
      for (let a = 0; a < 2; a++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= w; x += 40) {
          const waveY = h * 0.22 + Math.sin(x * 0.005 + time + a) * 35 + Math.cos(x * 0.002 - time) * 20;
          ctx.lineTo(x, waveY);
        }
        ctx.lineTo(w, 0);
        ctx.closePath();
        const auraGrad = ctx.createLinearGradient(0, 0, 0, h * 0.38);
        if (a === 0) {
          auraGrad.addColorStop(0, 'rgba(168, 85, 247, 0.18)');
          auraGrad.addColorStop(0.6, 'rgba(192, 132, 252, 0.08)');
          auraGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
        } else {
          auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
          auraGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.06)');
          auraGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
        }
        ctx.fillStyle = auraGrad;
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Floating Volcanic / Solar Embers
    if (theme.hasEmbers) {
      ctx.save();
      const emberTime = Date.now() * 0.002;
      for (let e = 0; e < 24; e++) {
        const ex = ((e * 89 + emberTime * 25 - camX * 0.06) % (w + 100) + (w + 100)) % (w + 100) - 50;
        const ey = (h * 0.85 - ((e * 47 + emberTime * 45) % (h * 0.75))) - camY * 0.03;
        const eSize = 1.5 + (e % 3);
        const eAlpha = 0.4 + Math.sin(emberTime * 3 + e) * 0.35;

        ctx.fillStyle = e % 2 === 0 ? '#fbbf24' : '#ef4444';
        ctx.globalAlpha = Math.max(0.1, eAlpha);
        ctx.beginPath();
        ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Heavy Windblown Sandstorm Dust
    if (theme.hasDustParticles) {
      ctx.save();
      const stormTime = Date.now() * 0.003;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.28)';
      for (let d = 0; d < 35; d++) {
        const dx = ((d * 97 - stormTime * 220 - camX * 0.15) % (w + 120) + (w + 120)) % (w + 120) - 60;
        const dy = (d * 51) % h - camY * 0.04;
        const dLen = 14 + (d % 18);
        ctx.fillRect(dx, dy, dLen, 2);
      }
      ctx.restore();
    }
  };

  // Helper for rendering celestial bodies (Suns, Moons, Eclipses, Binary Stars)
  const renderCelestial = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    camX: number,
    camY: number,
    theme: EnvironmentTheme
  ) => {
    const sunX = w * 0.74 - (camX * 0.02) % (w * 0.35);
    const sunY = h * 0.23 - (camY * 0.02);

    ctx.save();

    switch (theme.celestialType) {
      case 'sunset_sun': {
        // Classic Warm Sunset Golden Corona
        const sunCorona = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 140);
        sunCorona.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        sunCorona.addColorStop(0.2, 'rgba(254, 240, 138, 0.85)');
        sunCorona.addColorStop(0.5, 'rgba(249, 115, 22, 0.35)');
        sunCorona.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = sunCorona;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
        ctx.fill();

        // Sun disk
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'morning_sun': {
        // Crisp Rising Oasis Morning Sun with Emerald/Cyan Sheen
        const mCorona = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 160);
        mCorona.addColorStop(0, 'rgba(255, 255, 255, 1)');
        mCorona.addColorStop(0.2, 'rgba(254, 240, 138, 0.9)');
        mCorona.addColorStop(0.5, 'rgba(45, 212, 191, 0.3)');
        mCorona.addColorStop(1, 'rgba(13, 148, 136, 0)');
        ctx.fillStyle = mCorona;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'canyon_sun': {
        // Blazing Canyon Sun with Heat Shimmer Corona
        const cCorona = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 150);
        cCorona.addColorStop(0, 'rgba(255, 255, 255, 1)');
        cCorona.addColorStop(0.25, 'rgba(254, 215, 170, 0.9)');
        cCorona.addColorStop(0.6, 'rgba(239, 68, 68, 0.45)');
        cCorona.addColorStop(1, 'rgba(185, 28, 28, 0)');
        ctx.fillStyle = cCorona;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 150, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff7ed';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'crescent_moon': {
        // Mystical Silver/Lavender Twilight Crescent Moon
        const mCorona = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 95);
        mCorona.addColorStop(0, 'rgba(243, 232, 255, 0.8)');
        mCorona.addColorStop(0.4, 'rgba(192, 132, 252, 0.35)');
        mCorona.addColorStop(1, 'rgba(126, 34, 206, 0)');
        ctx.fillStyle = mCorona;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 95, 0, Math.PI * 2);
        ctx.fill();

        // Crescent moon body
        ctx.fillStyle = '#faf5ff';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
        ctx.fill();
        // Cutout shadow to create sharp crescent
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(sunX + 11, sunY - 5, 23, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'full_moon': {
        // Majestic Midnight Full Moon with Crater Detailing & Cyan Halo
        const fCorona = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 130);
        fCorona.addColorStop(0, 'rgba(240, 249, 255, 0.9)');
        fCorona.addColorStop(0.3, 'rgba(186, 230, 253, 0.55)');
        fCorona.addColorStop(0.7, 'rgba(56, 189, 248, 0.22)');
        fCorona.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = fCorona;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 130, 0, Math.PI * 2);
        ctx.fill();

        // Lunar disk
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
        ctx.fill();

        // Lunar craters (subtle grey craters)
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(sunX - 10, sunY - 6, 6, 0, Math.PI * 2);
        ctx.arc(sunX + 12, sunY + 8, 7, 0, Math.PI * 2);
        ctx.arc(sunX + 2, sunY + 14, 4, 0, Math.PI * 2);
        ctx.arc(sunX - 14, sunY + 12, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'storm_sun': {
        // Blood-Orange Sun fighting through swirling sandstorm
        const sCorona = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 120);
        sCorona.addColorStop(0, 'rgba(254, 215, 170, 0.85)');
        sCorona.addColorStop(0.4, 'rgba(234, 88, 12, 0.4)');
        sCorona.addColorStop(1, 'rgba(120, 53, 15, 0)');
        ctx.fillStyle = sCorona;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(249, 115, 22, 0.9)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'solar_eclipse': {
        // Total Solar Eclipse: Diamond Ring Corona & Pitch Black Moon
        const corona = ctx.createRadialGradient(sunX, sunY, 26, sunX, sunY, 160);
        corona.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        corona.addColorStop(0.3, 'rgba(234, 179, 8, 0.6)');
        corona.addColorStop(0.7, 'rgba(202, 138, 4, 0.25)');
        corona.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering Eclipse Corona Spikes
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 16; i++) {
          const ang = (i * Math.PI) / 8 + Date.now() * 0.0004;
          const len = 35 + ((i * 17) % 25);
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(ang) * 29, sunY + Math.sin(ang) * 29);
          ctx.lineTo(sunX + Math.cos(ang) * (29 + len), sunY + Math.sin(ang) * (29 + len));
          ctx.stroke();
        }

        // Black Moon Disk blocking the sun
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 29, 0, Math.PI * 2);
        ctx.fill();

        // Diamond Ring Effect Flare at edge
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sunX + 22, sunY - 18, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
        ctx.beginPath();
        ctx.arc(sunX + 22, sunY - 18, 12, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'celestial_overlord': {
        // Dual Binary Suns: One Imperial Golden, One Royal Ruby
        // Sun 1: Grand Golden Star
        const gCorona = ctx.createRadialGradient(sunX - 25, sunY + 8, 10, sunX - 25, sunY + 8, 140);
        gCorona.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gCorona.addColorStop(0.3, 'rgba(253, 224, 71, 0.85)');
        gCorona.addColorStop(0.7, 'rgba(245, 158, 11, 0.35)');
        gCorona.addColorStop(1, 'rgba(217, 119, 6, 0)');
        ctx.fillStyle = gCorona;
        ctx.beginPath();
        ctx.arc(sunX - 25, sunY + 8, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sunX - 25, sunY + 8, 28, 0, Math.PI * 2);
        ctx.fill();

        // Sun 2: Royal Ruby Star
        const rCorona = ctx.createRadialGradient(sunX + 38, sunY - 18, 8, sunX + 38, sunY - 18, 100);
        rCorona.addColorStop(0, 'rgba(254, 205, 211, 1)');
        rCorona.addColorStop(0.3, 'rgba(244, 63, 94, 0.8)');
        rCorona.addColorStop(0.7, 'rgba(190, 18, 60, 0.35)');
        rCorona.addColorStop(1, 'rgba(136, 19, 55, 0)');
        ctx.fillStyle = rCorona;
        ctx.beginPath();
        ctx.arc(sunX + 38, sunY - 18, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff1f2';
        ctx.beginPath();
        ctx.arc(sunX + 38, sunY - 18, 20, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  };

  // Helper for rendering far parallax landmarks (Pyramids, Monoliths, Temples, Palaces)
  const renderFarLandmarks = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    camX: number,
    camY: number,
    theme: EnvironmentTheme
  ) => {
    const farOffsetX = -(camX * 0.04) % (w * 1.8);
    const horizonY = h * 0.68 - camY * 0.03;

    ctx.save();
    for (let loop = -1; loop <= 1; loop++) {
      const baseX = farOffsetX + loop * w * 1.8;

      switch (theme.farLandmark) {
        case 'pyramids': {
          // Great Egyptian Pyramids with 3D shaded facets & sandstone mesas
          ctx.fillStyle = theme.farColor;
          ctx.beginPath();
          ctx.moveTo(baseX + 120, horizonY);
          ctx.lineTo(baseX + 280, horizonY - 140);
          ctx.lineTo(baseX + 440, horizonY);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = theme.farColorShade;
          ctx.beginPath();
          ctx.moveTo(baseX + 280, horizonY - 140);
          ctx.lineTo(baseX + 440, horizonY);
          ctx.lineTo(baseX + 310, horizonY);
          ctx.closePath();
          ctx.fill();

          // Second smaller pyramid
          ctx.fillStyle = theme.farColor;
          ctx.beginPath();
          ctx.moveTo(baseX + 410, horizonY);
          ctx.lineTo(baseX + 520, horizonY - 95);
          ctx.lineTo(baseX + 630, horizonY);
          ctx.closePath();
          ctx.fill();

          // Sandstone flat-top mesa
          ctx.fillStyle = theme.farColorShade;
          ctx.beginPath();
          ctx.moveTo(baseX + 780, horizonY);
          ctx.lineTo(baseX + 830, horizonY - 70);
          ctx.lineTo(baseX + 1040, horizonY - 70);
          ctx.lineTo(baseX + 1090, horizonY);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'oasis_groves': {
          // Oasis Limestone Bluffs & Silhouetted Palm Forests
          ctx.fillStyle = theme.farColor;
          ctx.beginPath();
          ctx.moveTo(baseX + 80, horizonY);
          ctx.bezierCurveTo(baseX + 200, horizonY - 90, baseX + 400, horizonY - 60, baseX + 560, horizonY);
          ctx.bezierCurveTo(baseX + 700, horizonY - 120, baseX + 920, horizonY - 40, baseX + 1120, horizonY);
          ctx.closePath();
          ctx.fill();

          // Oasis palm canopy silhouettes on bluffs
          ctx.fillStyle = theme.farColorShade;
          const palms = [240, 310, 360, 420, 780, 840, 900];
          palms.forEach((px) => {
            const py = horizonY - 65;
            ctx.fillRect(baseX + px - 2, py, 4, 30);
            ctx.beginPath();
            ctx.arc(baseX + px, py, 14, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case 'canyon_monoliths': {
          // Monument Valley Red Sandstone Buttes, Mesas & Natural Arches
          ctx.fillStyle = theme.farColor;
          // Butte 1 (Steep tower)
          ctx.beginPath();
          ctx.moveTo(baseX + 180, horizonY);
          ctx.lineTo(baseX + 220, horizonY - 130);
          ctx.lineTo(baseX + 290, horizonY - 130);
          ctx.lineTo(baseX + 330, horizonY);
          ctx.closePath();
          ctx.fill();

          // Butte 2 with shade
          ctx.fillStyle = theme.farColorShade;
          ctx.beginPath();
          ctx.moveTo(baseX + 460, horizonY);
          ctx.lineTo(baseX + 510, horizonY - 160);
          ctx.lineTo(baseX + 660, horizonY - 160);
          ctx.lineTo(baseX + 710, horizonY);
          ctx.closePath();
          ctx.fill();

          // Natural Arch silhouette
          ctx.fillStyle = theme.farColor;
          ctx.beginPath();
          ctx.moveTo(baseX + 880, horizonY);
          ctx.lineTo(baseX + 900, horizonY - 110);
          ctx.lineTo(baseX + 1040, horizonY - 110);
          ctx.lineTo(baseX + 1060, horizonY);
          ctx.lineTo(baseX + 1010, horizonY);
          ctx.bezierCurveTo(baseX + 990, horizonY - 75, baseX + 950, horizonY - 75, baseX + 930, horizonY);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'ancient_obelisks': {
          // Mystical Obelisks & Twilight Mountain Ridges
          ctx.fillStyle = theme.farColor;
          ctx.beginPath();
          ctx.moveTo(baseX + 50, horizonY);
          ctx.lineTo(baseX + 240, horizonY - 150);
          ctx.lineTo(baseX + 420, horizonY - 50);
          ctx.lineTo(baseX + 620, horizonY - 170);
          ctx.lineTo(baseX + 800, horizonY);
          ctx.closePath();
          ctx.fill();

          // Ancient Obelisk Pillars
          ctx.fillStyle = theme.farColorShade;
          const obelisks = [180, 520, 940];
          obelisks.forEach((ox) => {
            ctx.beginPath();
            ctx.moveTo(baseX + ox - 8, horizonY);
            ctx.lineTo(baseX + ox - 4, horizonY - 145);
            ctx.lineTo(baseX + ox, horizonY - 165); // Pointed capstone
            ctx.lineTo(baseX + ox + 4, horizonY - 145);
            ctx.lineTo(baseX + ox + 8, horizonY);
            ctx.closePath();
            ctx.fill();
          });
          break;
        }

        case 'starlight_temples': {
          // Colossal Egyptian Pylons & Temple Ruins under the stars
          ctx.fillStyle = theme.farColor;
          // Pylon tower left
          ctx.beginPath();
          ctx.moveTo(baseX + 200, horizonY);
          ctx.lineTo(baseX + 215, horizonY - 135);
          ctx.lineTo(baseX + 275, horizonY - 135);
          ctx.lineTo(baseX + 290, horizonY);
          ctx.closePath();
          ctx.fill();

          // Pylon tower right
          ctx.beginPath();
          ctx.moveTo(baseX + 340, horizonY);
          ctx.lineTo(baseX + 355, horizonY - 135);
          ctx.lineTo(baseX + 415, horizonY - 135);
          ctx.lineTo(baseX + 430, horizonY);
          ctx.closePath();
          ctx.fill();

          // Temple Colonnade
          ctx.fillStyle = theme.farColorShade;
          for (let col = 0; col < 6; col++) {
            ctx.fillRect(baseX + 620 + col * 45, horizonY - 90, 14, 90);
          }
          // Architrave top
          ctx.fillRect(baseX + 605, horizonY - 102, 290, 12);
          break;
        }

        case 'storm_hoodoos': {
          // Wind-sculpted sand towers, hoodoos and balanced rocks
          ctx.fillStyle = theme.farColor;
          const hoodoos = [160, 420, 720, 1020];
          hoodoos.forEach((hx, idx) => {
            const hH = 110 + (idx % 3) * 35;
            ctx.beginPath();
            ctx.moveTo(baseX + hx - 14, horizonY);
            ctx.bezierCurveTo(baseX + hx - 4, horizonY - hH * 0.4, baseX + hx - 6, horizonY - hH * 0.8, baseX + hx - 18, horizonY - hH);
            ctx.lineTo(baseX + hx + 18, horizonY - hH);
            ctx.bezierCurveTo(baseX + hx + 6, horizonY - hH * 0.8, baseX + hx + 4, horizonY - hH * 0.4, baseX + hx + 14, horizonY);
            ctx.closePath();
            ctx.fill();

            // Balanced capstone rock
            ctx.fillStyle = theme.farColorShade;
            ctx.beginPath();
            ctx.arc(baseX + hx, horizonY - hH - 8, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = theme.farColor;
          });
          break;
        }

        case 'volcanic_spires': {
          // Jagged Obsidian Basalt Peaks & Volcanic Ridges
          ctx.fillStyle = theme.farColor;
          ctx.beginPath();
          ctx.moveTo(baseX + 100, horizonY);
          ctx.lineTo(baseX + 240, horizonY - 165);
          ctx.lineTo(baseX + 340, horizonY - 80);
          ctx.lineTo(baseX + 480, horizonY - 190);
          ctx.lineTo(baseX + 590, horizonY - 90);
          ctx.lineTo(baseX + 760, horizonY - 175);
          ctx.lineTo(baseX + 900, horizonY);
          ctx.closePath();
          ctx.fill();

          // Shadow spires
          ctx.fillStyle = theme.farColorShade;
          ctx.beginPath();
          ctx.moveTo(baseX + 480, horizonY - 190);
          ctx.lineTo(baseX + 530, horizonY - 90);
          ctx.lineTo(baseX + 590, horizonY - 90);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'overlord_palace': {
          // Grand Championship Citadel, Royal Palace Domes & Spired Towers
          ctx.fillStyle = theme.farColor;
          // Main palace block
          ctx.fillRect(baseX + 320, horizonY - 110, 260, 110);

          // Central Grand Golden Onion Dome
          ctx.fillStyle = theme.farColorShade;
          ctx.beginPath();
          ctx.arc(baseX + 450, horizonY - 125, 45, Math.PI, 0);
          ctx.lineTo(baseX + 450, horizonY - 185); // Dome tip spire
          ctx.closePath();
          ctx.fill();

          // Left Minaret Tower
          ctx.fillStyle = theme.farColor;
          ctx.fillRect(baseX + 280, horizonY - 170, 22, 170);
          ctx.beginPath();
          ctx.arc(baseX + 291, horizonY - 170, 11, Math.PI, 0);
          ctx.fill();

          // Right Minaret Tower
          ctx.fillRect(baseX + 598, horizonY - 170, 22, 170);
          ctx.beginPath();
          ctx.arc(baseX + 609, horizonY - 170, 11, Math.PI, 0);
          ctx.fill();
          break;
        }
      }
    }
    ctx.restore();
  };

  // Helper for rendering soaring birds, bats, shooting stars, and cosmic wisps
  const renderAerials = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    camX: number,
    _camY: number,
    theme: EnvironmentTheme
  ) => {
    const time = Date.now() * 0.001;
    ctx.save();

    switch (theme.aerialType) {
      case 'falcons':
      case 'hawks': {
        ctx.strokeStyle = theme.farColorShade;
        ctx.lineWidth = 2.2;
        for (let b = 0; b < 3; b++) {
          const bx = ((w * 0.3 + b * 90 + time * 18 - camX * 0.03) % (w + 200) + (w + 200)) % (w + 200) - 100;
          const by = h * 0.28 + Math.sin(time + b) * 15 + b * 22;
          const wingFlap = Math.sin(time * 4 + b) * 4;
          ctx.beginPath();
          ctx.moveTo(bx - 12, by + wingFlap);
          ctx.quadraticCurveTo(bx - 6, by - 5, bx, by);
          ctx.quadraticCurveTo(bx + 6, by - 5, bx + 12, by + wingFlap);
          ctx.stroke();
        }
        break;
      }

      case 'oasis_herons': {
        // Graceful long-necked white/teal herons
        ctx.strokeStyle = 'rgba(240, 253, 250, 0.75)';
        ctx.lineWidth = 2.4;
        for (let b = 0; b < 2; b++) {
          const bx = ((w * 0.2 + b * 140 + time * 24 - camX * 0.03) % (w + 240) + (w + 240)) % (w + 240) - 120;
          const by = h * 0.24 + Math.sin(time * 0.8 + b) * 12 + b * 28;
          const flap = Math.sin(time * 3 + b) * 6;
          ctx.beginPath();
          ctx.moveTo(bx - 18, by + flap);
          ctx.quadraticCurveTo(bx - 8, by - 6, bx, by);
          ctx.quadraticCurveTo(bx + 8, by - 6, bx + 18, by + flap);
          ctx.stroke();
        }
        break;
      }

      case 'night_bats': {
        // Quick darting twilight bats
        ctx.fillStyle = 'rgba(88, 28, 135, 0.85)';
        for (let b = 0; b < 4; b++) {
          const bx = ((w * 0.4 + b * 80 + time * 32 - camX * 0.04) % (w + 160) + (w + 160)) % (w + 160) - 80;
          const by = h * 0.32 + Math.sin(time * 3 + b * 2) * 20 + b * 18;
          const wing = Math.sin(time * 12 + b) * 6;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - 9, by - wing);
          ctx.lineTo(bx - 4, by + 2);
          ctx.lineTo(bx + 4, by + 2);
          ctx.lineTo(bx + 9, by - wing);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'shooting_stars': {
        // Luminous shooting star streak across midnight cosmos
        const meteorCycle = (Date.now() * 0.0006) % 3.5;
        if (meteorCycle < 1.0) {
          const progress = meteorCycle;
          const mx = w * 0.25 + progress * 400;
          const my = h * 0.08 + progress * 150;
          const tailLen = 90;
          const starGrad = ctx.createLinearGradient(mx - tailLen, my - tailLen * 0.38, mx, my);
          starGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          starGrad.addColorStop(0.7, 'rgba(186, 230, 253, 0.7)');
          starGrad.addColorStop(1, '#ffffff');
          ctx.strokeStyle = starGrad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(mx - tailLen, my - tailLen * 0.38);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
        break;
      }

      case 'storm_debris': {
        // Wind-whipped tumbleweed rolling through the air in sandstorm
        const tumbleX = ((time * 180) % (w + 100)) - 50;
        const tumbleY = h * 0.48 + Math.sin(time * 4) * 25;
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(tumbleX, tumbleY, 12, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'cosmic_wisps': {
        // Shimmering celestial light motes
        for (let wisp = 0; wisp < 8; wisp++) {
          const wx = ((wisp * 140 + Math.sin(time + wisp) * 40 - camX * 0.02) % w + w) % w;
          const wy = h * 0.25 + Math.cos(time * 1.5 + wisp) * 30;
          ctx.fillStyle = wisp % 2 === 0 ? 'rgba(253, 224, 71, 0.65)' : 'rgba(244, 63, 94, 0.65)';
          ctx.beginPath();
          ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
    }
    ctx.restore();
  };

  // Background rendering with rich photographic desert stages matching the stages photos
  const renderBackground = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    camX: number,
    camY: number,
    theme: EnvironmentTheme,
    levelId: number = 1
  ) => {
    const stageImg =
      STAGE_IMAGES_CACHE[levelId] || stageImagesRef.current[levelId] || STAGE_IMAGES_CACHE[1] || bgImageRef.current;

    if (stageImg && stageImg.complete && stageImg.naturalWidth > 0) {
      // 1. Photographic Desert Stage Background perfectly matching stage photo
      const aspect = stageImg.naturalWidth / stageImg.naturalHeight; // 1280 / 720 ≈ 1.778
      const roadScreenY = h * 0.72; // Road line positioned at top 72% of screen (between 70% and 75%)
      const imgHeight = Math.max(h * 1.15, roadScreenY / 0.70);
      const imgWidth = imgHeight * aspect;

      // Parallax scroll speed (distant desert horizon moves smoothly with bike motion)
      const parallaxSpeed = 0.08;
      const trackOffset = camX * parallaxSpeed;
      const step = imgWidth;

      // Vertical parallax with gentle damping so background moves naturally on jumps
      const vertParallax = -((camY - 320) * 0.035);
      const baseDrawY = roadScreenY - imgHeight * 0.70;
      const drawY = Math.min(0, Math.max(-imgHeight * 0.28, baseDrawY + vertParallax));

      const firstTile = Math.floor((trackOffset - w) / step);
      const lastTile = Math.ceil((trackOffset + w * 2) / step);

      for (let t = firstTile; t <= lastTile; t++) {
        const screenX = Math.floor(t * step - trackOffset);
        const tileW = Math.ceil(step) + 2;
        const isMirrored = Math.abs(t % 2) === 1;

        ctx.save();
        if (isMirrored) {
          // Mirror odd tiles horizontally so right edge meets right edge and left edge meets left edge seamlessly
          ctx.translate(screenX + tileW, drawY);
          ctx.scale(-1, 1);
          ctx.drawImage(stageImg, 0, 0, tileW, imgHeight);
        } else {
          ctx.drawImage(stageImg, screenX, drawY, tileW, imgHeight);
        }
        ctx.restore();
      }

      // Soft atmospheric mist/glow over tile joints to completely hide any reflection seam
      for (let t = firstTile; t <= lastTile + 1; t++) {
        const seamX = t * step - trackOffset;
        if (seamX >= -80 && seamX <= w + 80) {
          const seamBlend = ctx.createLinearGradient(seamX - 48, 0, seamX + 48, 0);
          seamBlend.addColorStop(0, 'rgba(245, 158, 11, 0)');
          seamBlend.addColorStop(0.5, 'rgba(251, 191, 36, 0.08)');
          seamBlend.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = seamBlend;
          ctx.fillRect(seamX - 48, 0, 96, h);
        }
      }

      // 2. Soft atmospheric transition where photo ground meets the rideable road (at 65%-76% screen height)
      // Keeps the sky and stage landmarks 100% crisp and vibrant, exactly as shown in stage photos
      const horizonBlend = ctx.createLinearGradient(0, h * 0.65, 0, h * 0.76);
      horizonBlend.addColorStop(0, 'rgba(0, 0, 0, 0)');
      horizonBlend.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
      ctx.fillStyle = horizonBlend;
      ctx.fillRect(0, h * 0.65, w, h * 0.11);

      // 3. Atmospheric floating particles (embers, dust motes, starlight) if theme provides
      if (theme.hasEmbers || theme.hasDustParticles || theme.hasStars) {
        renderAtmosphere(ctx, w, h, camX, camY, theme);
      }
    } else {
      // Fallback: procedural sky & dunes while image is loading
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      theme.skyStops.forEach(([stop, color]) => {
        skyGrad.addColorStop(stop, color);
      });
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      renderAtmosphere(ctx, w, h, camX, camY, theme);
      renderCelestial(ctx, w, h, camX, camY, theme);
      renderFarLandmarks(ctx, w, h, camX, camY, theme);
      renderAerials(ctx, w, h, camX, camY, theme);
    }
  };

  // Terrain: Desert road & dunes styled uniquely according to each stage
  const renderTerrain = (
    ctx: CanvasRenderingContext2D,
    trn: DesertTerrain,
    camX: number,
    w: number,
    _h: number,
    zoom: number,
    theme: EnvironmentTheme
  ) => {
    const viewWidth = (w / zoom) * 2.2;
    const startX = camX - viewWidth / 2 - 200;
    const endX = camX + viewWidth + 200;
    const step = 6; // Tight step for silky-smooth curves

    // 1. Stage-specific deep desert bedrock & road foundation below the track
    const terrainGrad = ctx.createLinearGradient(0, 180, 0, 1600);
    theme.terrainBedrockStops.forEach(([stop, color]) => {
      terrainGrad.addColorStop(stop, color);
    });

    ctx.beginPath();
    ctx.moveTo(startX, 1800);
    for (let x = startX; x <= endX; x += step) {
      const y = trn.getHeight(x);
      ctx.lineTo(x, y + 2);
    }
    ctx.lineTo(endX, 1800);
    ctx.closePath();
    ctx.fillStyle = terrainGrad;
    ctx.fill();

    // 1b. Stage-specific subsurface bedrock strata
    if (trn.levelId === 2) {
      // Dinosaur Badlands: Stratified canyon rock layers (chalk white and clay shale bands)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(startX, 1800);
      for (let x = startX; x <= endX; x += step) {
        ctx.lineTo(x, trn.getHeight(x) + 4);
      }
      ctx.lineTo(endX, 1800);
      ctx.closePath();
      ctx.clip();

      const strataSteps = [55, 120, 200, 310, 450];
      strataSteps.forEach((depth, idx) => {
        ctx.beginPath();
        for (let x = startX; x <= endX; x += 30) {
          const y = trn.getHeight(x) + depth + Math.sin(x * 0.015) * 10;
          if (x === startX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = idx % 2 === 0 ? 10 : 6;
        ctx.strokeStyle = idx % 2 === 0 ? 'rgba(241, 245, 249, 0.25)' : 'rgba(92, 74, 56, 0.35)';
        ctx.stroke();
      });
      ctx.restore();
    } else if (trn.levelId === 4) {
      // Meteor Crater: Glowing subterranean magma fissures in black basalt
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(startX, 1800);
      for (let x = startX; x <= endX; x += step) {
        ctx.lineTo(x, trn.getHeight(x) + 4);
      }
      ctx.lineTo(endX, 1800);
      ctx.closePath();
      ctx.clip();

      const magmaDepths = [45, 105, 190, 320];
      magmaDepths.forEach((depth, idx) => {
        ctx.beginPath();
        for (let x = startX; x <= endX; x += 40) {
          const y = trn.getHeight(x) + depth + Math.sin(x * 0.02 + idx) * 14;
          if (x === startX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = idx % 2 === 0 ? 'rgba(234, 88, 12, 0.35)' : 'rgba(249, 115, 22, 0.22)';
        ctx.stroke();
      });
      ctx.restore();
    }

    // 2. Road body shadow layer (stage-specific color)
    ctx.beginPath();
    for (let x = startX; x <= endX; x += step) {
      const y = trn.getHeight(x);
      if (x === startX) ctx.moveTo(x, y + 4);
      else ctx.lineTo(x, y + 4);
    }
    ctx.lineWidth = 14;
    ctx.strokeStyle = theme.duneShadowColor;
    ctx.stroke();

    // 3. Stage-specific Road Surface Layer where the bike rides
    ctx.beginPath();
    for (let x = startX; x <= endX; x += step) {
      const y = trn.getHeight(x);
      if (x === startX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 10;
    ctx.strokeStyle = theme.duneSurfaceColor;
    ctx.stroke();

    // 4. Luminous Road Ridge Highlight Line
    ctx.beginPath();
    for (let x = startX; x <= endX; x += step) {
      const y = trn.getHeight(x);
      if (x === startX) ctx.moveTo(x, y - 2);
      else ctx.lineTo(x, y - 2);
    }
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = theme.duneHighlightColor;
    ctx.stroke();

    // 5. Stage-Specific Road Surface Details ("Sadak")
    if (trn.levelId === 7) {
      // Stage 7 (Desert Oilfield Outpost): Paved Asphalt Highway with painted yellow center line
      ctx.save();
      ctx.beginPath();
      for (let x = startX; x <= endX; x += step) {
        const y = trn.getHeight(x);
        if (x === startX) ctx.moveTo(x, y + 1);
        else ctx.lineTo(x, y + 1);
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#facc15'; // Highway painted yellow dashed line
      ctx.setLineDash([14, 18]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Oil slick puddles on asphalt
      const oilStep = 75;
      const firstOil = Math.floor(startX / oilStep) * oilStep;
      for (let x = firstOil; x <= endX; x += oilStep) {
        const y = trn.getHeight(x);
        const angle = trn.getAngle(x);
        ctx.save();
        ctx.translate(x, y + 2);
        ctx.rotate(angle);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    } else if (trn.levelId === 2) {
      // Stage 2 (Dinosaur Fossil Badlands): Sun-baked dry clay road with earth fissures and fossil bone chips
      const crackStep = 38;
      const firstCrack = Math.floor(startX / crackStep) * crackStep;
      for (let x = firstCrack; x <= endX; x += crackStep) {
        const y = trn.getHeight(x);
        const angle = trn.getAngle(x);
        ctx.save();
        ctx.translate(x, y + 1);
        ctx.rotate(angle);
        ctx.strokeStyle = 'rgba(92, 74, 56, 0.65)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-5, -2);
        ctx.lineTo(0, 2.5);
        ctx.lineTo(5, -1);
        ctx.moveTo(0, 2.5);
        ctx.lineTo(-2, 6);
        ctx.stroke();

        // White fossil bone chips embedded in clay
        if (Math.sin(x * 4.3) > 0.35) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-3, 1, 5, 2.5);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(1, 2, 2, 2);
        }
        ctx.restore();
      }
    } else if (trn.levelId === 4) {
      // Stage 4 (Meteor Impact Basin): Volcanic basalt road with glowing molten magma veins & obsidian gravel
      const magmaStep = 32;
      const firstMagma = Math.floor(startX / magmaStep) * magmaStep;
      for (let x = firstMagma; x <= endX; x += magmaStep) {
        const y = trn.getHeight(x);
        const angle = trn.getAngle(x);
        ctx.save();
        ctx.translate(x, y + 1);
        ctx.rotate(angle);
        // Outer fiery glow
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-8, -1);
        ctx.lineTo(-2, 2);
        ctx.lineTo(3, -1);
        ctx.lineTo(8, 2);
        ctx.stroke();
        // Inner molten yellow core
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Obsidian shards
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-4, 3, 3, 3);
        ctx.restore();
      }
    } else if (trn.levelId === 5) {
      // Stage 5 (Skeleton Coast): Coastal ocean beach sand road with weathered wooden shipwreck planks
      const plankStep = 42;
      const firstPlank = Math.floor(startX / plankStep) * plankStep;
      for (let x = firstPlank; x <= endX; x += plankStep) {
        const y = trn.getHeight(x);
        const angle = trn.getAngle(x);
        ctx.save();
        ctx.translate(x, y + 1);
        ctx.rotate(angle);
        // Wooden plank
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-4, -1, 8, 4);
        // Wood grain highlight
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(-4, -1, 8, 1);
        // Rusted iron bolts
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-3, 0, 1.5, 1.5);
        ctx.fillRect(2, 0, 1.5, 1.5);

        // Sea foam bubbles along lower road edge
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(6, 4, 2, 0, Math.PI * 2);
        ctx.arc(-5, 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (trn.levelId === 6) {
      // Stage 6 (Wadi Rum Red Archways): Terracotta Martian red sandstone slickrock road
      const slickStep = 36;
      const firstSlick = Math.floor(startX / slickStep) * slickStep;
      for (let x = firstSlick; x <= endX; x += slickStep) {
        const y = trn.getHeight(x);
        const angle = trn.getAngle(x);
        ctx.save();
        ctx.translate(x, y + 2);
        ctx.rotate(angle);
        ctx.strokeStyle = 'rgba(127, 29, 29, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(12, 0);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(254, 202, 202, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(8, -2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (trn.levelId === 8) {
      // Stage 8 (Lost Bedouin Citadel): Ancient carved stone flagstone / cobblestone paver blocks
      const stoneStep = 24;
      const firstStone = Math.floor(startX / stoneStep) * stoneStep;
      for (let x = firstStone; x <= endX; x += stoneStep) {
        const y = trn.getHeight(x);
        const angle = trn.getAngle(x);
        ctx.save();
        ctx.translate(x, y + 1);
        ctx.rotate(angle);
        // Carved stone flagstone block
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-10, -2, 20, 6);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-9, -2, 18, 5);
        // Sand mortar joint gap
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-11, -2, 2, 6);
        // Carved chisel marks
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(-6, -1, 4, 1);
        ctx.fillRect(2, -1, 4, 1);
        ctx.restore();
      }
    } else {
      // Stage 1 (Valley of the Pharaohs / default): Golden desert sand dune road
      const trackStep = 18;
      const firstTrack = Math.floor(startX / trackStep) * trackStep;
      for (let x = firstTrack; x <= endX; x += trackStep) {
        const y = trn.getHeight(x);
        const angle = trn.getAngle(x);

        ctx.save();
        ctx.translate(x, y + 2);
        ctx.rotate(angle);

        // Knobby tire tread indentation
        ctx.fillStyle = theme.tireTrackColor;
        ctx.fillRect(-6, -1, 5, 2.5);
        ctx.fillRect(1, 0, 5, 2.5);

        // Tire track groove line
        ctx.strokeStyle = theme.tireTrackColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-trackStep / 2, 1);
        ctx.lineTo(trackStep / 2, 1);
        ctx.stroke();

        ctx.restore();
      }

      // Wind-blown ripples
      const rippleStep = 44;
      const firstRipple = Math.floor(startX / rippleStep) * rippleStep;
      for (let x = firstRipple; x <= endX; x += rippleStep) {
        const y = trn.getHeight(x);
        const angle = trn.getAngle(x);
        ctx.save();
        ctx.translate(x, y + 6);
        ctx.rotate(angle);
        ctx.strokeStyle = theme.sandRippleColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 6. Starting Rally Area: Desert staging pad (x < 220)
    if (startX <= 220) {
      ctx.save();
      // Checkered desert rally start line
      for (let i = 0; i < 6; i++) {
        const sqX = 140 + (i % 2) * 12;
        const sqY = trn.baseHeight - 2 + Math.floor(i / 2) * 6;
        ctx.fillStyle = (i % 2 === 0) ? '#000000' : '#ffffff';
        ctx.fillRect(sqX, sqY, 12, 6);
      }
      // "START" text
      ctx.fillStyle = theme.duneShadowColor;
      ctx.font = '900 11px sans-serif';
      ctx.fillText('🏁 START', 145, trn.baseHeight + 20);
      ctx.restore();
    }

    // 7. Desert scenery items styled per stage
    renderDesertScenery(ctx, trn, startX, endX);
  };

  // Desert details styled according to the photographic stage
  const renderDesertScenery = (
    ctx: CanvasRenderingContext2D,
    trn: DesertTerrain,
    startX: number,
    endX: number
  ) => {
    const sceneryStep = 210;
    const firstObj = Math.floor(startX / sceneryStep) * sceneryStep;

    for (let x = firstObj; x <= endX; x += sceneryStep) {
      if (x < 120) continue;
      const sandY = trn.getHeight(x);
      const angle = trn.getAngle(x);
      const hash = Math.abs(Math.sin(x * 12.9898)) * 100;
      const type = Math.floor(hash) % 4;

      ctx.save();
      ctx.translate(x, sandY);
      ctx.rotate(angle * 0.4); // Naturally conforms to road slope

      // Render items tailored specifically to the active stage
      switch (trn.levelId) {
        case 2: {
          // Dinosaur Fossil Badlands
          if (type === 0) {
            // Giant T-Rex Ribcage Arch curving over the road
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 4.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.quadraticCurveTo(-26, -55, 0, -62);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(18, 0);
            ctx.quadraticCurveTo(26, -55, 0, -62);
            ctx.stroke();

            // Vertebra spine joint
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(0, -62, 5, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === 1) {
            // Weathered canyon hoodoo rock pinnacle
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.moveTo(-12, 0);
            ctx.lineTo(-8, -48);
            ctx.lineTo(0, -56);
            ctx.lineTo(8, -48);
            ctx.lineTo(12, 0);
            ctx.closePath();
            ctx.fill();
            // Strata bands
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(-8, -32, 16, 4);
          } else if (type === 2) {
            // Prehistoric fossil skull with horns
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(-8, -10);
            ctx.lineTo(-5, 0);
            ctx.lineTo(5, 0);
            ctx.lineTo(8, -10);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-6, -14);
            ctx.quadraticCurveTo(-16, -22, -14, -8);
            ctx.moveTo(6, -14);
            ctx.quadraticCurveTo(16, -22, 14, -8);
            ctx.stroke();
          } else {
            // Stratified canyon slab
            ctx.fillStyle = '#92400e';
            ctx.fillRect(-14, -18, 28, 18);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(-14, -10, 28, 3);
          }
          break;
        }

        case 4: {
          // Meteor Impact Basin
          if (type === 0) {
            // Scorched basalt meteor boulder with glowing magma fissure
            ctx.fillStyle = '#18181b';
            ctx.strokeStyle = '#7c2d12';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-22, 0);
            ctx.lineTo(-24, -22);
            ctx.lineTo(-10, -40);
            ctx.lineTo(12, -36);
            ctx.lineTo(24, -18);
            ctx.lineTo(20, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Glowing magma thermal crack
            ctx.strokeStyle = '#ea580c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -40);
            ctx.lineTo(-2, -26);
            ctx.lineTo(6, -20);
            ctx.lineTo(4, 0);
            ctx.stroke();
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 1;
            ctx.stroke();
          } else if (type === 1) {
            // Smoking volcanic fumarole vent
            ctx.fillStyle = '#27272a';
            ctx.beginPath();
            ctx.moveTo(-14, 0);
            ctx.lineTo(-8, -26);
            ctx.lineTo(8, -26);
            ctx.lineTo(14, 0);
            ctx.closePath();
            ctx.fill();
            // Glowing core
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.arc(0, -26, 6, 0, Math.PI, true);
            ctx.fill();
          } else if (type === 2) {
            // Sharp obsidian rock spires
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(0, -44);
            ctx.lineTo(6, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            // Impact crater hazard pylon with red beacon
            ctx.fillStyle = '#3f3f46';
            ctx.fillRect(-2, -36, 4, 36);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -40, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 5: {
          // Skeleton Coast Shipwrecks
          if (type === 0) {
            // Stranded galleon curved oak timber ship ribs
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-22, 0);
            ctx.quadraticCurveTo(-15, -48, 5, -60);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.quadraticCurveTo(-2, -42, 16, -52);
            ctx.stroke();
          } else if (type === 1) {
            // Heavy rusted iron ship anchor
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(14, -28);
            ctx.lineTo(14, 0);
            ctx.arc(14, -31, 3.5, 0, Math.PI * 2);
            ctx.moveTo(7, -8);
            ctx.quadraticCurveTo(14, 0, 21, -8);
            ctx.stroke();
          } else if (type === 2) {
            // Weathered oak barrel & driftwood
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.roundRect(-10, -22, 20, 22, 4);
            ctx.fill();
            ctx.strokeStyle = '#1c1917';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else {
            // Coastal driftwood marker with nautical rope
            ctx.fillStyle = '#a8a29e';
            ctx.fillRect(-3, -34, 6, 34);
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -20, 6, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }

        case 6: {
          // Wadi Rum Red Archways
          if (type === 0) {
            // Towering red sandstone natural rock arch
            ctx.fillStyle = '#b91c1c';
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-24, 0);
            ctx.lineTo(-20, -52);
            ctx.quadraticCurveTo(0, -68, 20, -52);
            ctx.lineTo(24, 0);
            ctx.lineTo(15, 0);
            ctx.lineTo(12, -42);
            ctx.quadraticCurveTo(0, -50, -12, -42);
            ctx.lineTo(-15, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (type === 1) {
            // Terracotta balanced rock cairn (stacked stones)
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.ellipse(0, -8, 14, 8, 0, 0, Math.PI * 2);
            ctx.ellipse(0, -22, 10, 6, 0, 0, Math.PI * 2);
            ctx.ellipse(0, -32, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === 2) {
            // Sheer red canyon rock monolith
            ctx.fillStyle = '#b91c1c';
            ctx.beginPath();
            ctx.moveTo(-16, 0);
            ctx.lineTo(-10, -50);
            ctx.lineTo(12, -46);
            ctx.lineTo(18, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            // Red sandstone boulders
            ctx.fillStyle = '#7f1d1d';
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(-12, -18);
            ctx.lineTo(14, -14);
            ctx.lineTo(18, 0);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }

        case 7: {
          // Desert Oilfield Outpost
          if (type === 0) {
            // Industrial nodding pumpjack derrick
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-12, 0);
            ctx.lineTo(0, -48);
            ctx.lineTo(12, 0);
            ctx.stroke();
            // Walking beam
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(-18, -52, 36, 5);
            // Counterweight
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-16, -46, 8, 8);
          } else if (type === 1) {
            // Heavy steel pipeline with hazard warning stripes
            ctx.fillStyle = '#475569';
            ctx.fillRect(-28, -14, 56, 14);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(-16, -14, 6, 14);
            ctx.fillRect(10, -14, 6, 14);
          } else if (type === 2) {
            // Industrial oil drum / barrel
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(-8, -24, 16, 24, 2);
            ctx.fill();
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-8, -14, 16, 3);
          } else {
            // Industrial hazard diamond warning sign
            ctx.fillStyle = '#475569';
            ctx.fillRect(-2, -38, 4, 38);
            ctx.save();
            ctx.translate(0, -48);
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(-8, -8, 16, 16);
            ctx.restore();
            ctx.fillStyle = '#000000';
            ctx.fillRect(-1, -52, 2, 6);
            ctx.fillRect(-1, -44, 2, 2);
          }
          break;
        }

        case 8: {
          // Lost Bedouin Citadel
          if (type === 0) {
            // Ancient clay mud-brick fortress battlement
            ctx.fillStyle = '#b45309';
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(-22, -46, 44, 46);
            ctx.fill();
            ctx.stroke();
            // Crenels
            ctx.fillStyle = '#92400e';
            ctx.fillRect(-22, -54, 9, 8);
            ctx.fillRect(-5, -54, 10, 8);
            ctx.fillRect(13, -54, 9, 8);
            // Arch window
            ctx.fillStyle = '#451a03';
            ctx.beginPath();
            ctx.roundRect(-4, -30, 8, 16, [4, 4, 0, 0]);
            ctx.fill();
          } else if (type === 1) {
            // Carved ancient sandstone palatial pillar
            ctx.fillStyle = '#d97706';
            ctx.fillRect(-6, -58, 12, 58);
            ctx.fillStyle = '#b45309';
            ctx.fillRect(-9, -62, 18, 5);
            ctx.fillRect(-9, -4, 18, 4);
          } else if (type === 2) {
            // Ancient terracotta oil urn / amphora
            ctx.fillStyle = '#c2410c';
            ctx.beginPath();
            ctx.ellipse(0, -14, 8, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-3, -28, 6, 6);
          } else {
            // Ancient citadel stone ruins wall
            ctx.fillStyle = '#92400e';
            ctx.fillRect(-16, -20, 32, 20);
            ctx.fillStyle = '#78350f';
            ctx.strokeRect(-16, -20, 32, 20);
          }
          break;
        }

        default: {
          // Stage 1: Valley of the Pharaohs
          if (type === 0) {
            // Egyptian Sandstone Obelisk with Gold Cap
            ctx.fillStyle = '#d97706';
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-7, 0);
            ctx.lineTo(-4, -68);
            ctx.lineTo(0, -78);
            ctx.lineTo(4, -68);
            ctx.lineTo(7, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Golden pyramidion cap
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.moveTo(-4, -68);
            ctx.lineTo(0, -78);
            ctx.lineTo(4, -68);
            ctx.closePath();
            ctx.fill();

            // Hieroglyphs
            ctx.fillStyle = '#78350f';
            for (let h = -60; h < -10; h += 12) {
              ctx.fillRect(-2, h, 4, 2);
            }
          } else if (type === 1) {
            // Majestic Date Palm Tree
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(8, -40, 4, -75);
            ctx.stroke();

            // Coconuts & fronds
            ctx.fillStyle = '#a16207';
            ctx.beginPath();
            ctx.arc(2, -75, 4, 0, Math.PI * 2);
            ctx.fill();

            const frondAngles = [-1.3, -0.7, 0, 0.7, 1.3];
            frondAngles.forEach((a) => {
              ctx.save();
              ctx.translate(4, -75);
              ctx.rotate(a);
              ctx.strokeStyle = '#15803d';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.quadraticCurveTo(16, -10, 32, 8);
              ctx.stroke();
              ctx.restore();
            });
          } else if (type === 2) {
            // Desert Sandstone Boulders
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(-12, -18);
            ctx.lineTo(14, -14);
            ctx.lineTo(18, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            // Classic Desert Cactus
            ctx.fillStyle = '#166534';
            ctx.beginPath();
            ctx.roundRect(-4, -50, 9, 50, [4, 4, 0, 0]);
            ctx.fill();
          }
          break;
        }
      }

      ctx.restore();
    }
  };

  // Render Desert Oasis Checkpoints and Egyptian Finish Arch
  const renderCheckpointsAndFinish = (ctx: CanvasRenderingContext2D, trn: DesertTerrain) => {
    // Checkpoints: Bedouin Desert Oasis Tent & Flag
    trn.checkpoints.forEach((cp) => {
      ctx.save();
      ctx.translate(cp.x, cp.y);

      // Bedouin tent canopy
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(-32, 0);
      ctx.lineTo(0, -38);
      ctx.lineTo(32, 0);
      ctx.closePath();
      ctx.fill();

      // Tent stripes
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(0, -38);
      ctx.lineTo(12, 0);
      ctx.closePath();
      ctx.fill();

      // Wooden tent center pole
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-2, -58, 4, 58);

      // Oasis Checkpoint Flag
      ctx.fillStyle = cp.reached ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(2, -58);
      ctx.lineTo(26, -48);
      ctx.lineTo(2, -38);
      ctx.closePath();
      ctx.fill();

      // Campfire stone ring
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(28, 0, 8, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(28, -2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Finish Line: Grand Desert Sandstone Arch (in campaign mode)
    if (!trn.isEndless) {
      const fx = trn.levelLength - 100;
      const fy = trn.getHeight(fx);

      ctx.save();
      ctx.translate(fx, fy);

      // Left Sandstone Column
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-35, -110, 14, 110);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-38, -116, 20, 8); // Column capital
      ctx.fillRect(-38, -6, 20, 6); // Base

      // Right Sandstone Column
      ctx.fillStyle = '#b45309';
      ctx.fillRect(25, -110, 14, 110);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(22, -116, 20, 8);
      ctx.fillRect(22, -6, 20, 6);

      // Grand Overhead Desert Arch Beam
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-42, -132, 88, 22);

      // Golden Winged Sun Emblem on Arch
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(2, -121, 7, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.beginPath();
      ctx.moveTo(-16, -121);
      ctx.lineTo(2, -124);
      ctx.lineTo(20, -121);
      ctx.lineTo(2, -118);
      ctx.closePath();
      ctx.fill();

      // Checkered Finish Banner suspended between pillars
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-22, -104, 48, 24);
      ctx.fillStyle = '#000000';
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          if ((r + c) % 2 === 0) {
            ctx.fillRect(-22 + c * 12, -104 + r * 12, 12, 12);
          }
        }
      }

      // "FINISH" Desert Banner
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(-24, -76, 52, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FINISH', 2, -63);

      ctx.restore();
    }
  };

  // Render Collectibles (Coins, Fuel, Nitro)
  const renderCollectibles = (ctx: CanvasRenderingContext2D, trn: DesertTerrain, now: number) => {
    trn.collectibles.forEach((item) => {
      if (item.collected) return;
      const bob = Math.sin(now * 0.005 + item.x) * 4;

      ctx.save();
      ctx.translate(item.x, item.y + bob);

      if (item.type === 'coin') {
        // Rotating 3D Gold Coin
        const spin = Math.cos(now * 0.006 + item.x);
        ctx.scale(spin, 1);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 1);
      } else if (item.type === 'fuel') {
        // Red Jerrycan
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(-12, -16, 24, 30, 4);
        ctx.fill();

        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Handle
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(-8, -22, 16, 6);

        // Fuel drop emblem
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAS', 0, 0);
      } else if (item.type === 'nitro') {
        // Cyan Nitro Canister with Glow
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.roundRect(-10, -18, 20, 34, 6);
        ctx.fill();

        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Valve top
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-5, -23, 10, 5);

        // "N2O"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N2O', 0, -1);
      }

      ctx.restore();
    });
  };

  // Particles system (Desert sand roost, windblown sand dust, Nitro jet flame, Sparks)
  const handleParticles = (
    ctx: CanvasRenderingContext2D,
    phys: BikePhysics,
    ctrls: ControlsState,
    _dt: number,
    theme?: EnvironmentTheme
  ) => {
    // 1. Spawn Realistic Desert Sand Roost from rear knobby tire (styled to match stage road color)
    if (phys.rGrounded && Math.abs(phys.rvx) > 0.8) {
      const isThrottling = ctrls.gas;
      const count = isThrottling ? 3 : 1;
      const sandColors = theme
        ? [theme.duneHighlightColor, theme.duneSurfaceColor, theme.duneShadowColor, theme.sandRoostColor]
        : ['#fef08a', '#fde047', '#f59e0b', '#d97706', '#b45309'];
      for (let i = 0; i < count; i++) {
        const chosenColor = sandColors[Math.floor(Math.random() * sandColors.length)];
        particlesRef.current.push({
          x: phys.rx - 10 + (Math.random() - 0.5) * 8,
          y: phys.ry + phys.config.wheelRadius - 3,
          vx: -phys.rvx * (0.35 + Math.random() * 0.3) - Math.random() * 2,
          vy: -Math.random() * (isThrottling ? 5.5 : 2.5) - 0.8,
          size: 3 + Math.random() * (isThrottling ? 5.5 : 3.5),
          color: chosenColor,
          alpha: 0.88,
          decay: 0.035 + Math.random() * 0.025,
          type: 'dust',
        });
      }
    }

    // 1b. Front wheel light sand dust puff
    if (phys.fGrounded && Math.abs(phys.fvx) > 3.0 && Math.random() > 0.6) {
      particlesRef.current.push({
        x: phys.fx + (Math.random() - 0.5) * 6,
        y: phys.fy + phys.config.wheelRadius - 2,
        vx: -phys.fvx * 0.2 + (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 0.5,
        size: 3 + Math.random() * 3,
        color: '#fde047',
        alpha: 0.5,
        decay: 0.05,
        type: 'dust',
      });
    }

    // 1c. Ambient wind-blown desert sand motes floating across dunes
    if (Math.random() > 0.65 && particlesRef.current.length < 80) {
      particlesRef.current.push({
        x: phys.cx + (Math.random() - 0.2) * 500,
        y: phys.cy + (Math.random() - 0.5) * 260,
        vx: -2.5 - Math.random() * 3.5, // Wind blowing left
        vy: 0.3 + (Math.random() - 0.5) * 0.8,
        size: 1.5 + Math.random() * 2,
        color: '#fde68a',
        alpha: 0.6,
        decay: 0.015,
        type: 'dust',
      });
    }

    // 2. Spawn Nitro Jet exhaust flame
    if (phys.isNitroActive) {
      const exhaustX = phys.cx - Math.cos(phys.angle) * 32;
      const exhaustY = phys.cy - Math.sin(phys.angle) * 32 + 6;
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: exhaustX,
          y: exhaustY,
          vx: -Math.cos(phys.angle) * (10 + Math.random() * 8),
          vy: -Math.sin(phys.angle) * (10 + Math.random() * 8) + (Math.random() - 0.5) * 3,
          size: 6 + Math.random() * 8,
          color: Math.random() > 0.5 ? '#38bdf8' : '#f97316',
          alpha: 0.95,
          decay: 0.09,
          type: 'fire',
        });
      }
    }

    // 3. Spawn Crash Sparks & Dust
    if (phys.isCrashed && particlesRef.current.length < 50) {
      particlesRef.current.push({
        x: phys.cx + (Math.random() - 0.5) * 30,
        y: phys.cy + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5,
        size: 3 + Math.random() * 4,
        color: '#f97316',
        alpha: 1,
        decay: 0.05,
        type: 'spark',
      });
    }

    // Update and draw particles
    const surviving: Particle[] = [];
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.size = Math.max(1, p.size * 0.98);

      if (p.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        surviving.push(p);
      }
    });

    particlesRef.current = surviving;
  };

  // Render Bike and Rider (Tailored uniquely for each of the 10 Garage Bike Models)
  const renderBikeAndRider = (
    ctx: CanvasRenderingContext2D,
    phys: BikePhysics,
    ctrls?: ControlsState
  ) => {
    renderCompleteBike(ctx, phys, ctrls);
  };

  // Render Pop-up Stunt Text (+BACKFLIP!, +BIG AIR!)
  const renderStuntText = (
    ctx: CanvasRenderingContext2D,
    stunts: StuntEvent[],
    cx: number,
    cy: number
  ) => {
    const now = Date.now();
    stunts.forEach((s, idx) => {
      const age = (now - s.timestamp) / 1000;
      if (age > 2.2) return;
      const alpha = Math.max(0, 1 - age / 2.2);
      const floatY = cy - 70 - age * 35 - idx * 22;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '900 16px sans-serif';
      ctx.textAlign = 'center';

      // Outline glow
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0f172a';
      ctx.strokeText(s.text, cx, floatY);

      // Color text
      ctx.fillStyle = s.color;
      ctx.fillText(s.text, cx, floatY);

      ctx.restore();
    });
  };

  // Weather System: Intense Sun Glare with solar bloom, god rays, lens flares, and heat shimmer mirage
  const renderSunGlare = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    camX: number,
    camY: number,
    weatherState: WeatherState,
    flarePhase: number,
    heatShimmerPhase: number
  ) => {
    if (weatherState.glareIntensity <= 0.05) return;
    const intensity = weatherState.glareIntensity;

    const sunX = w * 0.74 - (camX * 0.02) % (w * 0.35);
    const sunY = h * 0.23 - (camY * 0.02);

    ctx.save();

    // 1. Massive Solar Bloom washing out the sky and upper horizon
    const bloomRadius = Math.max(w, h) * (0.65 + intensity * 0.45);
    const bloom = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, bloomRadius);
    bloom.addColorStop(0, `rgba(255, 255, 255, ${0.85 * intensity})`);
    bloom.addColorStop(0.12, `rgba(254, 240, 138, ${0.65 * intensity})`);
    bloom.addColorStop(0.35, `rgba(251, 191, 36, ${0.35 * intensity})`);
    bloom.addColorStop(0.65, `rgba(249, 115, 22, ${0.15 * intensity})`);
    bloom.addColorStop(1, 'rgba(234, 88, 12, 0)');

    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, w, h);

    // 2. Crepuscular Light Shafts / God Rays rotating across the camera
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(flarePhase * 0.15);
    const rayCount = 12;
    for (let r = 0; r < rayCount; r++) {
      const angle = (r * Math.PI * 2) / rayCount;
      const rayWidth = 0.16 + (r % 3 === 0 ? 0.08 : 0);
      const rayGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, w * 0.95);
      rayGrad.addColorStop(0, `rgba(255, 255, 255, ${0.28 * intensity})`);
      rayGrad.addColorStop(0.3, `rgba(254, 240, 138, ${0.18 * intensity})`);
      rayGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, w * 0.95, angle - rayWidth / 2, angle + rayWidth / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Anamorphic Horizontal Glare Streak through the sun core
    const streakGrad = ctx.createLinearGradient(sunX - w * 0.45, sunY, sunX + w * 0.45, sunY);
    streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    streakGrad.addColorStop(0.35, `rgba(254, 240, 138, ${0.3 * intensity})`);
    streakGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.85 * intensity})`);
    streakGrad.addColorStop(0.65, `rgba(254, 240, 138, ${0.3 * intensity})`);
    streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = streakGrad;
    ctx.fillRect(sunX - w * 0.45, sunY - 2.5, w * 0.9, 5);

    // 4. Optical Lens Flare Elements (along vector through screen center)
    const centerX = w / 2;
    const centerY = h / 2;
    const dx = centerX - sunX;
    const dy = centerY - sunY;

    // Artifact 1: Amber halo ring at 0.35
    const f1X = sunX + dx * 0.35;
    const f1Y = sunY + dy * 0.35;
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.45 * intensity})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(f1X, f1Y, 48, 0, Math.PI * 2);
    ctx.stroke();

    // Artifact 2: Cyan/Green aperture ghost hexagon at 0.65
    const f2X = sunX + dx * 0.65;
    const f2Y = sunY + dy * 0.65;
    ctx.fillStyle = `rgba(45, 212, 191, ${0.22 * intensity})`;
    ctx.beginPath();
    for (let s = 0; s < 6; s++) {
      const a = (s * Math.PI * 2) / 6 + 0.5;
      const px = f2X + Math.cos(a) * 26;
      const py = f2Y + Math.sin(a) * 26;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Artifact 3: Magenta/Rose aperture circle at 0.92
    const f3X = sunX + dx * 0.92;
    const f3Y = sunY + dy * 0.92;
    ctx.fillStyle = `rgba(244, 114, 182, ${0.25 * intensity})`;
    ctx.beginPath();
    ctx.arc(f3X, f3Y, 34, 0, Math.PI * 2);
    ctx.fill();

    // Artifact 4: Golden starburst ring at 1.25
    const f4X = sunX + dx * 1.25;
    const f4Y = sunY + dy * 1.25;
    ctx.fillStyle = `rgba(253, 224, 71, ${0.18 * intensity})`;
    ctx.beginPath();
    ctx.arc(f4X, f4Y, 62, 0, Math.PI * 2);
    ctx.fill();

    // 5. Heat Shimmer Mirage Undulations at horizon level
    const horizonY = h * 0.72 - camY * 0.04;
    ctx.fillStyle = `rgba(254, 240, 138, ${0.12 * intensity})`;
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 50);
    for (let x = 0; x <= w; x += 25) {
      const wave =
        Math.sin(x * 0.015 + heatShimmerPhase) * 6 * intensity +
        Math.sin(x * 0.035 - heatShimmerPhase * 1.4) * 3;
      ctx.lineTo(x, horizonY + wave);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Weather System: Fierce Sandstorm Overlay with whistling grit, billowing dust walls, and dense visibility reduction
  const renderSandstormOverlay = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    weatherManager: WeatherManager,
    weatherState: WeatherState,
    camX: number,
    camY: number
  ) => {
    if (weatherState.type !== 'sandstorm' || weatherState.intensity <= 0.05) return;
    const intensity = weatherState.intensity;

    ctx.save();

    // 1. Heavy Ochre Atmospheric Sand Fog
    const sandFog = ctx.createLinearGradient(0, 0, w, h);
    sandFog.addColorStop(0, `rgba(217, 119, 6, ${0.22 * intensity})`);
    sandFog.addColorStop(0.4, `rgba(180, 83, 9, ${0.28 * intensity})`);
    sandFog.addColorStop(1, `rgba(120, 53, 15, ${0.34 * intensity})`);
    ctx.fillStyle = sandFog;
    ctx.fillRect(0, 0, w, h);

    // 2. Swirling billowing sand sheets across screen
    const time = Date.now() * 0.003;
    for (let wave = 0; wave < 3; wave++) {
      ctx.fillStyle =
        wave % 2 === 0
          ? `rgba(251, 191, 36, ${0.12 * intensity})`
          : `rgba(217, 119, 6, ${0.15 * intensity})`;

      ctx.beginPath();
      ctx.moveTo(0, h);
      const waveYBase = h * (0.2 + wave * 0.28);
      for (let x = 0; x <= w; x += 30) {
        const offset =
          Math.sin(x * 0.006 - time * (2 + wave) - camX * 0.001) * (28 + wave * 14) * intensity;
        ctx.lineTo(x, waveYBase + offset);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }

    // 3. High-velocity flying sand grains & streaks
    for (const p of weatherManager.sandParticles) {
      const sx = ((p.x % w) + w) % w;
      const sy = ((p.y % h) + h) % h;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * intensity;
      const streakLen = Math.max(8, Math.abs(p.vx) * 1.4 * (1 + intensity));
      ctx.fillRect(sx - streakLen, sy, streakLen, p.size);
    }

    // 4. Claustrophobic Vignette - drastically reducing peripheral visibility
    const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.72);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(0.7, `rgba(120, 53, 15, ${0.26 * intensity})`);
    vig.addColorStop(1, `rgba(69, 26, 3, ${0.54 * intensity})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  };

  // Weather System: On-screen weather warning alert banner
  const renderWeatherAlert = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    alert: { text: string; subtext: string; color: string; duration: number } | null
  ) => {
    if (!alert || alert.duration <= 0) return;

    ctx.save();
    // Fade in / out smoothly
    const alpha = Math.min(1, alert.duration * 2);
    ctx.globalAlpha = alpha;

    const alertW = Math.min(480, w * 0.9);
    const alertH = 56;
    const alertX = (w - alertW) / 2;
    const alertY = 72; // Below top telemetry

    // Backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(alertX, alertY, alertW, alertH, 14);
    ctx.fill();

    // Glowing animated border
    ctx.strokeStyle = alert.color;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = alert.color;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Text
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '900 15px sans-serif';
    ctx.fillStyle = alert.color;
    ctx.fillText(alert.text, w / 2, alertY + 20);

    ctx.font = '700 11px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(alert.subtext, w / 2, alertY + 40);

    ctx.restore();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
