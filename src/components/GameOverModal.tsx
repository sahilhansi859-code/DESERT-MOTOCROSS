import React from 'react';
import { RotateCcw, Coins, Flag, AlertTriangle, Fuel, UserX, Clock, Home } from 'lucide-react';
import { LevelInfo, OutType, StuntStats } from '../types';

interface Props {
  isOpen: boolean;
  type: 'crashed' | 'completed';
  outType?: OutType;
  crashReason?: string;
  levelInfo?: LevelInfo | null;
  isEndless?: boolean;
  distance: number;
  score: number;
  coins: number;
  timeSec: number;
  stuntStats?: StuntStats | null;
  onRetry: () => void;
  onNextLevel?: () => void;
  onOpenBikes?: () => void;
  onOpenLevels?: () => void;
  onGoHome?: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  isOpen,
  outType,
  crashReason,
  distance,
  coins,
  timeSec,
  onRetry,
  onGoHome,
}) => {
  if (!isOpen) return null;

  const isTimeOut = outType === 'time_out' || crashReason?.toUpperCase().includes('TIME');
  const isFuelOut = outType === 'fuel_out' || crashReason?.toUpperCase().includes('FUEL');
  const isRiderOut = outType === 'rider_out' || crashReason?.toUpperCase().includes('RIDER') || crashReason?.toUpperCase().includes('HELMET') || crashReason?.toUpperCase().includes('HEAD');

  const outTitle = isTimeOut
    ? 'TIME OUT!'
    : isFuelOut
    ? 'FUEL OUT!'
    : isRiderOut
    ? 'RIDER OUT!'
    : 'CRASHED OUT!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center notch-safe-all bg-black/85 backdrop-blur-md animate-fade-in select-none overflow-hidden">
      {/* Card container scaled and constrained to fit all content cleanly */}
      <div
        id="game-over-modal-card"
        className={`bg-slate-900/95 backdrop-blur-xl border rounded-2xl sm:rounded-3xl w-[90%] max-w-xs sm:max-w-md max-h-[90dvh] p-3 sm:p-4.5 shadow-2xl flex flex-col items-center justify-center gap-2 sm:gap-2.5 overflow-y-auto scrollbar-none my-auto ${
          isTimeOut
            ? 'border-rose-500/50 shadow-rose-500/20'
            : isFuelOut
            ? 'border-amber-500/50 shadow-amber-500/20'
            : isRiderOut
            ? 'border-orange-500/50 shadow-orange-500/20'
            : 'border-red-500/50 shadow-red-500/20'
        }`}
      >
        {/* 1. Outcome Icon - Compact & Scaled */}
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0 border ${
            isTimeOut
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
              : isFuelOut
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
              : isRiderOut
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse'
              : 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
          }`}
        >
          {isTimeOut ? (
            <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
          ) : isFuelOut ? (
            <Fuel className="w-6 h-6 sm:w-7 sm:h-7" />
          ) : isRiderOut ? (
            <UserX className="w-6 h-6 sm:w-7 sm:h-7" />
          ) : (
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
          )}
        </div>

        {/* 2. Outcome Title - Compact & Balanced */}
        <h2 className="text-base sm:text-xl font-black tracking-wide text-white uppercase text-center shrink-0 drop-shadow">
          {outTitle}
        </h2>

        {/* 3. Stats Section - 2 Clean Columns (Distance & Coins) */}
        <div className="w-full grid grid-cols-2 gap-2 shrink-0">
          {/* Distance Box */}
          <div
            id="stat-distance-box"
            className="bg-slate-800/90 border border-slate-700/70 p-2 rounded-xl flex flex-col items-center justify-center text-center"
          >
            <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 font-bold uppercase tracking-wider">
              <Flag className="w-3 h-3 text-blue-400 shrink-0" /> Dist
            </span>
            <span className="text-sm sm:text-base font-black text-white mt-0.5 tabular-nums truncate max-w-full">
              {distance}m
            </span>
          </div>

          {/* Coins Box */}
          <div
            id="stat-coins-box"
            className="bg-slate-800/90 border border-slate-700/70 p-2 rounded-xl flex flex-col items-center justify-center text-center"
          >
            <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 font-bold uppercase tracking-wider">
              <Coins className="w-3 h-3 text-amber-300 shrink-0" /> Coins
            </span>
            <span className="text-sm sm:text-base font-black text-amber-400 mt-0.5 tabular-nums">
              +{coins}
            </span>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="w-full shrink-0 mt-0.5">
          <div className="w-full grid grid-cols-2 gap-1.5">
            {onGoHome && (
              <button
                id="go-home-gameover"
                onClick={onGoHome}
                className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer border border-slate-700"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span>Home</span>
              </button>
            )}

            <button
              id="retry-run-btn"
              onClick={onRetry}
              className={`w-full py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 border border-amber-300 cursor-pointer ${
                !onGoHome ? 'col-span-2' : ''
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
              <span>Ride Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
