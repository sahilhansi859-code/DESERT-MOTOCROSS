/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { BikeConfig, GameState, LevelInfo, OutType, WeatherState, WeatherType, StuntStats } from './types';
import { BIKES } from './game/bikes';
import { DesertTerrain, CAMPAIGN_LEVELS } from './game/terrain';
import { BikePhysics, ControlsState } from './game/physics';
import { soundFX } from './game/audio';
import { DesertGameCanvas } from './components/DesertGameCanvas';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { BikeSelectModal } from './components/BikeSelectModal';
import { GameOverModal } from './components/GameOverModal';
import { HomePage } from './components/HomePage';
import { StageSelectModal } from './components/StageSelectModal';
import { SettingsModal, GameSettings } from './components/SettingsModal';

export default function App() {
  // Saved state from localStorage
  const [userCoins, setUserCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('desert_bike_coins');
      return saved ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });

  const [unlockedBikeIds, setUnlockedBikeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('desert_bike_claimed_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.includes('motocross_250') ? parsed : ['motocross_250', ...parsed];
        }
      }
      return ['motocross_250'];
    } catch {
      return ['motocross_250'];
    }
  });

  const [selectedBikeId, setSelectedBikeId] = useState<string>(() => {
    try {
      const savedUnlocked = localStorage.getItem('desert_bike_claimed_v2');
      const unlockedList: string[] = savedUnlocked ? JSON.parse(savedUnlocked) : ['motocross_250'];
      const validUnlocked = unlockedList.includes('motocross_250') ? unlockedList : ['motocross_250', ...unlockedList];
      const saved = localStorage.getItem('desert_bike_selected');
      if (saved && BIKES.some((b) => b.id === saved) && validUnlocked.includes(saved)) {
        return saved;
      }
      return 'motocross_250';
    } catch {
      return 'motocross_250';
    }
  });

  const [unlockedStageIds, setUnlockedStageIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('desert_bike_claimed_stages_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.includes(1) ? parsed : [1, ...parsed];
        }
      }
      return [1];
    } catch {
      return [1];
    }
  });

  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    try {
      const savedUnlocked = localStorage.getItem('desert_bike_claimed_stages_v2');
      const unlockedList: number[] = savedUnlocked ? JSON.parse(savedUnlocked) : [1];
      const saved = localStorage.getItem('desert_bike_selected_stage');
      const parsed = saved ? parseInt(saved, 10) : 1;
      if (CAMPAIGN_LEVELS.some((l) => l.id === parsed) && unlockedList.includes(parsed)) {
        return parsed;
      }
      return CAMPAIGN_LEVELS[0]?.id || 1;
    } catch {
      return CAMPAIGN_LEVELS[0]?.id || 1;
    }
  });
  const [isEndless, setIsEndless] = useState<boolean>(true);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(true);

  // Settings State (Persisted in localStorage)
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('desert_bike_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      musicVolume: 0.75,
      isMusicEnabled: true,
      sfxVolume: 0.8,
      isSfxEnabled: true,
      controlSensitivity: 1.0,
    };
  });

  // Modals
  const [showBikeSelect, setShowBikeSelect] = useState<boolean>(false);
  const [showStageSelect, setShowStageSelect] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Results
  const [crashReason, setCrashReason] = useState<string>('');
  const [outType, setOutType] = useState<OutType>(null);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number>(0);

  // Active bikes list with unlock status
  const bikeList = useMemo(() => {
    return BIKES.map((b) => ({
      ...b,
      unlocked: unlockedBikeIds.includes(b.id),
    }));
  }, [unlockedBikeIds]);

  const currentBike = useMemo(() => {
    return bikeList.find((b) => b.id === selectedBikeId) || bikeList[0];
  }, [bikeList, selectedBikeId]);

  // Active stages list with unlock status
  const stageList = useMemo(() => {
    return CAMPAIGN_LEVELS.map((l) => ({
      ...l,
      unlocked: unlockedStageIds.includes(l.id),
    }));
  }, [unlockedStageIds]);

  const currentLevelInfo: LevelInfo = useMemo(() => {
    return stageList.find((l) => l.id === currentLevelId) || stageList[0];
  }, [stageList, currentLevelId]);

  // Terrain and physics instances
  const terrain = useMemo(() => {
    return new DesertTerrain(currentLevelId, isEndless);
  }, [currentLevelId, isEndless]);

  const physics = useMemo(() => {
    return new BikePhysics(currentBike, terrain);
  }, [currentBike, terrain]);

  // Controls state (Only Race, Brake, Boost needed)
  const [controls, setControls] = useState<ControlsState>({
    gas: false,
    brake: false,
    tiltLeft: false,
    tiltRight: false,
    nitro: false,
  });

  // Telemetry stats
  const [stats, setStats] = useState({
    speedKmh: 0,
    rpm: 0,
    fuel: 100,
    nitro: 60,
    distance: 0,
    score: 0,
    coins: 0,
    timeRemaining: 20,
  });

  // Real-time Stunt XP telemetry
  const [stuntStats, setStuntStats] = useState<StuntStats>({
    stuntXp: 0,
    pendingXp: 0,
    backflips: 0,
    frontflips: 0,
    wheelies: 0,
    wheelieSec: 0,
    activeStunt: null,
    lastLandBonus: 0,
    lastLandTime: 0,
  });

  // Switch audio to active racing: background music stops, engine starts
  const startRacingAudio = useCallback(() => {
    soundFX.init();
    soundFX.stopMusic();
    setIsMusicPlaying(false);
    soundFX.startEngine();
  }, []);

  // Audio lifecycle state sync:
  // - 'menu' & 'level_completed': background music keeps playing, bike engine stopped
  // - 'playing': background music stopped, bike engine + sound effects active
  // - 'crashed': bike engine and background music stopped
  useEffect(() => {
    if (gameState === 'menu' || gameState === 'level_completed') {
      soundFX.stopEngine();
      if (settings.isMusicEnabled) {
        soundFX.startMusic();
        setIsMusicPlaying(true);
      }
    } else if (gameState === 'playing') {
      soundFX.stopMusic();
      setIsMusicPlaying(false);
      soundFX.startEngine();
    } else if (gameState === 'crashed') {
      soundFX.stopEngine();
      soundFX.stopMusic();
      setIsMusicPlaying(false);
    }
  }, [gameState, settings.isMusicEnabled]);

  // Autoplay music on initial user gesture when on start screen or level complete screen
  useEffect(() => {
    const handleFirstGesture = () => {
      soundFX.init();
      if (gameState === 'menu' || gameState === 'level_completed') {
        if (settings.isMusicEnabled) {
          soundFX.startMusic();
          setIsMusicPlaying(true);
        }
      }
    };
    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [gameState, settings.isMusicEnabled]);

  // Sync settings with audio and physics
  useEffect(() => {
    try {
      localStorage.setItem('desert_bike_settings', JSON.stringify(settings));
    } catch {}
    soundFX.setMusicVolume(settings.musicVolume);
    soundFX.setMusicEnabled(settings.isMusicEnabled);
    soundFX.setSfxVolume(settings.sfxVolume);
    soundFX.setMuted(!settings.isSfxEnabled);
    setIsMuted(!settings.isSfxEnabled);
    if (physics) {
      physics.controlSensitivity = settings.controlSensitivity;
    }
  }, [settings, physics]);

  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const handleResetSettingsDefaults = useCallback(() => {
    setSettings({
      musicVolume: 0.75,
      isMusicEnabled: true,
      sfxVolume: 0.8,
      isSfxEnabled: true,
      controlSensitivity: 1.0,
    });
  }, []);

  const handlePlayGame = useCallback(() => {
    startRacingAudio();
    physics.reset(120);
    setCompletionTime(0);
    setGameState('playing');
    setIsPaused(false);
  }, [startRacingAudio, physics]);

  const handleGoHome = useCallback(() => {
    soundFX.stopEngine();
    setIsPaused(false);
    setGameState('menu');
    if (settings.isMusicEnabled) {
      soundFX.startMusic();
      setIsMusicPlaying(true);
    }
  }, [settings.isMusicEnabled]);

  const handleToggleMusic = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.isMusicEnabled;
      soundFX.setMusicEnabled(next);
      setIsMusicPlaying(next);
      return { ...prev, isMusicEnabled: next };
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.isSfxEnabled;
      return { ...prev, isSfxEnabled: next };
    });
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('desert_bike_coins', userCoins.toString());
      localStorage.setItem('desert_bike_claimed_v2', JSON.stringify(unlockedBikeIds));
      localStorage.setItem('desert_bike_selected', selectedBikeId);
      localStorage.setItem('desert_bike_claimed_stages_v2', JSON.stringify(unlockedStageIds));
    } catch {
      // LocalStorage error catch
    }
  }, [userCoins, unlockedBikeIds, selectedBikeId, unlockedStageIds]);

  // Global Keyboard handlers: Race (W/Up), Brake (S/Down), Tilt (A/D/Left/Right), Boost (Space/Shift/B), Music (M)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        handleToggleMusic();
        return;
      }

      if (gameState !== 'playing') {
        return;
      }

      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setControls((prev) => ({ ...prev, gas: true }));
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setControls((prev) => ({ ...prev, brake: true }));
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setControls((prev) => ({ ...prev, tiltLeft: true }));
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setControls((prev) => ({ ...prev, tiltRight: true }));
      } else if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyB' || e.code === 'KeyN') {
        setControls((prev) => ({ ...prev, nitro: true }));
      } else if (e.code === 'KeyR') {
        handleRestart();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        handleTogglePause();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setControls((prev) => ({ ...prev, gas: false }));
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setControls((prev) => ({ ...prev, brake: false }));
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setControls((prev) => ({ ...prev, tiltLeft: false }));
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setControls((prev) => ({ ...prev, tiltRight: false }));
      } else if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyB' || e.code === 'KeyN') {
        setControls((prev) => ({ ...prev, nitro: false }));
      }
    };

    const onBlur = () => {
      setControls({
        gas: false,
        brake: false,
        tiltLeft: false,
        tiltRight: false,
        nitro: false,
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [gameState, handleToggleMusic]);

  const handleRestart = useCallback(() => {
    startRacingAudio();
    physics.reset(120);
    terrain.setLevel(currentLevelId, isEndless);
    setCompletionTime(0);
    setGameState('playing');
    setIsPaused(false);
    setOutType(null);
    setStuntStats({
      stuntXp: 0,
      pendingXp: 0,
      backflips: 0,
      frontflips: 0,
      wheelies: 0,
      wheelieSec: 0,
      activeStunt: null,
      lastLandBonus: 0,
      lastLandTime: 0,
    });
    setControls({
      gas: false,
      brake: false,
      tiltLeft: false,
      tiltRight: false,
      nitro: false,
    });
  }, [startRacingAudio, physics, terrain, currentLevelId, isEndless]);

  const handleCrash = useCallback((reason: string, type?: OutType, timeTaken?: number) => {
    soundFX.stopEngine();
    soundFX.stopMusic();
    setIsMusicPlaying(false);
    setCrashReason(reason);
    setOutType(type || (reason.toUpperCase().includes('TIME') ? 'time_out' : reason.toUpperCase().includes('FUEL') ? 'fuel_out' : 'crash_out'));
    const finalElapsed = timeTaken !== undefined ? timeTaken : Math.max(1, Math.round(physics.elapsedTime));
    setCompletionTime(finalElapsed);
    setGameState('crashed');
    setUserCoins((prev) => prev + physics.coins);
  }, [physics.coins, physics.elapsedTime]);

  const handleLevelComplete = useCallback((timeSec: number, score: number, _stuntXp?: number, stuntStatsParam?: StuntStats) => {
    soundFX.stopEngine();
    soundFX.playLevelWin();
    if (settings.isMusicEnabled) {
      soundFX.startMusic();
      setIsMusicPlaying(true);
    }
    setCompletionTime(timeSec);
    setFinalScore(score);
    if (stuntStatsParam) {
      setStuntStats(stuntStatsParam);
    }
    setGameState('level_completed');
    setUserCoins((prev) => prev + physics.coins + 100);
  }, [physics.coins, settings.isMusicEnabled]);

  const handleSelectBike = (bike: BikeConfig) => {
    setSelectedBikeId(bike.id);
    physics.config = bike;
    physics.reset(120);
    startRacingAudio();
    setGameState('playing');
    setIsPaused(false);
    setShowBikeSelect(false);
  };

  const handleUnlockBike = (bike: BikeConfig) => {
    const cost = bike.cost || 50000;
    if (userCoins >= cost) {
      setUserCoins((prev) => prev - cost);
      setUnlockedBikeIds((prev) => (prev.includes(bike.id) ? prev : [...prev, bike.id]));
      setSelectedBikeId(bike.id);
      physics.config = bike;
      physics.reset(120);
      startRacingAudio();
      setGameState('playing');
      setIsPaused(false);
      setShowBikeSelect(false);
    }
  };

  const handleSelectStage = (stageId: number) => {
    if (!unlockedStageIds.includes(stageId)) return;
    setCurrentLevelId(stageId);
    terrain.setLevel(stageId, isEndless);
    physics.reset(120);
    try {
      localStorage.setItem('desert_bike_selected_stage', stageId.toString());
    } catch {}
    setShowStageSelect(false);
  };

  const handleUnlockStage = (stage: LevelInfo) => {
    const cost = stage.cost ?? 50000;
    if (userCoins >= cost) {
      setUserCoins((prev) => prev - cost);
      setUnlockedStageIds((prev) => (prev.includes(stage.id) ? prev : [...prev, stage.id]));
      setCurrentLevelId(stage.id);
      terrain.setLevel(stage.id, isEndless);
      physics.reset(120);
      try {
        localStorage.setItem('desert_bike_selected_stage', stage.id.toString());
      } catch {}
      setShowStageSelect(false);
    }
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      soundFX.playPauseSound();
      return next;
    });
  };

  const handleUpdateStats = useCallback(
    (
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
    ) => {
      setStats({
        speedKmh,
        rpm,
        fuel,
        nitro,
        distance,
        score,
        coins,
        timeRemaining: timeRemaining !== undefined ? timeRemaining : 20,
      });
      if (stunts) {
        setStuntStats(stunts);
      }
    },
    []
  );

  return (
    <main
      id="desert-bike-app"
      className="fixed inset-0 w-full h-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 font-sans select-none touch-none overscroll-none"
    >
      {/* 2D Physics Game Canvas */}
      <DesertGameCanvas
        bikeConfig={currentBike}
        terrain={terrain}
        physics={physics}
        controls={isPaused || gameState !== 'playing' ? { gas: false, brake: false, tiltLeft: false, tiltRight: false, nitro: false } : controls}
        gameState={gameState}
        isPaused={isPaused}
        onCrash={handleCrash}
        onLevelComplete={handleLevelComplete}
        onUpdateStats={handleUpdateStats}
      />

      {/* HOME PAGE (Title Screen & Championship Lobby) */}
      {gameState === 'menu' && (
        <HomePage
          onPlayGame={handlePlayGame}
          onOpenSettings={() => setShowSettings(true)}
          onOpenBikes={() => setShowBikeSelect(true)}
          onOpenStages={() => setShowStageSelect(true)}
          currentBike={currentBike}
          currentLevelInfo={currentLevelInfo}
          userCoins={userCoins}
          onAddCoins={(amount) => setUserCoins((prev) => prev + amount)}
          isMusicPlaying={isMusicPlaying}
          isMuted={isMuted}
          onToggleMusic={handleToggleMusic}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Heads Up Display (HUD) - Visible during gameplay */}
      {gameState !== 'menu' && (
        <GameHUD
          levelInfo={currentLevelInfo}
          isEndless={isEndless}
          speedKmh={stats.speedKmh}
          rpm={stats.rpm}
          fuel={stats.fuel}
          nitro={stats.nitro}
          distance={stats.distance}
          score={stats.score}
          coins={stats.coins}
          timeRemaining={stats.timeRemaining}
          stunts={stuntStats}
          isMuted={isMuted}
          isPaused={isPaused}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onRestart={handleRestart}
          onOpenBikes={() => setShowBikeSelect(true)}
          onOpenLevels={() => setShowStageSelect(true)}
          onOpenSettings={() => setShowSettings(true)}
          onGoHome={handleGoHome}
        />
      )}

      {/* Mobile & Touch Controls (Race, Brake, Boost, Music) - Visible during gameplay */}
      {gameState !== 'menu' && (
        <TouchControls
          controls={controls}
          setControls={setControls}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
          distance={stats.distance}
          targetDistance={currentLevelInfo?.length || 1000}
          isEndless={isEndless}
          currentLevel={currentLevelId}
        />
      )}

      {/* Modals */}
      <BikeSelectModal
        isOpen={showBikeSelect}
        bikes={bikeList}
        selectedBikeId={selectedBikeId}
        userCoins={userCoins}
        onClose={() => setShowBikeSelect(false)}
        onSelectBike={handleSelectBike}
        onUnlockBike={handleUnlockBike}
      />

      <StageSelectModal
        isOpen={showStageSelect}
        levels={stageList}
        selectedLevelId={currentLevelId}
        userCoins={userCoins}
        onClose={() => setShowStageSelect(false)}
        onSelectLevel={handleSelectStage}
        onUnlockLevel={handleUnlockStage}
      />

      <SettingsModal
        isOpen={showSettings}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetDefaults={handleResetSettingsDefaults}
        onClose={() => setShowSettings(false)}
      />

      <GameOverModal
        isOpen={gameState === 'crashed' || gameState === 'level_completed'}
        type={gameState === 'crashed' ? 'crashed' : 'completed'}
        outType={outType}
        crashReason={crashReason}
        levelInfo={currentLevelInfo}
        isEndless={isEndless}
        distance={stats.distance}
        score={stats.score}
        coins={stats.coins}
        timeSec={completionTime}
        stuntStats={stuntStats}
        onRetry={handleRestart}
        onOpenBikes={() => setShowBikeSelect(true)}
        onOpenLevels={() => setShowStageSelect(true)}
        onGoHome={handleGoHome}
      />

      {/* Pause Overlay */}
      {isPaused ? (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-4 notch-safe-all">
          <div className="bg-slate-900 border border-white/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-center max-w-xs sm:max-w-sm w-full shadow-2xl space-y-2.5 sm:space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-white">Game Paused</h3>
            <button
              id="resume-btn"
              onClick={handleTogglePause}
              className="w-full py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              Resume
            </button>
            <button
              id="restart-pause-btn"
              onClick={handleRestart}
              className="w-full py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Restart</span>
            </button>
            <button
              id="home-pause-btn"
              onClick={handleGoHome}
              className="w-full py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-white" />
              <span>Home</span>
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

