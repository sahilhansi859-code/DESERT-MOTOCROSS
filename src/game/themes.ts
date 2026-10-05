export interface EnvironmentTheme {
  id: string;
  name: string;
  subtitle: string;
  badgeBg: string;
  badgeText: string;
  accentHex: string;
  // Sky linear gradient stops: [position 0..1, hex/rgba]
  skyStops: [number, string][];
  // Celestial body
  celestialType:
    | 'sunset_sun'
    | 'morning_sun'
    | 'canyon_sun'
    | 'crescent_moon'
    | 'full_moon'
    | 'storm_sun'
    | 'solar_eclipse'
    | 'celestial_overlord';
  // Night or cosmic atmosphere flags
  hasStars?: boolean;
  hasAuroras?: boolean;
  hasDustParticles?: boolean;
  hasEmbers?: boolean;
  // Far landmark style
  farLandmark:
    | 'pyramids'
    | 'oasis_groves'
    | 'canyon_monoliths'
    | 'ancient_obelisks'
    | 'starlight_temples'
    | 'storm_hoodoos'
    | 'volcanic_spires'
    | 'overlord_palace';
  farColor: string;
  farColorShade: string;
  // Mid distant dunes gradient
  midDuneStops: [number, string][];
  midCamelColor: string;
  // Near dunes gradient
  nearDuneStops: [number, string][];
  // Atmospheric mirage/haze gradient
  hazeStops: [number, string][];
  // Aerial soaring animals or particles
  aerialType: 'falcons' | 'oasis_herons' | 'hawks' | 'night_bats' | 'shooting_stars' | 'storm_debris' | 'cosmic_wisps';
  // Ground terrain colors
  terrainBedrockStops: [number, string][];
  duneShadowColor: string;
  duneSurfaceColor: string;
  duneHighlightColor: string;
  tireTrackColor: string;
  sandRippleColor: string;
  sandRoostColor: string;
  // Scenery props style
  sceneryStyle: 'sahara' | 'oasis' | 'canyon' | 'twilight' | 'midnight' | 'storm' | 'eclipse' | 'overlord';
}

export const BIOME_THEMES: Record<string, EnvironmentTheme> = {
  // Theme 1: Levels 1 - 4
  sahara_sunset: {
    id: 'sahara_sunset',
    name: 'Golden Sahara Sunset',
    subtitle: 'Classic amber dunes bathed in rich sunset gold',
    badgeBg: 'bg-amber-500/20 border-amber-500/50',
    badgeText: 'text-amber-400',
    accentHex: '#f59e0b',
    skyStops: [
      [0, '#ea580c'],
      [0.25, '#f97316'],
      [0.55, '#f59e0b'],
      [0.85, '#fde68a'],
      [1, '#fed7aa'],
    ],
    celestialType: 'sunset_sun',
    farLandmark: 'pyramids',
    farColor: 'rgba(180, 83, 9, 0.45)',
    farColorShade: 'rgba(120, 53, 15, 0.48)',
    midDuneStops: [
      [0, 'rgba(245, 158, 11, 0.85)'],
      [0.5, 'rgba(217, 119, 6, 0.8)'],
      [1, 'rgba(180, 83, 9, 0.75)'],
    ],
    midCamelColor: 'rgba(120, 53, 15, 0.6)',
    nearDuneStops: [
      [0, 'rgba(251, 191, 36, 0.92)'],
      [0.3, 'rgba(217, 119, 6, 0.95)'],
      [1, 'rgba(146, 64, 14, 0.9)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 240, 138, 0)'],
      [0.6, 'rgba(251, 191, 36, 0.18)'],
      [1, 'rgba(234, 88, 12, 0.32)'],
    ],
    aerialType: 'falcons',
    terrainBedrockStops: [
      [0, '#fbbf24'],
      [0.08, '#f59e0b'],
      [0.22, '#d97706'],
      [0.48, '#92400e'],
      [0.8, '#78350f'],
      [1, '#451a03'],
    ],
    duneShadowColor: '#d97706',
    duneSurfaceColor: '#fbbf24',
    duneHighlightColor: '#fef08a',
    tireTrackColor: 'rgba(146, 64, 14, 0.35)',
    sandRippleColor: 'rgba(217, 119, 6, 0.4)',
    sandRoostColor: '#f59e0b',
    sceneryStyle: 'sahara',
  },

  // Theme 2: Levels 5 - 8
  oasis_dawn: {
    id: 'oasis_dawn',
    name: 'Oasis Dawn & Springs',
    subtitle: 'Morning teal sky, lush date palm springs & fresh dunes',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/50',
    badgeText: 'text-emerald-400',
    accentHex: '#10b981',
    skyStops: [
      [0, '#0284c7'], // Sky blue
      [0.3, '#0d9488'], // Teal dawn
      [0.6, '#34d399'], // Fresh mint
      [0.85, '#fef08a'], // Pale morning sun
      [1, '#fed7aa'], // Warm sand haze
    ],
    celestialType: 'morning_sun',
    farLandmark: 'oasis_groves',
    farColor: 'rgba(13, 148, 136, 0.45)',
    farColorShade: 'rgba(15, 118, 110, 0.52)',
    midDuneStops: [
      [0, 'rgba(45, 212, 191, 0.8)'],
      [0.5, 'rgba(20, 184, 166, 0.78)'],
      [1, 'rgba(180, 83, 9, 0.72)'],
    ],
    midCamelColor: 'rgba(15, 118, 110, 0.65)',
    nearDuneStops: [
      [0, 'rgba(253, 224, 71, 0.92)'],
      [0.35, 'rgba(45, 212, 191, 0.85)'],
      [1, 'rgba(13, 148, 136, 0.9)'],
    ],
    hazeStops: [
      [0, 'rgba(204, 251, 241, 0)'],
      [0.6, 'rgba(45, 212, 191, 0.15)'],
      [1, 'rgba(254, 240, 138, 0.22)'],
    ],
    aerialType: 'oasis_herons',
    terrainBedrockStops: [
      [0, '#fef08a'],
      [0.08, '#facc15'],
      [0.22, '#2dd4bf'],
      [0.48, '#0f766e'],
      [0.8, '#134e4a'],
      [1, '#042f2e'],
    ],
    duneShadowColor: '#0d9488',
    duneSurfaceColor: '#facc15',
    duneHighlightColor: '#ccfbf1',
    tireTrackColor: 'rgba(19, 78, 74, 0.35)',
    sandRippleColor: 'rgba(13, 148, 136, 0.45)',
    sandRoostColor: '#2dd4bf',
    sceneryStyle: 'oasis',
  },

  // Theme 3: Levels 9 - 12
  red_rock_canyon: {
    id: 'red_rock_canyon',
    name: 'Red Rock Mars Canyon',
    subtitle: 'Fiery crimson mesas, monolithic arches & terracotta dunes',
    badgeBg: 'bg-red-500/20 border-red-500/50',
    badgeText: 'text-red-400',
    accentHex: '#ef4444',
    skyStops: [
      [0, '#7f1d1d'], // Blood red
      [0.25, '#991b1b'], // Deep crimson
      [0.55, '#c2410c'], // Burnt orange
      [0.82, '#ea580c'], // Vibrant fiery sunset
      [1, '#fed7aa'], // Canyon dust
    ],
    celestialType: 'canyon_sun',
    farLandmark: 'canyon_monoliths',
    farColor: 'rgba(153, 27, 27, 0.52)',
    farColorShade: 'rgba(127, 29, 29, 0.58)',
    midDuneStops: [
      [0, 'rgba(234, 88, 12, 0.88)'],
      [0.5, 'rgba(194, 65, 12, 0.84)'],
      [1, 'rgba(154, 52, 18, 0.8)'],
    ],
    midCamelColor: 'rgba(127, 29, 29, 0.7)',
    nearDuneStops: [
      [0, 'rgba(249, 115, 22, 0.95)'],
      [0.35, 'rgba(194, 65, 12, 0.92)'],
      [1, 'rgba(127, 29, 29, 0.92)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 215, 170, 0)'],
      [0.6, 'rgba(239, 68, 68, 0.22)'],
      [1, 'rgba(153, 27, 27, 0.35)'],
    ],
    aerialType: 'hawks',
    terrainBedrockStops: [
      [0, '#f97316'],
      [0.10, '#dc2626'],
      [0.25, '#b91c1c'],
      [0.50, '#7f1d1d'],
      [0.75, '#450a0a'],
      [1, '#1c0505'],
    ],
    duneShadowColor: '#991b1b',
    duneSurfaceColor: '#ef4444',
    duneHighlightColor: '#ffedd5',
    tireTrackColor: 'rgba(127, 29, 29, 0.55)',
    sandRippleColor: 'rgba(194, 65, 12, 0.5)',
    sandRoostColor: '#dc2626',
    sceneryStyle: 'canyon',
  },

  // Theme 4: Levels 13 - 16
  twilight_aurora: {
    id: 'twilight_aurora',
    name: 'Twilight Amethyst Aurora',
    subtitle: 'Royal purple horizon with glowing crescent moon & evening stars',
    badgeBg: 'bg-purple-500/20 border-purple-500/50',
    badgeText: 'text-purple-400',
    accentHex: '#a855f7',
    skyStops: [
      [0, '#3b0764'], // Deep royal purple
      [0.28, '#581c87'], // Amethyst
      [0.58, '#7e22ce'], // Radiant violet
      [0.84, '#c084fc'], // Lavender glow
      [1, '#fbcfe8'], // Rose twilight horizon
    ],
    celestialType: 'crescent_moon',
    hasStars: true,
    hasAuroras: true,
    farLandmark: 'ancient_obelisks',
    farColor: 'rgba(88, 28, 135, 0.52)',
    farColorShade: 'rgba(59, 7, 100, 0.6)',
    midDuneStops: [
      [0, 'rgba(147, 51, 234, 0.85)'],
      [0.5, 'rgba(126, 34, 206, 0.82)'],
      [1, 'rgba(88, 28, 135, 0.78)'],
    ],
    midCamelColor: 'rgba(59, 7, 100, 0.7)',
    nearDuneStops: [
      [0, 'rgba(192, 132, 252, 0.94)'],
      [0.35, 'rgba(147, 51, 234, 0.92)'],
      [1, 'rgba(88, 28, 135, 0.92)'],
    ],
    hazeStops: [
      [0, 'rgba(243, 232, 255, 0)'],
      [0.6, 'rgba(168, 85, 247, 0.18)'],
      [1, 'rgba(107, 33, 168, 0.28)'],
    ],
    aerialType: 'night_bats',
    terrainBedrockStops: [
      [0, '#d8b4fe'],
      [0.08, '#c084fc'],
      [0.22, '#9333ea'],
      [0.48, '#6b21a8'],
      [0.8, '#581c87'],
      [1, '#3b0764'],
    ],
    duneShadowColor: '#7e22ce',
    duneSurfaceColor: '#c084fc',
    duneHighlightColor: '#faf5ff',
    tireTrackColor: 'rgba(88, 28, 135, 0.4)',
    sandRippleColor: 'rgba(147, 51, 234, 0.45)',
    sandRoostColor: '#c084fc',
    sceneryStyle: 'twilight',
  },

  // Theme 5: Levels 17 - 20
  midnight_stars: {
    id: 'midnight_stars',
    name: 'Midnight Starlight Sahara',
    subtitle: 'Deep cosmic starlight, glowing full moon & neon cyan crests',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/50',
    badgeText: 'text-cyan-400',
    accentHex: '#06b6d4',
    skyStops: [
      [0, '#020617'], // Deep pitch midnight
      [0.3, '#091e42'], // Navy celestial
      [0.6, '#0c4a6e'], // Deep blue
      [0.84, '#0369a1'], // Horizon glow
      [1, '#38bdf8'], // Ice blue horizon
    ],
    celestialType: 'full_moon',
    hasStars: true,
    farLandmark: 'starlight_temples',
    farColor: 'rgba(12, 74, 110, 0.58)',
    farColorShade: 'rgba(3, 105, 161, 0.65)',
    midDuneStops: [
      [0, 'rgba(14, 116, 144, 0.88)'],
      [0.5, 'rgba(3, 105, 161, 0.84)'],
      [1, 'rgba(12, 74, 110, 0.8)'],
    ],
    midCamelColor: 'rgba(2, 6, 23, 0.75)',
    nearDuneStops: [
      [0, 'rgba(56, 189, 248, 0.94)'],
      [0.35, 'rgba(14, 116, 144, 0.92)'],
      [1, 'rgba(15, 23, 42, 0.95)'],
    ],
    hazeStops: [
      [0, 'rgba(224, 242, 254, 0)'],
      [0.6, 'rgba(56, 189, 248, 0.16)'],
      [1, 'rgba(3, 105, 161, 0.25)'],
    ],
    aerialType: 'shooting_stars',
    terrainBedrockStops: [
      [0, '#7dd3fc'],
      [0.08, '#38bdf8'],
      [0.22, '#0284c7'],
      [0.48, '#0369a1'],
      [0.8, '#0f172a'],
      [1, '#020617'],
    ],
    duneShadowColor: '#0284c7',
    duneSurfaceColor: '#38bdf8',
    duneHighlightColor: '#f0f9ff',
    tireTrackColor: 'rgba(2, 6, 23, 0.5)',
    sandRippleColor: 'rgba(14, 116, 144, 0.45)',
    sandRoostColor: '#38bdf8',
    sceneryStyle: 'midnight',
  },

  // Theme 6: Levels 21 - 24
  sandstorm_tempest: {
    id: 'sandstorm_tempest',
    name: 'Crimson Sandstorm Tempest',
    subtitle: 'Blinding wind-whipped sand particles & eerie bronze atmosphere',
    badgeBg: 'bg-orange-500/20 border-orange-500/50',
    badgeText: 'text-orange-400',
    accentHex: '#f97316',
    skyStops: [
      [0, '#451a03'], // Dark smoky bronze
      [0.28, '#78350f'], // Sandstorm haze
      [0.58, '#b45309'], // Blown dust
      [0.84, '#d97706'], // Fiery wind
      [1, '#fed7aa'], // Surface dust storm
    ],
    celestialType: 'storm_sun',
    hasDustParticles: true,
    farLandmark: 'storm_hoodoos',
    farColor: 'rgba(120, 53, 15, 0.65)',
    farColorShade: 'rgba(69, 26, 3, 0.72)',
    midDuneStops: [
      [0, 'rgba(180, 83, 9, 0.9)'],
      [0.5, 'rgba(146, 64, 14, 0.88)'],
      [1, 'rgba(120, 53, 15, 0.85)'],
    ],
    midCamelColor: 'rgba(69, 26, 3, 0.8)',
    nearDuneStops: [
      [0, 'rgba(245, 158, 11, 0.95)'],
      [0.35, 'rgba(180, 83, 9, 0.94)'],
      [1, 'rgba(69, 26, 3, 0.95)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 215, 170, 0.1)'],
      [0.5, 'rgba(217, 119, 6, 0.35)'],
      [1, 'rgba(180, 83, 9, 0.55)'],
    ],
    aerialType: 'storm_debris',
    terrainBedrockStops: [
      [0, '#fbbf24'],
      [0.08, '#d97706'],
      [0.22, '#b45309'],
      [0.48, '#78350f'],
      [0.8, '#451a03'],
      [1, '#1c1917'],
    ],
    duneShadowColor: '#92400e',
    duneSurfaceColor: '#d97706',
    duneHighlightColor: '#fef3c7',
    tireTrackColor: 'rgba(69, 26, 3, 0.55)',
    sandRippleColor: 'rgba(180, 83, 9, 0.55)',
    sandRoostColor: '#f59e0b',
    sceneryStyle: 'storm',
  },

  // Theme 7: Levels 25 - 28
  obsidian_eclipse: {
    id: 'obsidian_eclipse',
    name: 'Obsidian Solar Eclipse',
    subtitle: 'Blinding diamond-ring solar eclipse & dark volcanic basalt dunes',
    badgeBg: 'bg-yellow-500/20 border-yellow-500/50',
    badgeText: 'text-yellow-300',
    accentHex: '#eab308',
    skyStops: [
      [0, '#09090b'], // Space black
      [0.3, '#18181b'], // Dark basalt
      [0.6, '#27272a'], // Charcoal eclipse
      [0.84, '#ca8a04'], // Radiant corona aura
      [1, '#fef08a'], // Blinding horizon flare
    ],
    celestialType: 'solar_eclipse',
    hasStars: true,
    hasEmbers: true,
    farLandmark: 'volcanic_spires',
    farColor: 'rgba(24, 24, 27, 0.75)',
    farColorShade: 'rgba(9, 9, 11, 0.85)',
    midDuneStops: [
      [0, 'rgba(63, 63, 70, 0.9)'],
      [0.5, 'rgba(39, 39, 42, 0.88)'],
      [1, 'rgba(24, 24, 27, 0.85)'],
    ],
    midCamelColor: 'rgba(9, 9, 11, 0.85)',
    nearDuneStops: [
      [0, 'rgba(113, 113, 122, 0.95)'],
      [0.35, 'rgba(63, 63, 70, 0.94)'],
      [1, 'rgba(9, 9, 11, 0.96)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 240, 138, 0)'],
      [0.6, 'rgba(202, 138, 4, 0.2)'],
      [1, 'rgba(24, 24, 27, 0.45)'],
    ],
    aerialType: 'cosmic_wisps',
    terrainBedrockStops: [
      [0, '#facc15'], // Blazing golden edge
      [0.08, '#a1a1aa'], // Ash grey
      [0.22, '#52525b'], // Volcanic rock
      [0.48, '#27272a'], // Obsidian
      [0.8, '#18181b'], // Charcoal
      [1, '#09090b'], // Void black
    ],
    duneShadowColor: '#3f3f46',
    duneSurfaceColor: '#71717a',
    duneHighlightColor: '#fef08a',
    tireTrackColor: 'rgba(0, 0, 0, 0.65)',
    sandRippleColor: 'rgba(202, 138, 4, 0.4)',
    sandRoostColor: '#eab308',
    sceneryStyle: 'eclipse',
  },

  // Theme 8: Levels 29 - 30 & Endless High-Score Apex
  solar_overlord: {
    id: 'solar_overlord',
    name: 'Grand Celestial Overlord',
    subtitle: 'Dual binary suns, cosmic golden palace & championship dunes',
    badgeBg: 'bg-rose-500/20 border-rose-500/50',
    badgeText: 'text-rose-400',
    accentHex: '#f43f5e',
    skyStops: [
      [0, '#881337'], // Deep imperial ruby
      [0.28, '#be123c'], // Rose crimson
      [0.58, '#f59e0b'], // Pure radiant gold
      [0.84, '#fbbf24'], // Solar amber
      [1, '#fef08a'], // Blinding solar radiance
    ],
    celestialType: 'celestial_overlord',
    hasStars: true,
    hasEmbers: true,
    farLandmark: 'overlord_palace',
    farColor: 'rgba(190, 18, 60, 0.62)',
    farColorShade: 'rgba(136, 19, 55, 0.72)',
    midDuneStops: [
      [0, 'rgba(245, 158, 11, 0.92)'],
      [0.5, 'rgba(225, 29, 72, 0.88)'],
      [1, 'rgba(159, 18, 57, 0.85)'],
    ],
    midCamelColor: 'rgba(136, 19, 55, 0.8)',
    nearDuneStops: [
      [0, 'rgba(253, 224, 71, 0.96)'],
      [0.35, 'rgba(244, 63, 94, 0.92)'],
      [1, 'rgba(136, 19, 55, 0.95)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 240, 138, 0)'],
      [0.6, 'rgba(244, 63, 94, 0.2)'],
      [1, 'rgba(251, 191, 36, 0.35)'],
    ],
    aerialType: 'cosmic_wisps',
    terrainBedrockStops: [
      [0, '#ffffff'], // Brilliant diamond crest
      [0.08, '#fde047'], // Sunlit gold
      [0.22, '#f43f5e'], // Ruby sand
      [0.48, '#be123c'], // Deep imperial crimson
      [0.8, '#881337'], // Royal burgundy
      [1, '#4c0519'], // Bedrock obsidian
    ],
    duneShadowColor: '#be123c',
    duneSurfaceColor: '#f59e0b',
    duneHighlightColor: '#ffffff',
    tireTrackColor: 'rgba(136, 19, 55, 0.55)',
    sandRippleColor: 'rgba(244, 63, 94, 0.5)',
    sandRoostColor: '#fde047',
    sceneryStyle: 'overlord',
  },

  // Hill Climb Racing Iconic Themes
  moon: {
    id: 'moon',
    name: 'Moon Lunar Crater',
    subtitle: 'Deep space vacuum, low gravity floating physics & lunar craters',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/50',
    badgeText: 'text-cyan-400',
    accentHex: '#06b6d4',
    skyStops: [
      [0, '#020617'],
      [0.35, '#050b14'],
      [0.7, '#0b1329'],
      [1, '#111c44'],
    ],
    celestialType: 'full_moon',
    hasStars: true,
    farLandmark: 'starlight_temples',
    farColor: 'rgba(148, 163, 184, 0.45)',
    farColorShade: 'rgba(71, 85, 105, 0.55)',
    midDuneStops: [
      [0, 'rgba(148, 163, 184, 0.8)'],
      [0.5, 'rgba(100, 116, 139, 0.75)'],
      [1, 'rgba(51, 65, 85, 0.7)'],
    ],
    midCamelColor: 'rgba(51, 65, 85, 0.6)',
    nearDuneStops: [
      [0, 'rgba(226, 232, 240, 0.95)'],
      [0.4, 'rgba(148, 163, 184, 0.9)'],
      [1, 'rgba(71, 85, 105, 0.85)'],
    ],
    hazeStops: [
      [0, 'rgba(15, 23, 42, 0)'],
      [0.6, 'rgba(148, 163, 184, 0.15)'],
      [1, 'rgba(56, 189, 248, 0.2)'],
    ],
    aerialType: 'shooting_stars',
    terrainBedrockStops: [
      [0, '#f8fafc'],
      [0.08, '#cbd5e1'],
      [0.25, '#94a3b8'],
      [0.55, '#64748b'],
      [0.85, '#334155'],
      [1, '#0f172a'],
    ],
    duneShadowColor: '#64748b',
    duneSurfaceColor: '#cbd5e1',
    duneHighlightColor: '#ffffff',
    tireTrackColor: 'rgba(51, 65, 85, 0.55)',
    sandRippleColor: 'rgba(148, 163, 184, 0.45)',
    sandRoostColor: '#cbd5e1',
    sceneryStyle: 'midnight',
  },

  countryside: {
    id: 'countryside',
    name: 'Countryside & Farmlands',
    subtitle: 'Classic Hill Climb Racing rolling green meadows & gentle sunny hills',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/50',
    badgeText: 'text-emerald-400',
    accentHex: '#10b981',
    skyStops: [
      [0, '#0284c7'], // Deep sky blue
      [0.45, '#38bdf8'], // Clear blue
      [0.8, '#bae6fd'], // Horizon cyan
      [1, '#f0fdf4'], // Fresh grass mist
    ],
    celestialType: 'morning_sun',
    farLandmark: 'oasis_groves',
    farColor: 'rgba(16, 185, 129, 0.45)',
    farColorShade: 'rgba(5, 150, 105, 0.55)',
    midDuneStops: [
      [0, 'rgba(52, 211, 153, 0.85)'],
      [0.5, 'rgba(16, 185, 129, 0.8)'],
      [1, 'rgba(4, 120, 87, 0.75)'],
    ],
    midCamelColor: 'rgba(5, 150, 105, 0.65)',
    nearDuneStops: [
      [0, 'rgba(110, 231, 183, 0.95)'],
      [0.35, 'rgba(16, 185, 129, 0.9)'],
      [1, 'rgba(6, 95, 70, 0.85)'],
    ],
    hazeStops: [
      [0, 'rgba(240, 253, 244, 0)'],
      [0.6, 'rgba(110, 231, 183, 0.12)'],
      [1, 'rgba(56, 189, 248, 0.18)'],
    ],
    aerialType: 'hawks',
    terrainBedrockStops: [
      [0, '#86efac'], // Fresh lime grass top
      [0.08, '#22c55e'], // Lush meadow green
      [0.25, '#15803d'], // Dark pasture turf
      [0.55, '#78350f'], // Rich brown earth
      [0.85, '#451a03'], // Deep bedrock
      [1, '#1c1917'],
    ],
    duneShadowColor: '#15803d',
    duneSurfaceColor: '#22c55e',
    duneHighlightColor: '#bbf7d0',
    tireTrackColor: 'rgba(69, 26, 3, 0.45)',
    sandRippleColor: 'rgba(21, 128, 61, 0.4)',
    sandRoostColor: '#86efac',
    sceneryStyle: 'oasis',
  },

  arctic: {
    id: 'arctic',
    name: 'Arctic Glacier & Snow',
    subtitle: 'Slippery frozen ice cliffs, polar winds & snowy mountains',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/50',
    badgeText: 'text-cyan-400',
    accentHex: '#06b6d4',
    skyStops: [
      [0, '#0c4a6e'],
      [0.35, '#0284c7'],
      [0.75, '#7dd3fc'],
      [1, '#e0f2fe'],
    ],
    celestialType: 'morning_sun',
    hasAuroras: true,
    farLandmark: 'ancient_obelisks',
    farColor: 'rgba(56, 189, 248, 0.45)',
    farColorShade: 'rgba(14, 116, 144, 0.55)',
    midDuneStops: [
      [0, 'rgba(186, 230, 253, 0.9)'],
      [0.5, 'rgba(56, 189, 248, 0.8)'],
      [1, 'rgba(2, 132, 199, 0.75)'],
    ],
    midCamelColor: 'rgba(14, 116, 144, 0.65)',
    nearDuneStops: [
      [0, 'rgba(240, 249, 255, 0.98)'],
      [0.35, 'rgba(186, 230, 253, 0.92)'],
      [1, 'rgba(56, 189, 248, 0.85)'],
    ],
    hazeStops: [
      [0, 'rgba(240, 249, 255, 0)'],
      [0.5, 'rgba(186, 230, 253, 0.2)'],
      [1, 'rgba(255, 255, 255, 0.35)'],
    ],
    aerialType: 'falcons',
    terrainBedrockStops: [
      [0, '#ffffff'], // Crisp snow crest
      [0.08, '#e0f2fe'], // Icy blue
      [0.25, '#7dd3fc'], // Glacier ice
      [0.55, '#0284c7'], // Deep pack ice
      [0.85, '#075985'], // Sub-glacial bedrock
      [1, '#082f49'],
    ],
    duneShadowColor: '#0284c7',
    duneSurfaceColor: '#e0f2fe',
    duneHighlightColor: '#ffffff',
    tireTrackColor: 'rgba(7, 89, 133, 0.45)',
    sandRippleColor: 'rgba(125, 211, 252, 0.5)',
    sandRoostColor: '#ffffff',
    sceneryStyle: 'twilight',
  },

  forest: {
    id: 'forest',
    name: 'Forest Pine Trails',
    subtitle: 'Wooded pine slopes, bumpy root mounds & damp loam tracks',
    badgeBg: 'bg-emerald-600/20 border-emerald-500/50',
    badgeText: 'text-emerald-400',
    accentHex: '#059669',
    skyStops: [
      [0, '#0369a1'],
      [0.45, '#38bdf8'],
      [0.8, '#a7f3d0'],
      [1, '#dcfce7'],
    ],
    celestialType: 'morning_sun',
    farLandmark: 'oasis_groves',
    farColor: 'rgba(4, 120, 87, 0.5)',
    farColorShade: 'rgba(6, 78, 59, 0.6)',
    midDuneStops: [
      [0, 'rgba(16, 185, 129, 0.85)'],
      [0.5, 'rgba(5, 150, 105, 0.8)'],
      [1, 'rgba(6, 95, 70, 0.75)'],
    ],
    midCamelColor: 'rgba(6, 78, 59, 0.7)',
    nearDuneStops: [
      [0, 'rgba(52, 211, 153, 0.95)'],
      [0.35, 'rgba(16, 185, 129, 0.9)'],
      [1, 'rgba(6, 78, 59, 0.85)'],
    ],
    hazeStops: [
      [0, 'rgba(220, 252, 231, 0)'],
      [0.6, 'rgba(52, 211, 153, 0.15)'],
      [1, 'rgba(16, 185, 129, 0.22)'],
    ],
    aerialType: 'hawks',
    terrainBedrockStops: [
      [0, '#4ade80'],
      [0.08, '#16a34a'],
      [0.25, '#15803d'],
      [0.55, '#854d0e'],
      [0.85, '#451a03'],
      [1, '#1c1917'],
    ],
    duneShadowColor: '#166534',
    duneSurfaceColor: '#22c55e',
    duneHighlightColor: '#86efac',
    tireTrackColor: 'rgba(69, 26, 3, 0.5)',
    sandRippleColor: 'rgba(21, 128, 61, 0.4)',
    sandRoostColor: '#86efac',
    sceneryStyle: 'oasis',
  },

  volcano: {
    id: 'volcano',
    name: 'Volcano & Magma Ridge',
    subtitle: 'Fiery molten basalt, smoking lava calderas & extreme heat',
    badgeBg: 'bg-orange-600/20 border-orange-500/50',
    badgeText: 'text-orange-400',
    accentHex: '#ea580c',
    skyStops: [
      [0, '#450a0a'],
      [0.3, '#7f1d1d'],
      [0.65, '#c2410c'],
      [1, '#fed7aa'],
    ],
    celestialType: 'storm_sun',
    hasEmbers: true,
    farLandmark: 'volcanic_spires',
    farColor: 'rgba(185, 28, 28, 0.55)',
    farColorShade: 'rgba(127, 29, 29, 0.65)',
    midDuneStops: [
      [0, 'rgba(234, 88, 12, 0.9)'],
      [0.5, 'rgba(194, 65, 12, 0.85)'],
      [1, 'rgba(127, 29, 29, 0.8)'],
    ],
    midCamelColor: 'rgba(127, 29, 29, 0.7)',
    nearDuneStops: [
      [0, 'rgba(249, 115, 22, 0.95)'],
      [0.35, 'rgba(194, 65, 12, 0.9)'],
      [1, 'rgba(69, 10, 10, 0.95)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 215, 170, 0)'],
      [0.6, 'rgba(234, 88, 12, 0.22)'],
      [1, 'rgba(239, 68, 68, 0.35)'],
    ],
    aerialType: 'storm_debris',
    terrainBedrockStops: [
      [0, '#fef08a'], // Glowing incandescent crust
      [0.08, '#f97316'], // Molten orange
      [0.25, '#dc2626'], // Fiery red
      [0.55, '#7f1d1d'], // Cooled lava
      [0.85, '#262626'], // Volcanic basalt
      [1, '#09090b'],
    ],
    duneShadowColor: '#7f1d1d',
    duneSurfaceColor: '#ea580c',
    duneHighlightColor: '#fef08a',
    tireTrackColor: 'rgba(38, 38, 38, 0.6)',
    sandRippleColor: 'rgba(220, 38, 38, 0.5)',
    sandRoostColor: '#f97316',
    sceneryStyle: 'eclipse',
  },

  neon: {
    id: 'neon',
    name: 'Neon Cyberpunk Highway',
    subtitle: '80s Synthwave wireframe highway, glowing neon grids & retro sun',
    badgeBg: 'bg-fuchsia-500/20 border-fuchsia-500/50',
    badgeText: 'text-fuchsia-400',
    accentHex: '#d946ef',
    skyStops: [
      [0, '#0f051d'],
      [0.35, '#2e1065'],
      [0.7, '#701a75'],
      [1, '#d946ef'],
    ],
    celestialType: 'sunset_sun',
    hasStars: true,
    farLandmark: 'overlord_palace',
    farColor: 'rgba(217, 70, 239, 0.5)',
    farColorShade: 'rgba(112, 26, 117, 0.6)',
    midDuneStops: [
      [0, 'rgba(232, 121, 249, 0.85)'],
      [0.5, 'rgba(192, 38, 211, 0.8)'],
      [1, 'rgba(107, 33, 168, 0.75)'],
    ],
    midCamelColor: 'rgba(107, 33, 168, 0.65)',
    nearDuneStops: [
      [0, 'rgba(244, 114, 182, 0.95)'],
      [0.35, 'rgba(217, 70, 239, 0.9)'],
      [1, 'rgba(59, 7, 100, 0.9)'],
    ],
    hazeStops: [
      [0, 'rgba(217, 70, 239, 0)'],
      [0.6, 'rgba(232, 121, 249, 0.2)'],
      [1, 'rgba(34, 211, 238, 0.25)'],
    ],
    aerialType: 'cosmic_wisps',
    terrainBedrockStops: [
      [0, '#22d3ee'], // Glowing cyan wireframe
      [0.08, '#d946ef'], // Hot magenta
      [0.25, '#a21caf'], // Deep neon violet
      [0.55, '#581c87'], // Cyber dark purple
      [0.85, '#1e1b4b'], // Digital void
      [1, '#020617'],
    ],
    duneShadowColor: '#86198f',
    duneSurfaceColor: '#d946ef',
    duneHighlightColor: '#22d3ee',
    tireTrackColor: 'rgba(34, 211, 238, 0.55)',
    sandRippleColor: 'rgba(232, 121, 249, 0.5)',
    sandRoostColor: '#22d3ee',
    sceneryStyle: 'overlord',
  },

  mudpool: {
    id: 'mudpool',
    name: 'Mudpool & Swamp Bogs',
    subtitle: 'Sticky muddy whoops, heavy sinkhole humps & swamp mist',
    badgeBg: 'bg-amber-800/20 border-amber-700/50',
    badgeText: 'text-amber-500',
    accentHex: '#b45309',
    skyStops: [
      [0, '#292524'],
      [0.4, '#44403c'],
      [0.75, '#78716c'],
      [1, '#a8a29e'],
    ],
    celestialType: 'storm_sun',
    farLandmark: 'canyon_monoliths',
    farColor: 'rgba(87, 83, 78, 0.55)',
    farColorShade: 'rgba(68, 64, 60, 0.65)',
    midDuneStops: [
      [0, 'rgba(168, 162, 158, 0.8)'],
      [0.5, 'rgba(120, 113, 108, 0.75)'],
      [1, 'rgba(68, 64, 60, 0.7)'],
    ],
    midCamelColor: 'rgba(68, 64, 60, 0.6)',
    nearDuneStops: [
      [0, 'rgba(180, 83, 9, 0.9)'],
      [0.35, 'rgba(146, 64, 14, 0.85)'],
      [1, 'rgba(69, 26, 3, 0.9)'],
    ],
    hazeStops: [
      [0, 'rgba(168, 162, 158, 0)'],
      [0.6, 'rgba(120, 113, 108, 0.2)'],
      [1, 'rgba(180, 83, 9, 0.25)'],
    ],
    aerialType: 'night_bats',
    terrainBedrockStops: [
      [0, '#d97706'],
      [0.08, '#b45309'],
      [0.25, '#78350f'],
      [0.55, '#451a03'],
      [0.85, '#292524'],
      [1, '#0c0a09'],
    ],
    duneShadowColor: '#78350f',
    duneSurfaceColor: '#b45309',
    duneHighlightColor: '#fbbf24',
    tireTrackColor: 'rgba(41, 37, 36, 0.6)',
    sandRippleColor: 'rgba(146, 64, 14, 0.45)',
    sandRoostColor: '#b45309',
    sceneryStyle: 'storm',
  },

  highway: {
    id: 'highway',
    name: 'Sunset Highway',
    subtitle: 'Smooth asphalt strip, overpasses, road lights & high-speed cruising',
    badgeBg: 'bg-blue-500/20 border-blue-500/50',
    badgeText: 'text-blue-400',
    accentHex: '#3b82f6',
    skyStops: [
      [0, '#1e1b4b'],
      [0.35, '#312e81'],
      [0.7, '#ea580c'],
      [1, '#fed7aa'],
    ],
    celestialType: 'sunset_sun',
    farLandmark: 'overlord_palace',
    farColor: 'rgba(30, 27, 75, 0.6)',
    farColorShade: 'rgba(15, 23, 42, 0.7)',
    midDuneStops: [
      [0, 'rgba(100, 116, 139, 0.8)'],
      [0.5, 'rgba(71, 85, 105, 0.75)'],
      [1, 'rgba(30, 41, 59, 0.7)'],
    ],
    midCamelColor: 'rgba(30, 41, 59, 0.6)',
    nearDuneStops: [
      [0, 'rgba(71, 85, 105, 0.9)'],
      [0.35, 'rgba(51, 65, 85, 0.85)'],
      [1, 'rgba(15, 23, 42, 0.9)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 215, 170, 0)'],
      [0.6, 'rgba(234, 88, 12, 0.15)'],
      [1, 'rgba(245, 158, 11, 0.22)'],
    ],
    aerialType: 'falcons',
    terrainBedrockStops: [
      [0, '#facc15'], // Center yellow road stripe
      [0.06, '#334155'], // Asphalt slate
      [0.25, '#1e293b'], // Dark asphalt
      [0.55, '#0f172a'], // Road foundation
      [0.85, '#020617'], // Bedrock
      [1, '#000000'],
    ],
    duneShadowColor: '#1e293b',
    duneSurfaceColor: '#334155',
    duneHighlightColor: '#facc15',
    tireTrackColor: 'rgba(2, 6, 23, 0.6)',
    sandRippleColor: 'rgba(71, 85, 105, 0.4)',
    sandRoostColor: '#facc15',
    sceneryStyle: 'sahara',
  },

  alien_planet: {
    id: 'alien_planet',
    name: 'Alien Planet Spire',
    subtitle: 'Bizarre alien purple vegetation, low gravity & toxic crystals',
    badgeBg: 'bg-violet-500/20 border-violet-500/50',
    badgeText: 'text-violet-400',
    accentHex: '#8b5cf6',
    skyStops: [
      [0, '#2e1065'],
      [0.35, '#581c87'],
      [0.7, '#7e22ce'],
      [1, '#d8b4fe'],
    ],
    celestialType: 'solar_eclipse',
    hasStars: true,
    farLandmark: 'ancient_obelisks',
    farColor: 'rgba(126, 34, 206, 0.55)',
    farColorShade: 'rgba(88, 28, 135, 0.65)',
    midDuneStops: [
      [0, 'rgba(168, 85, 247, 0.85)'],
      [0.5, 'rgba(126, 34, 206, 0.8)'],
      [1, 'rgba(59, 7, 100, 0.75)'],
    ],
    midCamelColor: 'rgba(59, 7, 100, 0.65)',
    nearDuneStops: [
      [0, 'rgba(192, 132, 252, 0.95)'],
      [0.35, 'rgba(147, 51, 234, 0.9)'],
      [1, 'rgba(59, 7, 100, 0.9)'],
    ],
    hazeStops: [
      [0, 'rgba(216, 180, 254, 0)'],
      [0.6, 'rgba(168, 85, 247, 0.2)'],
      [1, 'rgba(126, 34, 206, 0.3)'],
    ],
    aerialType: 'cosmic_wisps',
    terrainBedrockStops: [
      [0, '#a855f7'], // Alien bioluminescent crystal
      [0.08, '#7e22ce'], // Purple spore surface
      [0.25, '#581c87'], // Deep alien violet
      [0.55, '#3b0764'], // Alien sub-crust
      [0.85, '#1e1b4b'], // Void rock
      [1, '#020617'],
    ],
    duneShadowColor: '#581c87',
    duneSurfaceColor: '#7e22ce',
    duneHighlightColor: '#c084fc',
    tireTrackColor: 'rgba(59, 7, 100, 0.5)',
    sandRippleColor: 'rgba(168, 85, 247, 0.45)',
    sandRoostColor: '#c084fc',
    sceneryStyle: 'twilight',
  },
  // Theme: Dinosaur Fossil Badlands
  fossil_badlands: {
    id: 'fossil_badlands',
    name: 'Dinosaur Fossil Badlands',
    subtitle: 'Sun-baked chalk bone beds & prehistoric canyon ridges',
    badgeBg: 'bg-amber-600/20 border-amber-600/50',
    badgeText: 'text-amber-300',
    accentHex: '#d97706',
    skyStops: [
      [0, '#78350f'],
      [0.32, '#b45309'],
      [0.65, '#d97706'],
      [0.86, '#fef08a'],
      [1, '#ffedd5'],
    ],
    celestialType: 'canyon_sun',
    farLandmark: 'canyon_monoliths',
    farColor: 'rgba(180, 83, 9, 0.48)',
    farColorShade: 'rgba(120, 53, 15, 0.55)',
    midDuneStops: [
      [0, 'rgba(217, 119, 6, 0.85)'],
      [0.5, 'rgba(180, 83, 9, 0.8)'],
      [1, 'rgba(120, 53, 15, 0.78)'],
    ],
    midCamelColor: 'rgba(120, 53, 15, 0.65)',
    nearDuneStops: [
      [0, 'rgba(250, 204, 21, 0.92)'],
      [0.35, 'rgba(217, 119, 6, 0.9)'],
      [1, 'rgba(120, 53, 15, 0.9)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 240, 138, 0)'],
      [0.6, 'rgba(217, 119, 6, 0.18)'],
      [1, 'rgba(180, 83, 9, 0.32)'],
    ],
    aerialType: 'hawks',
    terrainBedrockStops: [
      [0, '#d4c5a9'],
      [0.12, '#b8a68b'],
      [0.24, '#f1f5f9'],
      [0.45, '#9a7b56'],
      [0.72, '#5c4a38'],
      [1, '#27272a'],
    ],
    duneShadowColor: '#785d45',
    duneSurfaceColor: '#d4c5a9',
    duneHighlightColor: '#f8fafc',
    tireTrackColor: 'rgba(92, 74, 56, 0.55)',
    sandRippleColor: 'rgba(120, 93, 69, 0.45)',
    sandRoostColor: '#c5b8a0',
    sceneryStyle: 'canyon',
  },

  // Theme: Ghost Town Mine Run
  ghost_town: {
    id: 'ghost_town',
    name: 'Ghost Town Mine Frontier',
    subtitle: 'Dusty sepia gold rush frontier, abandoned timber & mine chutes',
    badgeBg: 'bg-amber-700/20 border-amber-700/50',
    badgeText: 'text-amber-200',
    accentHex: '#b45309',
    skyStops: [
      [0, '#451a03'],
      [0.3, '#78350f'],
      [0.65, '#b45309'],
      [0.88, '#fde68a'],
      [1, '#fed7aa'],
    ],
    celestialType: 'storm_sun',
    farLandmark: 'storm_hoodoos',
    farColor: 'rgba(120, 53, 15, 0.58)',
    farColorShade: 'rgba(69, 26, 3, 0.68)',
    midDuneStops: [
      [0, 'rgba(180, 83, 9, 0.88)'],
      [0.5, 'rgba(146, 64, 14, 0.85)'],
      [1, 'rgba(120, 53, 15, 0.82)'],
    ],
    midCamelColor: 'rgba(69, 26, 3, 0.75)',
    nearDuneStops: [
      [0, 'rgba(251, 191, 36, 0.94)'],
      [0.35, 'rgba(180, 83, 9, 0.92)'],
      [1, 'rgba(69, 26, 3, 0.95)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 215, 170, 0)'],
      [0.6, 'rgba(180, 83, 9, 0.25)'],
      [1, 'rgba(120, 53, 15, 0.4)'],
    ],
    aerialType: 'storm_debris',
    terrainBedrockStops: [
      [0, '#fde68a'],
      [0.08, '#f59e0b'],
      [0.22, '#b45309'],
      [0.48, '#78350f'],
      [0.8, '#451a03'],
      [1, '#1c1917'],
    ],
    duneShadowColor: '#92400e',
    duneSurfaceColor: '#fbbf24',
    duneHighlightColor: '#fef3c7',
    tireTrackColor: 'rgba(69, 26, 3, 0.5)',
    sandRippleColor: 'rgba(180, 83, 9, 0.5)',
    sandRoostColor: '#f59e0b',
    sceneryStyle: 'storm',
  },

  // Theme: Meteor Impact Basin
  meteor_crater: {
    id: 'meteor_crater',
    name: 'Meteor Impact Basin',
    subtitle: 'Scorched black basalt collision crater with explosive launch rims',
    badgeBg: 'bg-orange-600/20 border-orange-600/50',
    badgeText: 'text-orange-300',
    accentHex: '#ea580c',
    skyStops: [
      [0, '#09090b'],
      [0.26, '#18181b'],
      [0.55, '#451a03'],
      [0.82, '#9a3412'],
      [1, '#ea580c'],
    ],
    celestialType: 'solar_eclipse',
    hasStars: true,
    hasDustParticles: true,
    hasEmbers: true,
    farLandmark: 'volcanic_spires',
    farColor: 'rgba(39, 39, 42, 0.75)',
    farColorShade: 'rgba(9, 9, 11, 0.85)',
    midDuneStops: [
      [0, 'rgba(154, 52, 18, 0.9)'],
      [0.5, 'rgba(124, 45, 18, 0.88)'],
      [1, 'rgba(69, 26, 3, 0.85)'],
    ],
    midCamelColor: 'rgba(9, 9, 11, 0.85)',
    nearDuneStops: [
      [0, 'rgba(234, 88, 12, 0.95)'],
      [0.35, 'rgba(154, 52, 18, 0.92)'],
      [1, 'rgba(24, 24, 27, 0.95)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 215, 170, 0)'],
      [0.6, 'rgba(234, 88, 12, 0.22)'],
      [1, 'rgba(24, 24, 27, 0.45)'],
    ],
    aerialType: 'cosmic_wisps',
    terrainBedrockStops: [
      [0, '#3f3f46'],
      [0.10, '#27272a'],
      [0.25, '#18181b'],
      [0.55, '#09090b'],
      [0.80, '#ea580c'],
      [1, '#000000'],
    ],
    duneShadowColor: '#18181b',
    duneSurfaceColor: '#27272a',
    duneHighlightColor: '#ea580c',
    tireTrackColor: 'rgba(0, 0, 0, 0.85)',
    sandRippleColor: 'rgba(234, 88, 12, 0.45)',
    sandRoostColor: '#f97316',
    sceneryStyle: 'eclipse',
  },

  // Theme: Skeleton Coast Shipwrecks
  skeleton_coast: {
    id: 'skeleton_coast',
    name: 'Skeleton Coast Shipwrecks',
    subtitle: 'Haunting coastal beach dunes with stranded 18th-century pirate galleons',
    badgeBg: 'bg-yellow-600/20 border-yellow-600/50',
    badgeText: 'text-yellow-300',
    accentHex: '#ca8a04',
    skyStops: [
      [0, '#0369a1'],
      [0.28, '#0284c7'],
      [0.58, '#38bdf8'],
      [0.84, '#fef08a'],
      [1, '#fed7aa'],
    ],
    celestialType: 'morning_sun',
    farLandmark: 'oasis_groves',
    farColor: 'rgba(14, 116, 144, 0.48)',
    farColorShade: 'rgba(12, 74, 110, 0.55)',
    midDuneStops: [
      [0, 'rgba(234, 179, 8, 0.88)'],
      [0.5, 'rgba(202, 138, 4, 0.82)'],
      [1, 'rgba(161, 98, 7, 0.78)'],
    ],
    midCamelColor: 'rgba(12, 74, 110, 0.65)',
    nearDuneStops: [
      [0, 'rgba(253, 224, 71, 0.94)'],
      [0.35, 'rgba(234, 179, 8, 0.9)'],
      [1, 'rgba(161, 98, 7, 0.92)'],
    ],
    hazeStops: [
      [0, 'rgba(224, 242, 254, 0)'],
      [0.6, 'rgba(56, 189, 248, 0.16)'],
      [1, 'rgba(234, 179, 8, 0.28)'],
    ],
    aerialType: 'oasis_herons',
    terrainBedrockStops: [
      [0, '#eddcd2'],
      [0.10, '#d4a373'],
      [0.25, '#a98467'],
      [0.50, '#475569'],
      [0.75, '#1e293b'],
      [1, '#0f172a'],
    ],
    duneShadowColor: '#8d6e63',
    duneSurfaceColor: '#eddcd2',
    duneHighlightColor: '#ffffff',
    tireTrackColor: 'rgba(93, 64, 55, 0.45)',
    sandRippleColor: 'rgba(212, 163, 115, 0.45)',
    sandRoostColor: '#f5ebe0',
    sceneryStyle: 'sahara',
  },

  // Theme: Desert Oilfield Outpost
  oilfield_outpost: {
    id: 'oilfield_outpost',
    name: 'Desert Oilfield Outpost',
    subtitle: 'Industrial gravel desert with nodding pumpjacks & heavy steel pipelines',
    badgeBg: 'bg-amber-500/20 border-amber-500/50',
    badgeText: 'text-amber-300',
    accentHex: '#f59e0b',
    skyStops: [
      [0, '#1e293b'],
      [0.3, '#334155'],
      [0.6, '#475569'],
      [0.84, '#f59e0b'],
      [1, '#fed7aa'],
    ],
    celestialType: 'sunset_sun',
    farLandmark: 'storm_hoodoos',
    farColor: 'rgba(71, 85, 105, 0.65)',
    farColorShade: 'rgba(30, 41, 59, 0.75)',
    midDuneStops: [
      [0, 'rgba(245, 158, 11, 0.88)'],
      [0.5, 'rgba(217, 119, 6, 0.82)'],
      [1, 'rgba(71, 85, 105, 0.78)'],
    ],
    midCamelColor: 'rgba(30, 41, 59, 0.75)',
    nearDuneStops: [
      [0, 'rgba(251, 191, 36, 0.94)'],
      [0.35, 'rgba(217, 119, 6, 0.92)'],
      [1, 'rgba(51, 65, 85, 0.92)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 240, 138, 0)'],
      [0.6, 'rgba(245, 158, 11, 0.2)'],
      [1, 'rgba(30, 41, 59, 0.35)'],
    ],
    aerialType: 'falcons',
    terrainBedrockStops: [
      [0, '#475569'],
      [0.10, '#334155'],
      [0.25, '#1e293b'],
      [0.55, '#0f172a'],
      [0.80, '#020617'],
      [1, '#000000'],
    ],
    duneShadowColor: '#1e293b',
    duneSurfaceColor: '#334155',
    duneHighlightColor: '#facc15',
    tireTrackColor: 'rgba(15, 23, 42, 0.75)',
    sandRippleColor: 'rgba(71, 85, 105, 0.5)',
    sandRoostColor: '#475569',
    sceneryStyle: 'canyon',
  },

  // Theme: Lost Bedouin Citadel
  lost_citadel: {
    id: 'lost_citadel',
    name: 'Lost Bedouin Citadel',
    subtitle: 'Ancient clay-brick fortress ruins, starlight skies & aqueduct jumps',
    badgeBg: 'bg-indigo-900/40 border-amber-500/50',
    badgeText: 'text-amber-300',
    accentHex: '#d97706',
    skyStops: [
      [0, '#0f172a'],
      [0.28, '#1e1b4b'],
      [0.58, '#312e81'],
      [0.82, '#b45309'],
      [1, '#fed7aa'],
    ],
    celestialType: 'crescent_moon',
    hasStars: true,
    farLandmark: 'starlight_temples',
    farColor: 'rgba(49, 46, 129, 0.65)',
    farColorShade: 'rgba(15, 23, 42, 0.75)',
    midDuneStops: [
      [0, 'rgba(180, 83, 9, 0.88)'],
      [0.5, 'rgba(146, 64, 14, 0.85)'],
      [1, 'rgba(49, 46, 129, 0.78)'],
    ],
    midCamelColor: 'rgba(15, 23, 42, 0.75)',
    nearDuneStops: [
      [0, 'rgba(245, 158, 11, 0.94)'],
      [0.35, 'rgba(180, 83, 9, 0.92)'],
      [1, 'rgba(30, 27, 75, 0.92)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 215, 170, 0)'],
      [0.6, 'rgba(180, 83, 9, 0.22)'],
      [1, 'rgba(15, 23, 42, 0.35)'],
    ],
    aerialType: 'night_bats',
    terrainBedrockStops: [
      [0, '#f59e0b'],
      [0.10, '#d97706'],
      [0.25, '#b45309'],
      [0.55, '#78350f'],
      [0.80, '#451a03'],
      [1, '#1e1b4b'],
    ],
    duneShadowColor: '#92400e',
    duneSurfaceColor: '#d97706',
    duneHighlightColor: '#fef3c7',
    tireTrackColor: 'rgba(120, 53, 15, 0.65)',
    sandRippleColor: 'rgba(180, 83, 9, 0.5)',
    sandRoostColor: '#d97706',
    sceneryStyle: 'sahara',
  },

  // Theme: Dune Roller-Wave Superpark
  roller_wave: {
    id: 'roller_wave',
    name: 'Dune Roller-Wave Superpark',
    subtitle: 'Vivid sculpted supercross motocross sand waves, whoops & huge air',
    badgeBg: 'bg-amber-500/20 border-amber-500/50',
    badgeText: 'text-amber-400',
    accentHex: '#f59e0b',
    skyStops: [
      [0, '#c2410c'],
      [0.28, '#ea580c'],
      [0.58, '#f59e0b'],
      [0.85, '#fde68a'],
      [1, '#fef08a'],
    ],
    celestialType: 'sunset_sun',
    farLandmark: 'pyramids',
    farColor: 'rgba(180, 83, 9, 0.45)',
    farColorShade: 'rgba(120, 53, 15, 0.48)',
    midDuneStops: [
      [0, 'rgba(245, 158, 11, 0.88)'],
      [0.5, 'rgba(217, 119, 6, 0.84)'],
      [1, 'rgba(180, 83, 9, 0.8)'],
    ],
    midCamelColor: 'rgba(120, 53, 15, 0.65)',
    nearDuneStops: [
      [0, 'rgba(251, 191, 36, 0.94)'],
      [0.35, 'rgba(217, 119, 6, 0.92)'],
      [1, 'rgba(146, 64, 14, 0.9)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 240, 138, 0)'],
      [0.6, 'rgba(251, 191, 36, 0.2)'],
      [1, 'rgba(234, 88, 12, 0.32)'],
    ],
    aerialType: 'falcons',
    terrainBedrockStops: [
      [0, '#fbbf24'],
      [0.08, '#f59e0b'],
      [0.22, '#d97706'],
      [0.48, '#92400e'],
      [0.8, '#78350f'],
      [1, '#451a03'],
    ],
    duneShadowColor: '#d97706',
    duneSurfaceColor: '#fbbf24',
    duneHighlightColor: '#fef08a',
    tireTrackColor: 'rgba(146, 64, 14, 0.38)',
    sandRippleColor: 'rgba(217, 119, 6, 0.42)',
    sandRoostColor: '#f59e0b',
    sceneryStyle: 'sahara',
  },

  // Theme: Grand Mesa Slot Canyon
  grand_chasm: {
    id: 'grand_chasm',
    name: 'Grand Mesa Slot Canyon',
    subtitle: 'Towering tabletop sandstone buttes, terrifying canyon drops & gaps',
    badgeBg: 'bg-red-600/20 border-red-600/50',
    badgeText: 'text-red-300',
    accentHex: '#dc2626',
    skyStops: [
      [0, '#7f1d1d'],
      [0.25, '#991b1b'],
      [0.55, '#c2410c'],
      [0.82, '#ea580c'],
      [1, '#fed7aa'],
    ],
    celestialType: 'canyon_sun',
    farLandmark: 'canyon_monoliths',
    farColor: 'rgba(153, 27, 27, 0.58)',
    farColorShade: 'rgba(127, 29, 29, 0.65)',
    midDuneStops: [
      [0, 'rgba(234, 88, 12, 0.9)'],
      [0.5, 'rgba(194, 65, 12, 0.86)'],
      [1, 'rgba(154, 52, 18, 0.82)'],
    ],
    midCamelColor: 'rgba(127, 29, 29, 0.75)',
    nearDuneStops: [
      [0, 'rgba(249, 115, 22, 0.95)'],
      [0.35, 'rgba(194, 65, 12, 0.92)'],
      [1, 'rgba(127, 29, 29, 0.94)'],
    ],
    hazeStops: [
      [0, 'rgba(254, 215, 170, 0)'],
      [0.6, 'rgba(239, 68, 68, 0.24)'],
      [1, 'rgba(153, 27, 27, 0.38)'],
    ],
    aerialType: 'hawks',
    terrainBedrockStops: [
      [0, '#fb923c'],
      [0.08, '#ea580c'],
      [0.22, '#c2410c'],
      [0.48, '#991b1b'],
      [0.8, '#7f1d1d'],
      [1, '#450a0a'],
    ],
    duneShadowColor: '#c2410c',
    duneSurfaceColor: '#f97316',
    duneHighlightColor: '#ffedd5',
    tireTrackColor: 'rgba(127, 29, 29, 0.5)',
    sandRippleColor: 'rgba(194, 65, 12, 0.5)',
    sandRoostColor: '#ea580c',
    sceneryStyle: 'canyon',
  },
};

/**
 * Resolves the visual theme for a given desert stage.
 * Strictly pure desert themes - no colorful/rainbow/alien/arctic environments.
 */
export function getThemeForLevel(levelId: number = 1, _isEndless: boolean = false, _camX: number = 0): EnvironmentTheme {
  const desertStageThemes: Record<number, string> = {
    1: 'sahara_sunset',
    2: 'fossil_badlands',
    3: 'ghost_town',
    4: 'meteor_crater',
    5: 'skeleton_coast',
    6: 'red_rock_canyon',
    7: 'oilfield_outpost',
    8: 'lost_citadel',
    9: 'roller_wave',
    10: 'grand_chasm',
  };

  const key = desertStageThemes[levelId] || 'sahara_sunset';
  return BIOME_THEMES[key] || BIOME_THEMES.sahara_sunset;
}
