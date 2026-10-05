import { BikeConfig } from '../types';
import { BikePhysics, ControlsState } from './physics';

// ==========================================
// 1. DEDICATED WHEEL RENDERER (PER BIKE MODEL)
// ==========================================
export const renderBikeWheel = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  isFront: boolean,
  isOffsetBackground: boolean = false
) => {
  const radius = config.wheelRadius || 19;
  const bikeId = config.id;

  // Background offset wheel for Quad ATV (renders darker in 3D perspective)
  if (isOffsetBackground) {
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  switch (bikeId) {
    // ----------------------------------------------------
    // QUAD ATV WHEEL: Deep Dual Mud Lugs & Blue Beadlock
    // ----------------------------------------------------
    case 'dune_quad_400': {
      // Wide balloon tyre
      ctx.fillStyle = '#0b0f19';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
      ctx.fill();

      // Heavy ATV Chevron Mud Paddles
      ctx.fillStyle = '#020617';
      const numLugs = 10;
      for (let i = 0; i < numLugs; i++) {
        const ang = (i / numLugs) * Math.PI * 2;
        const lx = Math.cos(ang) * radius;
        const ly = Math.sin(ang) * radius;
        ctx.fillRect(lx - 2.5, ly - 2.5, 5, 5);
      }

      // Electric Blue Alloy Beadlock Rim
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 7, 0, Math.PI * 2);
      ctx.fill();

      // 5 Heavy-Duty Steel Lug Nuts
      ctx.fillStyle = '#e2e8f0';
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const nx = Math.cos(ang) * (radius - 5.5);
        const ny = Math.sin(ang) * (radius - 5.5);
        ctx.beginPath();
        ctx.arc(nx, ny, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Heavy 4x4 Axle Hub
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ----------------------------------------------------
    // SULTAN CHOPPER: Thin Tall Front, Fat Deep-Dish Rear
    // ----------------------------------------------------
    case 'golden_chopper': {
      if (isFront) {
        // Narrow, high-diameter 21" chopper front wheel
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
        ctx.fill();

        // Narrow Chrome/Gold Rim
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
        ctx.stroke();

        // 12 Fine Gleaming Golden Spokes
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.0;
        for (let s = 0; s < 12; s++) {
          const sang = (s / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(sang) * (radius - 3), Math.sin(sang) * (radius - 3));
          ctx.stroke();
        }

        // Small bullet hub
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Fat, wide 16" deep-dish custom rear chopper wheel
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Deep dish gold & chrome solid rim
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, 0, radius - 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, 0, radius - 7, 0, Math.PI * 2);
        ctx.fill();

        // Chrome circular cutouts
        ctx.fillStyle = '#713f12';
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * (radius - 5.5), Math.sin(ang) * (radius - 5.5), 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Chrome axle nut
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    // ----------------------------------------------------
    // CYBER PHANTOM: Tron Glowing Neon Cyan Light-Wheels
    // ----------------------------------------------------
    case 'cyber_phantom_900': {
      // Carbon outer rim
      ctx.fillStyle = '#050508';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Neon Cyan Outer Ring
      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
      ctx.stroke();

      // Ultraviolet Inner Core Ring
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
      ctx.stroke();

      // 4 Aerodynamic Cyber Vanes
      for (let s = 0; s < 4; s++) {
        const sang = (s / 4) * Math.PI * 2;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sang) * (radius - 8), Math.sin(sang) * (radius - 8));
        ctx.lineTo(Math.cos(sang + 0.3) * (radius - 3), Math.sin(sang + 0.3) * (radius - 3));
        ctx.stroke();
      }

      // Glowing Hubless Center Void
      ctx.fillStyle = '#090514';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    // ----------------------------------------------------
    // GHOST PEARL RR: Forged Red Track Wheels & Dual Wave Discs
    // ----------------------------------------------------
    case 'desert_ghost_rr': {
      // Ultra-low profile slick sport tire
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Forged Crimson Red Sport Rim
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Rim cavity
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Oversized Drilled Wave Disc Rotor
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 7, 0, Math.PI * 2);
      ctx.stroke();

      // Red Racing Caliper
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(radius - 11, -3.5, 5, 7);

      // 5 Lightweight Forged Red Alloy Spokes
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      for (let s = 0; s < 5; s++) {
        const sang = (s / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sang) * (radius - 4), Math.sin(sang) * (radius - 4));
        ctx.stroke();
      }

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ----------------------------------------------------
    // VENOM BOBBER: Chunky Vintage Balloon Tyre & Wire Spokes
    // ----------------------------------------------------
    case 'venom_bobber_1200': {
      // Chunky Fat Balloon Tire
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Gloss Black Outer Rim with Toxic Lime Pinstripe
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Deep Black Hub Cavity
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
      ctx.fill();

      // Heavy Wire Spokes (8 double-cross)
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 8; s++) {
        const sang = (s / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sang) * (radius - 4), Math.sin(sang) * (radius - 4));
        ctx.stroke();
      }

      // Chrome Bullet Hub
      ctx.fillStyle = '#e4e4e7';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ----------------------------------------------------
    // SOLAR FLARE: Supersonic Rocket Turbine Fan Wheel
    // ----------------------------------------------------
    case 'solar_flare_mach1': {
      ctx.fillStyle = '#0b0f19';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Fiery Glowing Solar Rim Ring
      ctx.save();
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
      ctx.stroke();

      // Metallic bronze turbine disc
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
      ctx.fill();

      // 6 Supersonic Air Turbine Blades
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      for (let s = 0; s < 6; s++) {
        const sang = (s / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sang) * 4, Math.sin(sang) * 4);
        ctx.lineTo(Math.cos(sang + 0.4) * (radius - 5), Math.sin(sang + 0.4) * (radius - 5));
        ctx.stroke();
      }

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    // ----------------------------------------------------
    // TITAN OVERLORD: Heavy Industrial Crawler Beadlock Wheel
    // ----------------------------------------------------
    case 'titan_dune_crawler': {
      // Massive All-Terrain Tire with Deep Sand Paddles
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
      ctx.fill();

      // Deep Sand Digging Paddles
      ctx.fillStyle = '#0f172a';
      for (let s = 0; s < 12; s++) {
        const ang = (s / 12) * Math.PI * 2;
        ctx.fillRect(Math.cos(ang) * (radius + 0.5) - 2.5, Math.sin(ang) * (radius + 0.5) - 2.5, 5, 5);
      }

      // Armored Bronze Beadlock Ring
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
      ctx.fill();

      // Dark steel center disc
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 6.5, 0, Math.PI * 2);
      ctx.fill();

      // 8 Industrial Hex Bolts
      ctx.fillStyle = '#fde68a';
      for (let b = 0; b < 8; b++) {
        const bang = (b / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(bang) * (radius - 4.5), Math.sin(bang) * (radius - 4.5), 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Heavy 8-Lug Center Hub
      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ----------------------------------------------------
    // DAKAR MIRAGE: Anodized Bronze Desert Rally Wheel
    // ----------------------------------------------------
    case 'sahara_sandstorm_500': {
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
      ctx.fill();

      // Sand Knobbies
      ctx.fillStyle = '#020617';
      for (let k = 0; k < 12; k++) {
        const ang = (k / 12) * Math.PI * 2;
        ctx.fillRect(Math.cos(ang) * radius - 2, Math.sin(ang) * radius - 2, 4, 4);
      }

      // Anodized Dakar Bronze Rim
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Heavy-Duty Rally Spokes
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 8; s++) {
        const sang = (s / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sang) * (radius - 5), Math.sin(sang) * (radius - 5));
        ctx.stroke();
      }

      // Disc Brake & Red Rally Caliper
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.fillRect(radius - 12, -3.5, 4, 7);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ----------------------------------------------------
    // THUNDERBOLT: Supercross Emerald Green Rim Tape & Knobbies
    // ----------------------------------------------------
    case 'nitro_supercross': {
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
      ctx.fill();

      // Cross Knobbies
      ctx.fillStyle = '#0f172a';
      for (let k = 0; k < 12; k++) {
        const ang = (k / 12) * Math.PI * 2;
        ctx.fillRect(Math.cos(ang) * radius - 2, Math.sin(ang) * radius - 2, 4, 4);
      }

      // Gloss Black Rim
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
      ctx.fill();

      // Vivid Emerald Green Rim Tape
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
      ctx.stroke();

      // Black spokes
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 6; s++) {
        const sang = (s / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sang) * (radius - 5), Math.sin(sang) * (radius - 5));
        ctx.stroke();
      }

      ctx.fillStyle = '#eab308'; // Gold billet hub
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ----------------------------------------------------
    // APEX RALLY / DEFAULT: Red Racing Motocross
    // ----------------------------------------------------
    default: {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Dirt Knobbies
      ctx.fillStyle = '#020617';
      for (let k = 0; k < 12; k++) {
        const ang = (k / 12) * Math.PI * 2;
        ctx.fillRect(Math.cos(ang) * (radius - 1) - 2, Math.sin(ang) * (radius - 1) - 2, 4, 4);
      }

      ctx.fillStyle = config.wheelColor || '#18181b';
      ctx.beginPath();
      ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = config.accentColor || '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(radius - 12, -4, 5, 8);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 6; s++) {
        const sang = (s / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sang) * (radius - 6), Math.sin(sang) * (radius - 6));
        ctx.stroke();
      }

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
};

// ==========================================
// 2. DEDICATED CHASSIS RENDERERS (10 BIKES)
// ==========================================

// --- BIKE 1: APEX RALLY 350R (Crimson Red / Black Motocross) ---
export const renderChassisApexRally = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase;
  const fX = halfBase;
  const rY = phys.rideHeight;
  const fY = phys.rideHeight;

  // Gold drive chain & silver alloy swingarm
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.lineTo(rX, rY);
  ctx.stroke();

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(rX, rY);
  ctx.lineTo(-12, 10);
  ctx.stroke();

  // Red monoshock spring
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, rY - 5);
  ctx.lineTo(-8, 4);
  ctx.stroke();

  // Inverted gold WP racing forks
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(fX, fY);
  ctx.lineTo(16, -20);
  ctx.stroke();

  // Black lower fork sliders
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(fX, fY);
  ctx.lineTo(fX - 8, fY - 14);
  ctx.stroke();

  // Engine block with silver cooling fins
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-16, -5, 28, 20, 4);
  ctx.fill();

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  for (let fin = -2; fin <= 11; fin += 3.5) {
    ctx.beginPath();
    ctx.moveTo(-14, fin);
    ctx.lineTo(9, fin);
    ctx.stroke();
  }

  // Dual upswept titanium exhaust with burnt blue tips
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-4, 5);
  ctx.quadraticCurveTo(-20, 2, -26, -5);
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-36, -9, 16, 5.5, 2);
  ctx.roundRect(-34, -16, 14, 5.5, 2);
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Crimson red racing plastics
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(24, -18); // High beak
  ctx.lineTo(16, -23);
  ctx.lineTo(2, -25);  // Tank peak
  ctx.lineTo(-14, -22);
  ctx.lineTo(-28, -22); // Tail fender
  ctx.lineTo(-30, -17);
  ctx.lineTo(-18, -10);
  ctx.lineTo(2, -8);
  ctx.closePath();
  ctx.fill();

  // Black radiator shroud accent
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.moveTo(12, -18);
  ctx.lineTo(0, -22);
  ctx.lineTo(-10, -14);
  ctx.lineTo(4, -12);
  ctx.closePath();
  ctx.fill();

  // White competition decal #7
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 9px sans-serif';
  ctx.fillText('7', -2, -14);

  // Black textured sport seat
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-24, -24, 22, 5, 2);
  ctx.fill();

  // Motocross Handlebars with red crossbar pad
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(14, -21);
  ctx.lineTo(11, -29);
  ctx.stroke();

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(8, -31, 7, 4);
};

// --- BIKE 2: DUNE BEAST ATV (Electric Blue & Slate 4-Wheel Quad) ---
export const renderChassisDuneQuad = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase;
  const fX = halfBase;
  const rY = phys.rideHeight;
  const fY = phys.rideHeight;

  // Dual A-Arm Wishbone Suspension
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, 4);
  ctx.lineTo(rX + 4, rY - 2);
  ctx.moveTo(-10, 12);
  ctx.lineTo(rX + 4, rY + 4);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(8, 2);
  ctx.lineTo(fX - 4, fY - 2);
  ctx.moveTo(8, 10);
  ctx.lineTo(fX - 4, fY + 4);
  ctx.stroke();

  // Blue Coilover Shocks
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-12, rY - 6);
  ctx.lineTo(-4, 0);
  ctx.moveTo(fX - 8, fY - 6);
  ctx.lineTo(6, -2);
  ctx.stroke();

  // Heavy Quad Engine & 4WD Transmission Box
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.roundRect(-16, -6, 32, 22, 5);
  ctx.fill();

  // Front Heavy Aluminum Skid Plate
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(10, 16);
  ctx.lineTo(26, 12);
  ctx.lineTo(28, 4);
  ctx.lineTo(12, 10);
  ctx.closePath();
  ctx.fill();

  // Heavy Steel Front Bull-Bar / Brush Guard
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(18, -6);
  ctx.lineTo(30, 2);
  ctx.lineTo(26, 14);
  ctx.stroke();

  // Dual Round Yellow Fog Lamps on Bull-bar
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(28, -2, 3.5, 0, Math.PI * 2);
  ctx.arc(28, 6, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Wide Electric Blue Front Mudguard / Quad Cowl
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(28, -8);
  ctx.lineTo(18, -16);
  ctx.lineTo(4, -20);
  ctx.lineTo(-12, -18);
  ctx.lineTo(-30, -14); // Rear flared quad fender
  ctx.lineTo(-32, -4);
  ctx.lineTo(-24, -2);
  ctx.lineTo(10, -4);
  ctx.closePath();
  ctx.fill();

  // Dark Slate Accent Panel
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(16, -14);
  ctx.lineTo(4, -18);
  ctx.lineTo(-10, -12);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();

  // Rear Black Steel Utility Rack
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeRect(-36, -20, 14, 5);
  ctx.strokeRect(-34, -24, 10, 4);

  // Long Flat Quad Two-Up Saddle
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-24, -22, 28, 6, 3);
  ctx.fill();

  // Wide High ATV Handlebars with Blue Handguards
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(12, -16);
  ctx.lineTo(10, -28);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(7, -30, 8, 4);
};

// --- BIKE 3: THUNDERBOLT 450R (Emerald Green Pro Supercross) ---
export const renderChassisThunderbolt = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase;
  const fX = halfBase;
  const rY = phys.rideHeight;
  const fY = phys.rideHeight;

  // Gold drive chain & silver perimeter swingarm
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.lineTo(rX, rY);
  ctx.stroke();

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(rX, rY);
  ctx.lineTo(-12, 10);
  ctx.stroke();

  // Neon Green monoshock coil spring
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-18, rY - 5);
  ctx.lineTo(-8, 4);
  ctx.stroke();

  // Inverted Gold Factory Racing Forks
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(fX, fY);
  ctx.lineTo(16, -20);
  ctx.stroke();

  // Emerald green race plastics
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.moveTo(25, -19); // High supercross beak
  ctx.lineTo(17, -24);
  ctx.lineTo(2, -26);
  ctx.lineTo(-14, -23);
  ctx.lineTo(-29, -24); // High sharp tail
  ctx.lineTo(-30, -18);
  ctx.lineTo(-16, -10);
  ctx.lineTo(4, -8);
  ctx.closePath();
  ctx.fill();

  // Lime green racing slash livery
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.moveTo(14, -18);
  ctx.lineTo(2, -23);
  ctx.lineTo(-8, -15);
  ctx.lineTo(6, -12);
  ctx.closePath();
  ctx.fill();

  // Competition Number #45
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 8px sans-serif';
  ctx.fillText('45', -3, -15);

  // Black ribbed grip seat with green traction stripes
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-24, -25, 23, 5, 2);
  ctx.fill();

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.2;
  for (let s = -20; s <= -4; s += 4) {
    ctx.beginPath();
    ctx.moveTo(s, -25);
    ctx.lineTo(s + 2, -20);
    ctx.stroke();
  }

  // FMF Curled Exhaust Expansion Chamber & Carbon Silencer
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-2, 4);
  ctx.quadraticCurveTo(-18, 0, -26, -7);
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-36, -11, 15, 5, 2);
  ctx.fill();

  // Green Pro-Taper Handlebars
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(14, -22);
  ctx.lineTo(11, -30);
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.fillRect(8, -32, 7, 4);
};

// --- BIKE 4: SULTAN DESERT CHOPPER (Long Gold Springer Fork & Ape Hangers) ---
export const renderChassisGoldenChopper = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase - 4; // Raked longer base
  const fX = halfBase + 8;  // Extreme forward raked front axle
  const rY = phys.rideHeight + 2;
  const fY = phys.rideHeight;

  // Ultra-Long Raked Chrome & Gold Springer Fork
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(fX, fY);
  ctx.lineTo(14, -24);
  ctx.stroke();

  // Twin Chrome Springer Springs
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(fX - 4, fY - 8);
  ctx.lineTo(11, -21);
  ctx.stroke();

  // Chrome Low Rigid Frame
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(rX, rY);
  ctx.lineTo(-8, 12);
  ctx.lineTo(10, 10);
  ctx.lineTo(14, -24);
  ctx.stroke();

  // Giant Exposed Polished Chrome V-Twin Engine Block
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-14, -4, 26, 18, 4);
  ctx.fill();

  // Twin V-Twin Chrome Cylinder Heads
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(-12, -7, 10, 8, 2);
  ctx.roundRect(0, -6, 10, 8, 2);
  ctx.fill();

  // Chrome Pushrod Tubes
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -5);
  ctx.lineTo(-8, 5);
  ctx.moveTo(4, -4);
  ctx.lineTo(6, 6);
  ctx.stroke();

  // Dual Straight Drag Exhaust Pipes (Extending long out back)
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-4, 4);
  ctx.lineTo(-38, 6);
  ctx.moveTo(6, 8);
  ctx.lineTo(-36, 11);
  ctx.stroke();

  // Sculpted Teardrop Gold Fuel Tank
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(14, -22);
  ctx.quadraticCurveTo(4, -30, -6, -21);
  ctx.lineTo(0, -14);
  ctx.lineTo(12, -15);
  ctx.closePath();
  ctx.fill();

  // Chrome tank highlights
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(12, -22);
  ctx.quadraticCurveTo(4, -27, -4, -20);
  ctx.stroke();

  // High Button-Tufted King & Queen Stepped Seat
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.moveTo(-6, -21);
  ctx.lineTo(-14, -22);
  ctx.lineTo(-20, -28); // Stepped high back
  ctx.lineTo(-26, -28);
  ctx.lineTo(-26, -17);
  ctx.lineTo(-6, -15);
  ctx.closePath();
  ctx.fill();

  // Tall Chrome Sissy Bar standing behind rider
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-26, -16);
  ctx.lineTo(-29, -46);
  ctx.lineTo(-31, -46);
  ctx.lineTo(-28, -16);
  ctx.stroke();

  // Chrome Vintage Teardrop Headlamp
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(17, -24, 4, 0, Math.PI * 2);
  ctx.fill();

  // Tall Gleaming Chrome Ape-Hanger Handlebars
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(13, -24);
  ctx.lineTo(9, -38);
  ctx.lineTo(7, -42);
  ctx.stroke();

  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(4, -43, 7, 4);
};

// --- BIKE 5: CYBER PHANTOM NEO-9 (Futuristic Cyan & Violet Monocoque) ---
export const renderChassisCyberPhantom = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase;
  const fX = halfBase;
  const rY = phys.rideHeight;
  const fY = phys.rideHeight;

  // Carbon Monocoque Swingarm & Front Hub-Steering
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(rX, rY);
  ctx.lineTo(0, 4);
  ctx.lineTo(fX, fY);
  ctx.stroke();

  // Pulsing Cyan Underglow Trail
  ctx.save();
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-24, 10);
  ctx.lineTo(20, 10);
  ctx.stroke();

  // Enclosed Matte Carbon Aerodynamic Body
  ctx.fillStyle = '#05050a';
  ctx.beginPath();
  ctx.moveTo(28, -16); // Sharp laser nose
  ctx.lineTo(18, -25);
  ctx.lineTo(2, -27);
  ctx.lineTo(-16, -24);
  ctx.lineTo(-34, -22); // Low swept tail
  ctx.lineTo(-30, -10);
  ctx.lineTo(-12, 2);
  ctx.lineTo(14, 0);
  ctx.closePath();
  ctx.fill();

  // Glowing Cyan Circuit Traces
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(22, -18);
  ctx.lineTo(10, -22);
  ctx.lineTo(-8, -17);
  ctx.lineTo(-24, -21);
  ctx.stroke();

  // Violet Cyber Winglets / Air Vanes
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.moveTo(-24, -24);
  ctx.lineTo(-36, -34);
  ctx.lineTo(-30, -22);
  ctx.closePath();
  ctx.fill();

  // Glowing Plasma Reactor Core Port
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.arc(-2, -6, 5, 0, Math.PI * 2);
  ctx.fill();

  // Horizontal Cyan Laser Headlight Slit
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(26, -18, 5, 2.5);

  // Floating Holographic HUD Console
  ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
  ctx.fillRect(8, -33, 6, 4);
  ctx.restore();

  // Sleek Aerodynamic Low Handlebars
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(14, -23);
  ctx.lineTo(12, -28);
  ctx.stroke();
};

// --- BIKE 6: GHOST PEARL RR 1000 (Pearl White & Crimson Superbike) ---
export const renderChassisGhostPearlRR = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase;
  const fX = halfBase;
  const rY = phys.rideHeight;
  const fY = phys.rideHeight;

  // Aluminum twin-spar race swingarm & USD forks
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(rX, rY);
  ctx.lineTo(-10, 8);
  ctx.stroke();

  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(fX, fY);
  ctx.lineTo(14, -18);
  ctx.stroke();

  // Full Pearl White Racing Fairing
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(26, -16); // Sharp aero nose
  ctx.lineTo(18, -23);
  ctx.lineTo(2, -25);
  ctx.lineTo(-14, -21);
  ctx.lineTo(-28, -20); // Monoposto tail cowl
  ctx.lineTo(-26, -14);
  ctx.lineTo(-8, 4);    // Enclosed lower belly pan
  ctx.lineTo(12, 4);
  ctx.lineTo(24, -6);
  ctx.closePath();
  ctx.fill();

  // Crimson Red Speed-Block Livery
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(22, -17);
  ctx.lineTo(8, -22);
  ctx.lineTo(0, -14);
  ctx.lineTo(14, -12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(-16, -20);
  ctx.lineTo(-26, -19);
  ctx.lineTo(-24, -15);
  ctx.lineTo(-14, -16);
  ctx.closePath();
  ctx.fill();

  // Carbon Fiber Front Downforce Winglets
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(20, -18);
  ctx.lineTo(28, -17);
  ctx.lineTo(22, -14);
  ctx.closePath();
  ctx.fill();

  // Tinted Bubble Windscreen
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.beginPath();
  ctx.moveTo(18, -23);
  ctx.quadraticCurveTo(8, -32, 2, -26);
  ctx.closePath();
  ctx.fill();

  // Akrapovič Upswept Carbon Silencer with Red Tip
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-36, -8, 16, 5.5, 2);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-38, -7.5, 3, 4.5);

  // Low Racing Clip-On Handlebars
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(14, -20);
  ctx.lineTo(12, -25);
  ctx.stroke();
};

// --- BIKE 7: VENOM V-TWIN BOBBER (Toxic Lime & Matte Black Muscle Bobber) ---
export const renderChassisVenomBobber = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase;
  const fX = halfBase;
  const rY = phys.rideHeight;
  const fY = phys.rideHeight;

  // Rigid Black Steel Hardtail Frame
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(rX, rY);
  ctx.lineTo(-8, 10);
  ctx.lineTo(12, 8);
  ctx.lineTo(14, -20);
  ctx.stroke();

  // Front Black Springer Forks
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(fX, fY);
  ctx.lineTo(14, -20);
  ctx.stroke();

  // Massive 1200cc Black & Chrome V-Twin Engine
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(-14, -4, 26, 18, 4);
  ctx.fill();

  // Twin Chrome Rocker Covers
  ctx.fillStyle = '#e4e4e7';
  ctx.beginPath();
  ctx.roundRect(-12, -7, 9, 7, 2);
  ctx.roundRect(1, -6, 9, 7, 2);
  ctx.fill();

  // Round Chrome Air Cleaner
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.arc(-2, 2, 5, 0, Math.PI * 2);
  ctx.fill();

  // Dual Wrapped Ceramic Black Shorty Pipes
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-4, 5);
  ctx.lineTo(-24, 7);
  ctx.moveTo(6, 9);
  ctx.lineTo(-22, 12);
  ctx.stroke();

  // Toxic Lime Peanut Gas Tank
  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.moveTo(14, -18);
  ctx.quadraticCurveTo(4, -26, -6, -18);
  ctx.lineTo(0, -12);
  ctx.lineTo(12, -13);
  ctx.closePath();
  ctx.fill();

  // Venom Black Racing Stripe
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(12, -18);
  ctx.lineTo(-4, -17);
  ctx.stroke();

  // Chopped Minimalist Rear Bobber Fender
  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.arc(rX, rY, config.wheelRadius + 3, -Math.PI * 0.85, -Math.PI * 0.35);
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Solo Sprung Leather Bobber Saddle with Chrome Springs
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-16, -15);
  ctx.lineTo(-16, -19);
  ctx.stroke();

  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-18, -21, 14, 4.5, 2);
  ctx.fill();

  // Flat Drag Handlebars with Bar-End Mirrors
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(14, -20);
  ctx.lineTo(12, -26);
  ctx.stroke();

  ctx.fillStyle = '#84cc16';
  ctx.fillRect(8, -28, 8, 4);
};

// --- BIKE 8: DAKAR MIRAGE 550 (Blaze Orange Dakar Navigation Tower) ---
export const renderChassisDakarMirage = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase;
  const fX = halfBase;
  const rY = phys.rideHeight;
  const fY = phys.rideHeight;

  // Heavy rally swingarm & WP suspension
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(rX, rY);
  ctx.lineTo(-12, 10);
  ctx.stroke();

  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, rY - 5);
  ctx.lineTo(-8, 4);
  ctx.stroke();

  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(fX, fY);
  ctx.lineTo(16, -20);
  ctx.stroke();

  // Heavy Brushed Aluminum Wrap-Around Bash Plate
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(-14, 14);
  ctx.lineTo(16, 12);
  ctx.lineTo(18, 4);
  ctx.lineTo(-12, 4);
  ctx.closePath();
  ctx.fill();

  // Massive Dual Dakar Endurance Tanks (Orange & Navy)
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(20, -18);
  ctx.lineTo(14, -26);
  ctx.lineTo(0, -28);
  ctx.lineTo(-16, -23);
  ctx.lineTo(-28, -23); // Rear tool pack
  ctx.lineTo(-26, -14);
  ctx.lineTo(-12, -4);
  ctx.lineTo(14, -2);
  ctx.closePath();
  ctx.fill();

  // Deep Navy Rally Decal
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(12, -22);
  ctx.lineTo(0, -25);
  ctx.lineTo(-10, -16);
  ctx.lineTo(6, -14);
  ctx.closePath();
  ctx.fill();

  // TALL CLEAR DAKAR NAVIGATION TOWER
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(22, -18);
  ctx.lineTo(24, -36); // High vertical rally shield
  ctx.lineTo(16, -26);
  ctx.closePath();
  ctx.fill();

  // Dual Vertically Stacked Projector Headlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(22, -26, 3, 0, Math.PI * 2);
  ctx.arc(22, -20, 3, 0, Math.PI * 2);
  ctx.fill();

  // High-Mounted Rally Megaphone Exhaust (Above sand level)
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-6, 2);
  ctx.quadraticCurveTo(-18, -4, -34, -14);
  ctx.stroke();

  // Flat desert rally seat
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-22, -25, 22, 5, 2);
  ctx.fill();

  // Rally Handlebars with GPS Roadbook console
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(14, -21);
  ctx.lineTo(12, -29);
  ctx.stroke();

  ctx.fillStyle = '#f97316';
  ctx.fillRect(8, -31, 8, 4);
};

// --- BIKE 9: SOLAR FLARE MACH-1 (Inferno Red Supersonic Jet Hyperbike) ---
export const renderChassisSolarFlare = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase;
  const fX = halfBase;
  const rY = phys.rideHeight;
  const fY = phys.rideHeight;

  // Concealed Aerodynamic Frame
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(rX, rY);
  ctx.lineTo(0, 6);
  ctx.lineTo(fX, fY);
  ctx.stroke();

  // Supersonic Fuselage (Needle-Nose Missile Shape)
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(32, -14); // Extended needle nose
  ctx.lineTo(20, -22);
  ctx.lineTo(2, -25);
  ctx.lineTo(-18, -23);
  ctx.lineTo(-36, -20); // Jet thruster tail
  ctx.lineTo(-32, -8);
  ctx.lineTo(-10, 2);
  ctx.lineTo(18, 0);
  ctx.closePath();
  ctx.fill();

  // Solar Gold Heat Shield Striping
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(24, -16);
  ctx.lineTo(10, -21);
  ctx.lineTo(-8, -16);
  ctx.lineTo(12, -12);
  ctx.closePath();
  ctx.fill();

  // TWIN ROCKET TURBINE AFTERBURNERS (ACTIVE FLAME)
  ctx.save();
  ctx.fillStyle = '#1e1b4b';
  ctx.roundRect(-42, -20, 16, 7, 2);
  ctx.roundRect(-40, -12, 16, 7, 2);
  ctx.fill();

  // Gold afterburner nozzle rings
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Thruster Jet Flare Glow
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.arc(-42, -16.5, 4.5, 0, Math.PI * 2);
  ctx.arc(-40, -8.5, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(-43, -16.5, 2.5, 0, Math.PI * 2);
  ctx.arc(-41, -8.5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Supersonic Canard Forward Winglets
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.moveTo(14, -14);
  ctx.lineTo(24, -12);
  ctx.lineTo(18, -8);
  ctx.closePath();
  ctx.fill();

  // Gold-Tinted Jet Cockpit Canopy
  ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
  ctx.beginPath();
  ctx.moveTo(18, -22);
  ctx.quadraticCurveTo(8, -31, -2, -24);
  ctx.closePath();
  ctx.fill();
};

// --- BIKE 10: TITAN SAND OVERLORD (Armored Desert Crawler / Exo-Cage Rover) ---
export const renderChassisTitanOverlord = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  const halfBase = config.wheelBase / 2;
  const rX = -halfBase;
  const fX = halfBase;
  const rY = phys.rideHeight;
  const fY = phys.rideHeight;

  // Dual Heavy-Duty Remote-Reservoir Shocks
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(rX + 4, rY - 4);
  ctx.lineTo(-8, 2);
  ctx.moveTo(fX - 4, fY - 4);
  ctx.lineTo(8, 0);
  ctx.stroke();

  // Heavy Front Winch & Armored Bumper
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(20, -4, 12, 14);
  ctx.fillStyle = '#eab308'; // Winch hook
  ctx.fillRect(30, 2, 4, 4);

  // Armored Teal Steel Body Panels
  ctx.fillStyle = '#115e59';
  ctx.beginPath();
  ctx.moveTo(22, -10);
  ctx.lineTo(14, -20);
  ctx.lineTo(-2, -22);
  ctx.lineTo(-20, -20);
  ctx.lineTo(-30, -12);
  ctx.lineTo(-24, 6);
  ctx.lineTo(14, 6);
  ctx.closePath();
  ctx.fill();

  // Industrial Yellow Caution Chevron Stripes
  ctx.fillStyle = '#facc15';
  for (let c = -14; c <= 8; c += 8) {
    ctx.beginPath();
    ctx.moveTo(c, -8);
    ctx.lineTo(c + 4, -8);
    ctx.lineTo(c, 2);
    ctx.lineTo(c - 4, 2);
    ctx.closePath();
    ctx.fill();
  }

  // FULL HEAVY TUBULAR EXO-SKELETON ROLL CAGE
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  // Front pillar to roof
  ctx.moveTo(20, -10);
  ctx.lineTo(10, -38);
  // Roof bar
  ctx.lineTo(-18, -38);
  // Rear roll pillar
  ctx.lineTo(-28, -12);
  ctx.stroke();

  // Overhead Roof Rack & 4-Lamp LED Floodlight Bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-2, -42, 16, 5);

  ctx.fillStyle = '#fef08a';
  for (let l = 0; l < 4; l++) {
    ctx.beginPath();
    ctx.arc(0 + l * 4, -39.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Armored Driver Seat Inside Cage
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-16, -22, 18, 6, 2);
  ctx.fill();

  // Heavy Steering Controls
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(10, -18);
  ctx.lineTo(8, -27);
  ctx.stroke();
};

// Dispatcher for the 10 bike chassis models
export const renderChassis = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics
) => {
  switch (config.id) {
    case 'dune_quad_400':
      renderChassisDuneQuad(ctx, config, phys);
      break;
    case 'nitro_supercross':
      renderChassisThunderbolt(ctx, config, phys);
      break;
    case 'golden_chopper':
      renderChassisGoldenChopper(ctx, config, phys);
      break;
    case 'cyber_phantom_900':
      renderChassisCyberPhantom(ctx, config, phys);
      break;
    case 'desert_ghost_rr':
      renderChassisGhostPearlRR(ctx, config, phys);
      break;
    case 'venom_bobber_1200':
      renderChassisVenomBobber(ctx, config, phys);
      break;
    case 'sahara_sandstorm_500':
      renderChassisDakarMirage(ctx, config, phys);
      break;
    case 'solar_flare_mach1':
      renderChassisSolarFlare(ctx, config, phys);
      break;
    case 'titan_dune_crawler':
      renderChassisTitanOverlord(ctx, config, phys);
      break;
    case 'motocross_250':
    default:
      renderChassisApexRally(ctx, config, phys);
      break;
  }
};

// ==========================================
// 3. DEDICATED RIDER RENDERER (TAILORED PER BIKE)
// ==========================================
export const renderBikeRider = (
  ctx: CanvasRenderingContext2D,
  config: BikeConfig,
  phys: BikePhysics,
  ctrls?: ControlsState
) => {
  ctx.save();

  // Ragdoll ejection on rider out crash
  if (phys.isCrashed && phys.outType === 'rider_out') {
    const t = Math.min(3.5, phys.ragdollTumble);
    ctx.translate(-t * 18, -t * 22 + t * t * 6);
    ctx.rotate(t * 1.4);
  }

  // Active posture lean
  let leanX = 0;
  let leanY = 0;
  if (ctrls?.tiltRight) {
    leanX = 5.0;
    leanY = 4.0;
  } else if (ctrls?.tiltLeft) {
    leanX = -5.0;
    leanY = -3.5;
  }

  const bikeId = config.id;

  // Custom seating and handlebar positions per bike:
  let hipX = -10;
  let hipY = -23;
  let footX = -2;
  let footY = 4;
  let handX = 12;
  let handY = -29;
  let shoulderOffset = 0;

  if (bikeId === 'golden_chopper') {
    // Sits back, hands reach up to high ape-hangers!
    hipX = -14;
    hipY = -21;
    footX = 2;
    footY = 6;
    handX = 7;
    handY = -42; // High ape-hangers
  } else if (bikeId === 'dune_quad_400') {
    // Upright quad pilot
    hipX = -8;
    hipY = -22;
    footX = 0;
    footY = 3;
    handX = 10;
    handY = -28;
  } else if (bikeId === 'desert_ghost_rr') {
    // Tucked low in aerodynamic racing position
    hipX = -12;
    hipY = -21;
    footX = -4;
    footY = 2;
    handX = 12;
    handY = -25;
    shoulderOffset = -2;
  } else if (bikeId === 'venom_bobber_1200') {
    hipX = -12;
    hipY = -21;
    footX = 2;
    footY = 4;
    handX = 10;
    handY = -26;
  }

  // Leg & Boots
  const kneeX = hipX + 15 + leanX * 0.25;
  const kneeY = hipY + 11 + leanY * 0.2;

  ctx.strokeStyle = config.secondaryColor || '#1e293b';
  ctx.lineWidth = 7.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(kneeX, kneeY);
  ctx.lineTo(footX, footY);
  ctx.stroke();

  // Boot
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(footX - 4, footY - 2, 10, 6, 2);
  ctx.fill();

  // Torso / Suit
  const shoulderX = hipX + 13 + leanX;
  const shoulderY = hipY - 16 + leanY + shoulderOffset;

  ctx.strokeStyle = config.color;
  ctx.lineWidth = 9.5;
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(shoulderX, shoulderY);
  ctx.stroke();

  // Suit Chest Accent Line
  ctx.strokeStyle = config.accentColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(hipX + 3, hipY - 4);
  ctx.lineTo(shoulderX, shoulderY + 4);
  ctx.stroke();

  // Arm & Hand Grip
  const elbowX = (shoulderX + handX) / 2 + (bikeId === 'golden_chopper' ? -3 : 2);
  const elbowY = (shoulderY + handY) / 2 + (bikeId === 'golden_chopper' ? 2 : 2);

  ctx.strokeStyle = config.color;
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(elbowX, elbowY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Glove
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(handX, handY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Head & Helmet
  const headX = shoulderX + 4;
  const headY = shoulderY - 10;

  // Helmet Shell
  ctx.fillStyle = config.accentColor;
  ctx.beginPath();
  ctx.arc(headX, headY, 9.5, 0, Math.PI * 2);
  ctx.fill();

  if (bikeId === 'cyber_phantom_900') {
    // Glowing Cyan Visor Line
    ctx.save();
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(headX + 2, headY - 2);
    ctx.lineTo(headX + 9, headY - 1);
    ctx.stroke();
    ctx.restore();
  } else {
    // Sport Helmet Peak
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(headX + 5, headY - 6);
    ctx.lineTo(headX + 15, headY - 4);
    ctx.lineTo(headX + 7, headY - 1);
    ctx.closePath();
    ctx.fill();

    // Iridescent / Tinted Visor
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(headX + 4, headY - 2.5, 7, 5, 2);
    ctx.fill();
  }

  ctx.restore();
};

// ==========================================
// 4. MAIN INTEGRATED BIKE & RIDER PIPELINE
// ==========================================
export const renderCompleteBike = (
  ctx: CanvasRenderingContext2D,
  phys: BikePhysics,
  ctrls?: ControlsState
) => {
  const config = phys.config;

  ctx.save();

  // Floating crash / out indicator badge over the bike
  if (phys.isCrashed) {
    ctx.save();
    ctx.translate(phys.cx, phys.cy - 46);
    const isTime = phys.outType === 'time_out';
    const isFuel = phys.outType === 'fuel_out';
    const isRider = phys.outType === 'rider_out';
    const badgeText = isTime
      ? '⏱️ TIME OUT!'
      : isFuel
      ? '⛽ FUEL OUT!'
      : isRider
      ? '👤 RIDER OUT!'
      : '💥 CRASHED OUT!';
    const badgeBg = isTime
      ? 'rgba(225, 29, 72, 0.94)'
      : isFuel
      ? 'rgba(217, 119, 6, 0.94)'
      : isRider
      ? 'rgba(234, 88, 12, 0.94)'
      : 'rgba(220, 38, 38, 0.94)';
    const badgeBorder = isTime ? '#fda4af' : isFuel ? '#fde68a' : isRider ? '#fed7aa' : '#fca5a5';

    ctx.fillStyle = badgeBg;
    ctx.beginPath();
    ctx.roundRect(-64, -15, 128, 28, 8);
    ctx.fill();
    ctx.strokeStyle = badgeBorder;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 0, 0);
    ctx.restore();
  }

  // 1. FOR 4-WHEEL ATV: Render background wheels first to give true Quad 4-wheel perspective
  if (config.id === 'dune_quad_400') {
    ctx.save();
    ctx.translate(phys.rx + 6, phys.ry - 4);
    ctx.rotate(phys.rAng);
    renderBikeWheel(ctx, config, false, true);
    ctx.restore();

    ctx.save();
    ctx.translate(phys.fx + 6, phys.fy - 4);
    ctx.rotate(phys.fAng);
    renderBikeWheel(ctx, config, true, true);
    ctx.restore();
  }

  // 2. Render Rear Foreground Wheel
  ctx.save();
  ctx.translate(phys.rx, phys.ry);
  ctx.rotate(phys.rAng);
  renderBikeWheel(ctx, config, false, false);
  ctx.restore();

  // 3. Render Front Foreground Wheel
  ctx.save();
  ctx.translate(phys.fx, phys.fy);
  ctx.rotate(phys.fAng);
  renderBikeWheel(ctx, config, true, false);
  ctx.restore();

  // 4. Render Bike Chassis & Rider in Frame coordinates
  ctx.save();
  ctx.translate(phys.cx, phys.cy);
  ctx.rotate(phys.angle + (phys.isCrashed ? Math.min(1.2, phys.ragdollTumble * 0.5) : 0));

  // Dynamic Glowing Headlight Beam
  if (!phys.isCrashed) {
    ctx.save();
    const beamGrad = ctx.createLinearGradient(20, -18, 145, -10);
    if (config.id === 'cyber_phantom_900') {
      beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.55)');
      beamGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.22)');
      beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
    } else if (config.id === 'solar_flare_mach1') {
      beamGrad.addColorStop(0, 'rgba(249, 115, 22, 0.6)');
      beamGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.2)');
      beamGrad.addColorStop(1, 'rgba(249, 115, 22, 0.0)');
    } else if (config.id === 'golden_chopper') {
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
      beamGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.2)');
      beamGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
    } else {
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      beamGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.22)');
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    }

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(20, -20);
    ctx.lineTo(140, -34);
    ctx.lineTo(150, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Model-specific Chassis
  renderChassis(ctx, config, phys);

  // Model-tailored Rider
  renderBikeRider(ctx, config, phys, ctrls);

  ctx.restore();
  ctx.restore();
};
