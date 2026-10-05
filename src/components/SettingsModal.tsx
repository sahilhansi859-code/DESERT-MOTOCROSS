import React from 'react';
import { X, Settings, Music, Volume2 } from 'lucide-react';

export interface GameSettings {
  musicVolume: number;        // 0.0 - 1.0
  isMusicEnabled: boolean;
  sfxVolume: number;          // 0.0 - 1.0
  isSfxEnabled: boolean;
  controlSensitivity: number; // 0.6 - 1.4 (1.0 = normal)
}

interface Props {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetDefaults?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onResetDefaults,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-2.5 sm:p-6 notch-safe-all bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-white">Game Settings</h2>
            </div>
          </div>

          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 space-y-2.5 sm:space-y-3 overflow-y-auto">
          {/* 1. Background Music Toggle */}
          <div className="bg-slate-950/60 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Music className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-white">Background Music</span>
            </div>

            {/* Music Toggle */}
            <button
              id="setting-music-toggle"
              onClick={() => onUpdateSettings({ isMusicEnabled: !settings.isMusicEnabled })}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                settings.isMusicEnabled
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {settings.isMusicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* 2. Bike Engine & Sound Effects Toggle */}
          <div className="bg-slate-950/60 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Volume2 className="w-4 h-4 text-orange-400" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-white">Bike Engine &amp; SFX</span>
            </div>

            {/* SFX Toggle */}
            <button
              id="setting-sfx-toggle"
              onClick={() => onUpdateSettings({ isSfxEnabled: !settings.isSfxEnabled })}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                settings.isSfxEnabled
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {settings.isSfxEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Modal Footer Line */}
        <div className="flex items-center justify-end px-4 sm:px-5 py-2.5 sm:py-3.5 border-t border-slate-800 bg-slate-950/80">
          <button
            id="save-settings-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
