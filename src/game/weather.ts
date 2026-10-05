import { WeatherType, WeatherState } from '../types';

export interface SandParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
}

export class WeatherManager {
  public currentType: WeatherType = 'clear';
  public targetType: WeatherType = 'clear';
  public intensity: number = 0;
  public targetIntensity: number = 0;

  // Active state exposed to physics and renderer - always clear, perfect traction & visibility
  public state: WeatherState = {
    type: 'clear',
    name: 'Clear Desert Skies',
    intensity: 0,
    visibilityFactor: 1.0,
    frictionMultiplier: 1.0,
    windX: 0,
    glareIntensity: 0,
    sandDensity: 0,
    description: 'Clear Skies: Optimal Traction & Visibility',
    badgeColor: '#10b981',
  };

  public sandParticles: SandParticle[] = [];
  public solarFlarePhase: number = 0;
  public heatShimmerPhase: number = 0;
  public weatherAlert: { text: string; subtext: string; color: string; duration: number } | null = null;

  constructor(_levelId: number = 1, _isEndless: boolean = true) {
    this.reset();
  }

  public reset(_levelId: number = 1, _isEndless: boolean = true) {
    this.currentType = 'clear';
    this.targetType = 'clear';
    this.intensity = 0;
    this.targetIntensity = 0;
    this.weatherAlert = null;
    this.sandParticles = [];
  }

  public triggerAlert(_text: string, _subtext: string, _color: string = '#f59e0b') {
    // Weather alerts disabled
    this.weatherAlert = null;
  }

  public setWeather(_type: WeatherType, _intensity: number = 0) {
    // Fixed clear weather - changes disabled
    this.currentType = 'clear';
    this.targetType = 'clear';
    this.intensity = 0;
    this.targetIntensity = 0;
    this.weatherAlert = null;
  }

  public cycleWeather() {
    // Fixed clear weather - changes disabled
    this.setWeather('clear', 0);
  }

  public update(_dt: number, _distance: number, _stageLength: number = 1000): WeatherState {
    this.currentType = 'clear';
    this.targetType = 'clear';
    this.intensity = 0;
    this.targetIntensity = 0;
    this.weatherAlert = null;

    return this.state;
  }
}
