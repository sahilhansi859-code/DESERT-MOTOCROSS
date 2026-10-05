import React from 'react';
import { Pause, Play, Fuel, Flag, Coins } from 'lucide-react';
import { LevelInfo, WeatherState, StuntStats } from '../types';

interface Props {
  levelInfo?: LevelInfo | null;
  isEndless?: boolean;
  speedKmh: number;
  rpm: number;
  fuel: number;
  nitro: number;
  distance: number;
  score: number;
  coins: number;
  timeRemaining?: number;
  stunts?: StuntStats | null;
  isMuted?: boolean;
  isPaused: boolean;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
  onToggleMute?: () => void;
  onTogglePause: () => void;
  onRestart?: () => void;
  onOpenBikes?: () => void;
  onOpenLevels?: () => void;
  onOpenSettings?: () => void;
  onGoHome?: () => void;
}

export const GameHUD: React.FC<Props> = ({
  levelInfo,
  isEndless,
  speedKmh,
  rpm,
  fuel,
  distance = 0,
  coins = 0,
  isPaused,
  onTogglePause,
}) => {
  // Stage distance target calculation (terrain units to meters ratio is 10:1)
  const targetDistance = levelInfo?.length ? Math.round(levelInfo.length / 10) : 2500;
  const progressPercent = isEndless
    ? Math.min(100, ((distance % 1000) / 1000) * 100)
    : Math.min(100, Math.max(0, (distance / targetDistance) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between notch-safe-x notch-safe-top p-2 sm:p-4 landscape:p-1.5 landscape:px-5 z-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-1 sm:gap-2.5 w-full">
        {/* Top-Left: Fuel & Meter Box */}
        <div id="hud-left-corner" className="pointer-events-auto shrink-0">
          {/* Fuel & Speedometer Meter Box */}
          <div
            id="hud-meter-box"
            className="flex items-center gap-1.5 sm:gap-2 bg-black/85 backdrop-blur-md px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-500/35 shadow-lg min-w-[125px] xs:min-w-[140px] sm:min-w-[170px] justify-between"
          >
            {/* Speedometer & RPM */}
            <div className="flex flex-col items-center min-w-[42px] sm:min-w-[56px]">
              <div className="flex items-baseline gap-0.5">
                <span className="font-black text-sm sm:text-xl landscape:text-base text-white tracking-tight tabular-nums drop-shadow">
                  {speedKmh}
                </span>
                <span className="text-[7px] sm:text-[8px] font-black text-amber-400 uppercase">KM/H</span>
              </div>
              {/* Tachometer RPM bar */}
              <div className="w-10 sm:w-14 bg-slate-900/90 rounded-full h-1 overflow-hidden border border-white/10 mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
                  style={{ width: `${Math.min(100, rpm * 100)}%` }}
                />
              </div>
            </div>

            <div className="w-px h-5 sm:h-6 bg-white/20" />

            {/* Fuel Gauge */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-[55px] sm:min-w-[70px]">
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold">
                <span className="flex items-center gap-0.5 text-amber-300">
                  <Fuel className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${fuel <= 0 ? 'text-red-500 animate-bounce' : fuel < 25 ? 'text-red-500 animate-ping' : 'text-amber-400'}`} />
                  {fuel <= 0 ? (
                    <span className="text-red-400 font-black">OUT!</span>
                  ) : fuel < 20 ? (
                    <span className="text-amber-400 font-bold">LOW</span>
                  ) : (
                    'FUEL'
                  )}
                </span>
                <span className={`tabular-nums font-mono text-[8px] sm:text-[9px] ${fuel <= 0 ? 'text-red-400 font-black' : 'text-white/90'}`}>{Math.round(fuel)}%</span>
              </div>
              <div className="w-full bg-slate-900/90 rounded-full h-1 sm:h-1.5 overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-100 ${
                    fuel <= 0
                      ? 'bg-red-600'
                      : fuel < 25
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                  }`}
                  style={{ width: `${fuel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top-Center: Progress Meter Line */}
        <div
          id="hud-top-meter-line"
          className="flex-1 flex flex-col items-center justify-center max-w-[160px] xs:max-w-[210px] sm:max-w-[320px] md:max-w-[400px] pointer-events-auto mx-1 sm:mx-2"
        >
          <div className="w-full bg-black/85 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-amber-500/35 shadow-lg flex flex-col gap-0.5 sm:gap-1">
            {/* Header info above meter line */}
            <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-white">
              <span className="flex items-center gap-1 text-amber-400 truncate max-w-[85px] sm:max-w-[150px]">
                <Flag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
              </span>
              <span className="font-mono tabular-nums text-white text-[9px] sm:text-xs font-black tracking-tight shrink-0">
                <span className="text-amber-300">{Math.round(distance)}m</span>
                {!isEndless && (
                  <span className="text-white/50 text-[8px] sm:text-[9px]"> / {targetDistance}m</span>
                )}
              </span>
            </div>

            {/* Visual Meter Line */}
            <div className="relative w-full h-2 sm:h-2.5 bg-slate-950/90 rounded-full overflow-visible border border-white/15 p-[1px]">
              {/* Animated Progress Fill Line */}
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-100 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                style={{ width: `${Math.max(2, Math.min(100, progressPercent))}%` }}
              />

              {/* Rider Marker Pin on the line */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full border-2 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)] z-10 flex items-center justify-center transition-all duration-100 pointer-events-none"
                style={{ left: `${Math.max(2, Math.min(98, progressPercent))}%` }}
              >
                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />
              </div>

              {/* Checkered / Finish flag pin on the right edge */}
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 pointer-events-none">
                <Flag className="w-full h-full fill-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right: Coins Badge & Pause Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* Coins Badge */}
          <div
            id="hud-coins-badge"
            className="flex items-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-black/75 border border-amber-500/30 backdrop-blur-md shadow-md text-white"
            title="Coins Collected"
          >
            <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-mono font-black text-[11px] sm:text-xs tabular-nums text-white">
              {coins}
            </span>
          </div>

          <button
            id="hud-pause-btn"
            onClick={onTogglePause}
            className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-black/60 hover:bg-black/80 text-white/90 border border-white/15 backdrop-blur-md transition-transform active:scale-95 shadow-md cursor-pointer"
            title="Pause Game (Esc / P)"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Floating Center Alert during ride */}
      {fuel <= 0 ? (
        <div className="self-center mt-1 pointer-events-none animate-bounce z-30">
          <div className="bg-red-600/95 border-2 border-red-400 text-white font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm tracking-wider uppercase">
            <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            <span>FUEL OUT! ENGINE STALLED</span>
          </div>
        </div>
      ) : null}

      {/* Bottom spacer */}
      <div className="w-full pointer-events-none" />
    </div>
  );
};
