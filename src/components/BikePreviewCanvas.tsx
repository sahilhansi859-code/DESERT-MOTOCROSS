import React, { useEffect, useRef } from 'react';
import { BikeConfig } from '../types';
import { renderBikeWheel, renderChassis } from '../game/bikeRenderers';
import { BikePhysics } from '../game/physics';

interface Props {
  bike: BikeConfig;
  className?: string;
}

export const BikePreviewCanvas: React.FC<Props> = ({ bike, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 340;
    const height = 170;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 1. Studio Backdrop (Dark garage pedestal with subtle radial glow)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle colored floor glow based on bike color
    const glowGrad = ctx.createRadialGradient(
      width / 2,
      height - 25,
      12,
      width / 2,
      height - 25,
      120
    );
    glowGrad.addColorStop(0, `${bike.color}38`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Ground platform line & shadow
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, height - 20, width - 40, 2);

    // Soft tyre shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(width / 2 - 44, height - 19, 28, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width / 2 + 44, height - 19, 28, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Bike in Side-Profile
    ctx.save();
    const cx = width / 2;
    const cy = height - 52;
    ctx.translate(cx, cy);
    const scale = 1.25;
    ctx.scale(scale, scale);

    const halfBase = bike.wheelBase ? bike.wheelBase / 2 : 30;

    const mockPhys: BikePhysics = {
      config: bike,
      cx: 0,
      cy: 0,
      angle: 0,
      rx: -halfBase,
      ry: 22,
      fx: halfBase,
      fy: 22,
      rvx: 0,
      rvy: 0,
      fvx: 0,
      fvy: 0,
      rAng: 0,
      fAng: 0,
      rideHeight: 22,
      isCrashed: false,
      ragdollTumble: 0,
      isNitroActive: false,
    } as unknown as BikePhysics;

    // 4-Wheel ATV offset wheels
    if (bike.id === 'dune_quad_400') {
      ctx.save();
      ctx.translate(-halfBase + 6, 22 - 4);
      renderBikeWheel(ctx, bike, false, true);
      ctx.restore();

      ctx.save();
      ctx.translate(halfBase + 6, 22 - 4);
      renderBikeWheel(ctx, bike, true, true);
      ctx.restore();
    }

    // Rear Wheel
    ctx.save();
    ctx.translate(-halfBase, 22);
    renderBikeWheel(ctx, bike, false, false);
    ctx.restore();

    // Front Wheel
    ctx.save();
    ctx.translate(halfBase, 22);
    renderBikeWheel(ctx, bike, true, false);
    ctx.restore();

    // Chassis
    renderChassis(ctx, bike, mockPhys);

    ctx.restore();
  }, [bike]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-auto rounded-xl object-contain shadow-inner ${className}`}
      style={{ aspectRatio: '340/170' }}
    />
  );
};
