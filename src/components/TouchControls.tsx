import React, { useEffect } from 'react';
import { Disc3, Zap, RotateCcw, RotateCw } from 'lucide-react';
import { ControlsState } from '../game/physics';
import { soundFX } from '../game/audio';

interface Props {
  controls: ControlsState;
  setControls: React.Dispatch<React.SetStateAction<ControlsState>>;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
  distance?: number;
  targetDistance?: number;
  isEndless?: boolean;
  currentLevel?: number;
}

export const TouchControls: React.FC<Props> = ({
  controls,
  setControls,
}) => {

  // Safety release on window blur or when all touches leave screen
  useEffect(() => {
    const handleBlur = () => {
      setControls((prev) => ({
        ...prev,
        gas: false,
        brake: false,
        tiltLeft: false,
        tiltRight: false,
      }));
    };

    const handleAllTouchesEnded = (e: TouchEvent) => {
      // Only release all if literally ZERO fingers remain on the screen
      if (e.touches && e.touches.length === 0) {
        setControls((prev) => ({
          ...prev,
          gas: false,
          brake: false,
          tiltLeft: false,
          tiltRight: false,
        }));
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('touchend', handleAllTouchesEnded);
    window.addEventListener('touchcancel', handleAllTouchesEnded);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('touchend', handleAllTouchesEnded);
      window.removeEventListener('touchcancel', handleAllTouchesEnded);
    };
  }, [setControls]);

  const bindButton = (key: keyof ControlsState) => {
    const handleStart = (e: React.SyntheticEvent) => {
      e.preventDefault();
      // Ensure audio context and engine are active
      soundFX.startEngine();
      if (!soundFX.getIsMusicPlaying()) {
        soundFX.startMusic();
      }
      setControls((prev) => ({ ...prev, [key]: true }));
    };

    const handleEnd = (e: React.SyntheticEvent) => {
      e.preventDefault();
      setControls((prev) => ({ ...prev, [key]: false }));
    };

    return {
      onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        handleStart(e);
      },
      onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
        try {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {}
        handleEnd(e);
      },
      onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
        try {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {}
        handleEnd(e);
      },
      onLostPointerCapture: (e: React.PointerEvent<HTMLButtonElement>) => {
        handleEnd(e);
      },
      // Direct touch event fallback for mobile compatibility
      onTouchStart: (e: React.TouchEvent<HTMLButtonElement>) => {
        handleStart(e);
      },
      onTouchEnd: (e: React.TouchEvent<HTMLButtonElement>) => {
        handleEnd(e);
      },
      onTouchCancel: (e: React.TouchEvent<HTMLButtonElement>) => {
        handleEnd(e);
      },
      // Direct mouse events for desktop click-and-hold
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleStart(e);
      },
      onMouseUp: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleEnd(e);
      },
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
      },
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-end justify-between notch-safe-x notch-safe-bottom p-2 sm:p-5 landscape:p-1.5 landscape:px-4 select-none">
      {/* Left side: BRAKE + BACK FLIP Buttons */}
      <div className="pointer-events-auto mb-1 sm:mb-4 landscape:mb-1 flex items-end gap-1.5 sm:gap-2.5">
        <button
          id="touch-brake"
          {...bindButton('brake')}
          className={`w-18 h-18 sm:w-24 sm:h-24 landscape:w-19 landscape:h-19 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center border-3 transition-all shadow-2xl backdrop-blur-lg active:scale-95 touch-none cursor-pointer ${
            controls.brake
              ? 'bg-red-600 border-red-200 text-white shadow-[0_0_30px_rgba(239,68,68,0.9)] ring-4 ring-red-500/50'
              : 'bg-black/80 border-red-500/60 text-red-400 hover:bg-black/95 hover:border-red-400 shadow-red-950/50'
          }`}
          aria-label="Brake"
        >
          <Disc3 className={`w-6 h-6 sm:w-9 sm:h-9 landscape:w-6 landscape:h-6 mb-0.5 ${controls.brake ? 'animate-spin' : 'animate-spin-slow'}`} />
          <span className="text-[10px] sm:text-sm landscape:text-xs font-black uppercase tracking-wider">BRAKE</span>
        </button>

        <button
          id="touch-back-flip"
          {...bindButton('tiltLeft')}
          className={`w-13 h-13 sm:w-17 sm:h-17 landscape:w-14 landscape:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 sm:border-3 transition-all shadow-xl backdrop-blur-lg active:scale-95 touch-none cursor-pointer ${
            controls.tiltLeft
              ? 'bg-cyan-500 border-cyan-100 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.95)] ring-3 ring-cyan-400/50'
              : 'bg-black/80 border-cyan-500/60 text-cyan-300 hover:bg-black/95 hover:border-cyan-400 shadow-cyan-950/40'
          }`}
          aria-label="Tilt Back"
          title="Tilt Back (Left Arrow / A)"
        >
          <RotateCcw className={`w-6 h-6 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 stroke-[2.5] ${controls.tiltLeft ? '-rotate-45 transition-transform' : ''}`} />
        </button>
      </div>

      {/* Center spacer between Left and Right Controls */}
      <div className="flex-1 pointer-events-none" />

      {/* Right side: TILT FORWARD + RACE Buttons */}
      <div className="pointer-events-auto mb-1 sm:mb-4 landscape:mb-1 flex items-end gap-1.5 sm:gap-2.5">
        <button
          id="touch-next-flip"
          {...bindButton('tiltRight')}
          className={`w-13 h-13 sm:w-17 sm:h-17 landscape:w-14 landscape:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 sm:border-3 transition-all shadow-xl backdrop-blur-lg active:scale-95 touch-none cursor-pointer ${
            controls.tiltRight
              ? 'bg-orange-500 border-orange-100 text-slate-950 shadow-[0_0_25px_rgba(249,115,22,0.95)] ring-3 ring-orange-400/50'
              : 'bg-black/80 border-orange-500/60 text-orange-300 hover:bg-black/95 hover:border-orange-400 shadow-orange-950/40'
          }`}
          aria-label="Tilt Forward"
          title="Tilt Forward (Right Arrow / D)"
        >
          <RotateCw className={`w-6 h-6 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 stroke-[2.5] ${controls.tiltRight ? 'rotate-45 transition-transform' : ''}`} />
        </button>

        <button
          id="touch-gas"
          {...bindButton('gas')}
          className={`w-18 h-18 sm:w-24 sm:h-24 landscape:w-19 landscape:h-19 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center border-3 transition-all shadow-2xl backdrop-blur-lg active:scale-95 touch-none cursor-pointer ${
            controls.gas
              ? 'bg-emerald-500 border-emerald-100 text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.95)] ring-4 ring-emerald-400/50'
              : 'bg-emerald-950/90 border-emerald-400/70 text-emerald-300 hover:bg-emerald-900/95 hover:border-emerald-300 shadow-emerald-950/60'
          }`}
          aria-label="Race"
        >
          <Zap className={`w-6 h-6 sm:w-9 sm:h-9 landscape:w-6 landscape:h-6 text-yellow-300 fill-yellow-300 drop-shadow mb-0.5 ${controls.gas ? 'animate-bounce' : ''}`} />
          <span className="text-[10px] sm:text-sm landscape:text-xs font-black uppercase tracking-wider">RACE</span>
        </button>
      </div>
    </div>
  );
};
