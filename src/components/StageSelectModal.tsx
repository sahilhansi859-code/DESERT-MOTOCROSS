import React, { useState, useEffect } from 'react';
import { X, Check, Lock, Compass, Coins } from 'lucide-react';
import { LevelInfo } from '../types';

interface Props {
  isOpen: boolean;
  levels: LevelInfo[];
  selectedLevelId: number;
  userCoins?: number;
  onClose: () => void;
  onSelectLevel: (levelId: number) => void;
  onUnlockLevel?: (level: LevelInfo) => void;
}

export const StageSelectModal: React.FC<Props> = ({
  isOpen,
  levels,
  selectedLevelId,
  userCoins = 0,
  onClose,
  onSelectLevel,
  onUnlockLevel,
}) => {
  const [needCoinsInfo, setNeedCoinsInfo] = useState<{ id: number; cost: number } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setNeedCoinsInfo(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!needCoinsInfo) return;
    const timer = window.setTimeout(() => {
      setNeedCoinsInfo(null);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [needCoinsInfo]);

  if (!isOpen) return null;

  const handleCardClick = (level: LevelInfo, index: number) => {
    const isUnlocked = Boolean(level.unlocked);
    if (isUnlocked) {
      setNeedCoinsInfo(null);
      onSelectLevel(level.id);
    } else {
      const claimCost = level.cost || index * 50000;
      if (userCoins >= claimCost) {
        setNeedCoinsInfo(null);
        if (onUnlockLevel) {
          onUnlockLevel(level);
        }
      } else {
        setNeedCoinsInfo({ id: level.id, cost: claimCost });
      }
    }
  };

  return (
    <div
      id="stage-select-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 notch-safe-all animate-fade-in select-none"
    >
      <div
        id="stage-select-modal"
        className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] landscape:max-h-[92vh] bg-slate-950/95 border-2 border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden text-white"
      >
        {/* Need Coins Floating Toast (Shows ONLY 'Need Coins <cost>') */}
        {needCoinsInfo && (
          <div
            id="stage-need-coins-alert"
            className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce"
          >
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-950/95 border-2 border-amber-400 text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,0,0,0.9)] backdrop-blur-md whitespace-nowrap">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 shrink-0" />
              <span>Need Coins {needCoinsInfo.cost.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-slate-900/50 to-orange-950/40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-wider text-white uppercase">
              Desert Stages
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coins Balance Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-black shadow-inner">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
              <span>{userCoins.toLocaleString()}</span>
            </div>

            <button
              id="close-stage-modal-btn"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Stages"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Stages Grid: Stage Photos with Coin Requirement & Claim Action */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            {levels.map((level, index) => {
              const isUnlocked = Boolean(level.unlocked);
              const isSelected = isUnlocked && selectedLevelId === level.id;
              const claimCost = level.cost || index * 50000;
              const canClaim = userCoins >= claimCost;
              const isShowingNeedCoins = needCoinsInfo?.id === level.id;

              return (
                <div
                  key={level.id}
                  id={`stage-card-${level.id}`}
                  onClick={() => handleCardClick(level, index)}
                  className={`group relative rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer flex flex-col ${
                    isSelected
                      ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/60 scale-[1.02] bg-slate-900'
                      : isUnlocked
                      ? 'border-white/15 hover:border-amber-400/50 hover:scale-[1.01] bg-black/40'
                      : isShowingNeedCoins
                      ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-black/80'
                      : canClaim
                      ? 'border-amber-500/60 hover:border-amber-400 bg-black/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'border-slate-800 hover:border-slate-600 bg-black/60 opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Stage Image with Aspect Ratio */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                    <img
                      src={`/stages/stage${level.id}.jpg`}
                      alt=""
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        !isUnlocked ? 'brightness-75' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

                    {/* Active Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/50">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Locked Indicator (Lock Icon only) */}
                    {!isUnlocked && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/80 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-md backdrop-blur-xs">
                        <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </div>
                    )}

                    {/* Bottom Claim / Coin Bar */}
                    <div className="absolute inset-x-0 bottom-0 z-10 p-1.5 sm:p-2 flex items-center justify-between gap-1 bg-black/75 backdrop-blur-xs border-t border-white/10">
                      {!isUnlocked ? (
                        isShowingNeedCoins ? (
                          <div className="w-full flex items-center justify-center gap-1 text-amber-300 font-black text-[9px] sm:text-[11px] uppercase tracking-wide whitespace-nowrap">
                            <Coins className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                            <span>Need Coins {claimCost.toLocaleString()}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 text-amber-400 font-black text-[10px] sm:text-xs">
                              <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                              <span>{claimCost.toLocaleString()}</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors ${
                                canClaim
                                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950'
                                  : 'bg-white/10 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              CLAIM
                            </span>
                          </>
                        )
                      ) : (
                        <div className="w-full flex items-center justify-center">
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-400">
                            SELECTED
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-transform cursor-pointer"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
