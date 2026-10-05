export type GameState = 'menu' | 'playing' | 'paused' | 'crashed' | 'level_completed';

export type OutType =
  | 'crashed_out'
  | 'rider_out'
  | 'fuel_out'
  | 'time_out'
  | 'engine_out'
  | 'tire_out'
  | 'quicksand_out'
  | 'canyon_out'
  | 'crash_out'
  | 'game_out'
  | null;

export type GameMode = 'campaign' | 'endless';

export interface BikeConfig {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  image?: string;
  speed: number;        // 1 - 10
  acceleration: number; // 1 - 10
  suspension: number;   // 1 - 10
  agility: number;      // 1 - 10
  color: string;
  secondaryColor: string;
  accentColor: string;
  wheelColor: string;
  wheelRadius: number;
  wheelBase: number;
  mass: number;
  unlocked: boolean;
  cost: number;
}

export interface TerrainPoint {
  x: number;
  y: number;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'fuel' | 'nitro';
  collected: boolean;
  value: number;
}

export interface Checkpoint {
  id: number;
  x: number;
  y: number;
  reached: boolean;
}

export interface StuntEvent {
  id: number;
  text: string;
  score: number;
  color: string;
  timestamp: number;
}

export interface StuntStats {
  stuntXp: number;            // Safely banked Stunt XP added to final score
  pendingXp: number;          // Real-time stunt XP waiting for safe landing
  backflips: number;          // Total successfully landed backflips
  frontflips: number;         // Total successfully landed frontflips
  wheelies: number;           // Total successfully landed wheelies
  wheelieSec: number;         // Cumulative safely landed wheelie duration in seconds
  activeStunt: string | null; // Real-time active stunt description (e.g. 'BACKFLIP x2', 'WHEELIE 1.8s')
  lastLandBonus: number;      // Bonus points awarded on the most recent safe landing
  lastLandTime: number;       // Timestamp of last safe landing
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'dust' | 'fire' | 'smoke' | 'spark' | 'celebration';
}

export interface LevelInfo {
  id: number;
  name: string;
  description: string;
  length: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  starsEarned: number;
  bestTime?: number;
  bestScore?: number;
  themeId?: string;
  themeName?: string;
  gravityMultiplier?: number;
  unlocked?: boolean;
  cost?: number;
}

export type WeatherType = 'clear' | 'sun_glare' | 'sandstorm';

export interface WeatherState {
  type: WeatherType;
  name: string;
  intensity: number;          // 0.0 to 1.0
  visibilityFactor: number;   // 1.0 (clear) down to ~0.35 (dense sandstorm)
  frictionMultiplier: number; // 1.0 (full grip) down to ~0.94 (loose shifting sand)
  windX: number;              // Wind speed (-3.0 to +1.0 in world units)
  glareIntensity: number;     // 0.0 to 1.0 (sun rays & lens flare)
  sandDensity: number;        // 0.0 to 1.0 (flying sand & dust)
  description: string;
  badgeColor: string;
}
