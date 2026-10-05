import React, { useState } from 'react';
import { Play, Settings, Coins, ChevronRight, Bike, Compass, HelpCircle, X, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { BikeConfig, LevelInfo } from '../types';

interface Props {
  onPlayGame: () => void;
  onOpenSettings: () => void;
  onOpenBikes?: () => void;
  onOpenStages?: () => void;
  currentBike?: BikeConfig;
  currentLevelInfo?: LevelInfo;
  userCoins: number;
  onAddCoins?: (amount: number) => void;
  isMusicPlaying?: boolean;
  isMuted?: boolean;
  onToggleMusic?: () => void;
  onToggleMute?: () => void;
}

const DAILY_MISSIONS = [
  { id: 'login', title: 'Daily Desert Rider Login', reward: 100 },
  { id: 'race_500m', title: 'Ride 500m in Desert Stages', reward: 200 },
  { id: 'stunt_flip', title: 'Perform 3 Air Flips or Wheelies', reward: 250 },
];

export const HomePage: React.FC<Props> = ({
  onPlayGame,
  onOpenSettings,
  onOpenBikes,
  onOpenStages,
  userCoins,
  onAddCoins,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showDailyMissions, setShowDailyMissions] = useState(false);
  const [claimedMissions, setClaimedMissions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('desert_claimed_daily_missions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleClaimMission = (id: string, reward: number) => {
    if (claimedMissions.includes(id)) return;
    const updated = [...claimedMissions, id];
    setClaimedMissions(updated);
    try {
      localStorage.setItem('desert_claimed_daily_missions', JSON.stringify(updated));
    } catch {
      // ignore storage error
    }
    if (onAddCoins) {
      onAddCoins(reward);
    }
  };

  return (
    <div
      id="game-home-page"
      className="fixed inset-0 z-50 flex flex-col justify-between notch-safe-all p-2.5 sm:p-6 landscape:p-2 landscape:px-6 select-none overflow-hidden max-h-[100dvh] h-[100dvh]"
    >
      {/* VIVID & HIGH-IMPACT HIGHLIGHTED DESERT RIDER HERO BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-950">
        <img
          src="/desert-rider-hero.jpg"
          alt="Desert Motocross Rider Hero"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-105 contrast-110 saturate-125"
        />
        {/* Crisp, Minimal Edge Gradients (Transparent Center to Showcase the Full Rider & Scenery) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-black/30 pointer-events-none" />
        
        {/* Subtle Warm Desert Sun Glow Flare */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Bar: Brand, Help Icon, Coins & Settings */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-5xl mx-auto shrink-0 py-0.5 landscape:py-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-12 sm:h-12 landscape:w-8 landscape:h-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl shadow-amber-500/30 border-2 border-amber-400 bg-slate-900 flex-shrink-0">
            <img
              src="/desert-rider-hero.jpg"
              alt="Desert Motocross Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform scale-110 hover:scale-125 transition-transform duration-300"
            />
          </div>

          {/* Help Icon Button right next to Logo */}
          <button
            id="home-help-btn"
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 sm:w-10 sm:h-10 landscape:w-8 landscape:h-8 rounded-xl sm:rounded-2xl bg-black/60 hover:bg-black/80 text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Help"
            title="Help"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 landscape:px-2.5 landscape:py-1 rounded-xl sm:rounded-2xl bg-black/60 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black shadow-lg backdrop-blur-md">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
            <span>{userCoins.toLocaleString()}</span>
          </div>

          {/* Daily Mission Icon Button (between Coins and Settings) */}
          <button
            id="home-daily-mission-btn"
            onClick={() => setShowDailyMissions(true)}
            className="relative p-1.5 sm:px-3 sm:py-1.5 landscape:p-1.5 rounded-xl sm:rounded-2xl bg-black/60 hover:bg-black/80 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Daily Mission"
            title="Daily Mission"
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Daily Mission</span>
            {claimedMissions.length < DAILY_MISSIONS.length && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          {/* Settings Button */}
          <button
            id="home-settings-btn"
            onClick={onOpenSettings}
            className="p-1.5 sm:px-3.5 sm:py-1.5 landscape:p-1.5 rounded-xl sm:rounded-2xl bg-black/50 hover:bg-black/70 text-white border border-white/20 hover:border-white/40 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Main Center Stage: Title & Big Play Button (Sized to fit mobile landscape without scrolling) */}
      <main className="relative z-10 w-full max-w-xl mx-auto my-auto py-1 sm:py-6 landscape:py-0.5 flex flex-col items-center text-center space-y-2 sm:space-y-5 landscape:space-y-1.5 shrink-0">
        {/* Championship Emblem */}
        <div className="space-y-0.5 sm:space-y-1.5 landscape:space-y-0.5 animate-slide-up">
          <div className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-0.5 sm:py-1 rounded-full bg-black/40 border border-amber-400/50 text-amber-200 text-[9px] sm:text-xs landscape:text-[9px] font-black tracking-wide uppercase backdrop-blur-md shadow-xl shadow-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Official 2026 Championship
          </div>
          <h2 className="text-xl sm:text-5xl md:text-6xl landscape:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-orange-300 to-amber-400 uppercase tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            Desert Motocross
          </h2>
        </div>

        {/* Big Glow PLAY GAME Button */}
        <div className="w-full flex flex-col items-center pt-0.5">
          <button
            id="home-play-game-btn"
            onClick={onPlayGame}
            className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-12 py-2 sm:py-3.5 landscape:py-2 landscape:px-8 rounded-xl sm:rounded-3xl landscape:rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-sm sm:text-2xl landscape:text-base shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:shadow-[0_0_80px_rgba(245,158,11,0.95)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-amber-200"
          >
            <div className="w-6 h-6 sm:w-10 sm:h-10 landscape:w-7 landscape:h-7 rounded-lg sm:rounded-2xl bg-slate-950 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-110 transition-transform">
              <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 landscape:w-4 landscape:h-4 fill-amber-400 text-amber-400 ml-0.5" />
            </div>
            <span>PLAY GAME</span>
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 landscape:w-4 landscape:h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Quick Access Action Buttons: Bikes Garage & Desert Stages */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-sm sm:max-w-md pt-0.5">
          {onOpenBikes && (
            <button
              id="home-bikes-btn"
              onClick={onOpenBikes}
              className="flex-1 group flex items-center justify-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 landscape:py-1.5 rounded-xl sm:rounded-2xl bg-black/60 hover:bg-black/85 border border-white/20 hover:border-orange-400/80 text-white shadow-xl backdrop-blur-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 rounded-lg sm:rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform shrink-0">
                <Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-extrabold text-[11px] sm:text-sm landscape:text-xs tracking-wide uppercase group-hover:text-orange-300 transition-colors whitespace-nowrap">
                Bikes Garage
              </span>
            </button>
          )}

          {onOpenStages && (
            <button
              id="home-stages-btn"
              onClick={onOpenStages}
              className="flex-1 group flex items-center justify-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 landscape:py-1.5 rounded-xl sm:rounded-2xl bg-black/60 hover:bg-black/85 border border-white/20 hover:border-amber-400/80 text-white shadow-xl backdrop-blur-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-extrabold text-[11px] sm:text-sm landscape:text-xs tracking-wide uppercase group-hover:text-amber-300 transition-colors whitespace-nowrap">
                Desert Stages
              </span>
            </button>
          )}
        </div>
      </main>

      {/* SK GAME'S branding - clearly visible yet elegant branding */}
      <footer
        id="sk-games-brand-footer"
        className="absolute top-[90%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none flex items-center justify-center whitespace-nowrap"
      >
        <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          SK GAME&apos;S
        </span>
      </footer>

      {/* Daily Missions Modal */}
      {showDailyMissions && (
        <div
          id="home-daily-missions-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-fade-in"
          onClick={() => setShowDailyMissions(false)}
        >
          <div
            id="home-daily-missions-modal"
            className="relative w-full max-w-md bg-slate-950/95 border-2 border-amber-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-400">
                  Daily Missions
                </h3>
              </div>
              <button
                onClick={() => setShowDailyMissions(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {DAILY_MISSIONS.map((mission) => {
                const isClaimed = claimedMissions.includes(mission.id);
                return (
                  <div
                    key={mission.id}
                    className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-white/10"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-white">{mission.title}</p>
                      <div className="flex items-center gap-1 text-[11px] font-black text-amber-400">
                        <Coins className="w-3.5 h-3.5 fill-amber-400" />
                        <span>+{mission.reward} Coins</span>
                      </div>
                    </div>

                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimMission(mission.id, mission.reward)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black uppercase shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div
          id="home-help-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-fade-in"
          onClick={() => setShowHelp(false)}
        >
          <div
            id="home-help-modal"
            className="relative w-full max-w-md bg-slate-950/95 border-2 border-amber-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-400">
                  How To Play
                </h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <p><strong className="text-emerald-400">RACE:</strong> Hold to accelerate forward over desert dunes.</p>
              <p><strong className="text-red-400">BRAKE:</strong> Slow down or control your landing.</p>
              <p><strong className="text-cyan-400">FLIP / BALANCE:</strong> Use flip buttons in the air for stunts and safe landings.</p>
              <p><strong className="text-amber-400">FUEL & COINS:</strong> Collect fuel canisters before running out, and collect coins to claim new bikes and stages!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
