import { BikeConfig, StuntEvent, OutType, WeatherState, StuntStats } from '../types';
import { DesertTerrain } from './terrain';
import { soundFX } from './audio';

export interface ControlsState {
  gas: boolean;
  brake: boolean;
  tiltLeft: boolean;
  tiltRight: boolean;
  nitro: boolean;
}

export class BikePhysics {
  // Config
  public config: BikeConfig;
  public terrain: DesertTerrain;

  // Wheel positions and velocities
  public rx: number = 100;
  public ry: number = 380;
  public rvx: number = 0;
  public rvy: number = 0;
  public rGrounded: boolean = false;
  public rAng: number = 0;

  public fx: number = 160;
  public fy: number = 380;
  public fvx: number = 0;
  public fvy: number = 0;
  public fGrounded: boolean = false;
  public fAng: number = 0;

  // Chassis state
  public cx: number = 130;
  public cy: number = 370;
  public angle: number = 0;
  public angularVelocity: number = 0;
  public rideHeight: number = 24;

  // Rider helmet point
  public hx: number = 130;
  public hy: number = 335;
  public crownX: number = 130;
  public crownY: number = 325;

  // Suspension compression states (0 = rest, positive = compressed, negative = extended)
  public rSuspension: number = 0;
  public fSuspension: number = 0;

  // Game/Player states
  public isCrashed: boolean = false;
  public outType: OutType = null;
  public crashReason: string = '';
  public fuel: number = 100; // 0 to 100
  public outOfFuelTimer: number = 0;
  public timeRemaining: number = 20; // Stage countdown timer in seconds
  public initialTimeLimit: number = 20;
  public elapsedTime: number = 0; // Total active game time from start in seconds
  private lastTickSecond: number = -1;
  public nitro: number = 60; // 0 to 100
  public isNitroActive: boolean = false;
  public speedKmh: number = 0;
  public rpm: number = 0;
  public distanceTraveled: number = 0;
  public maxForwardX: number = 120; // Furthest forward coordinate reached (enforces 25-30m reverse limit)
  public score: number = 0;
  public coins: number = 0;

  public controlSensitivity: number = 1.0; // Adjustable in Settings
  public currentWeather: WeatherState | null = null; // Dynamic Desert Weather (sandstorm/sun-glare)

  // Stunt XP & real-time trick tracking (Tracks backflips, wheelies, and safe landing bonuses)
  public stuntXp: number = 0;              // Total safely banked Stunt XP added to final score
  public pendingStuntXp: number = 0;       // Stunt XP earned in current air / trick waiting for safe landing
  public backflipsCount: number = 0;       // Total successfully landed backflips
  public frontflipsCount: number = 0;      // Total successfully landed frontflips
  public currentAirBackflips: number = 0;  // Backflips completed in current airborne jump
  public currentAirFrontflips: number = 0; // Frontflips completed in current airborne jump
  public wheelieCount: number = 0;         // Total successfully landed wheelies
  public wheelieTotalSec: number = 0;      // Total seconds of landed wheelies
  public currentWheelieTime: number = 0;   // Current active wheelie duration in seconds
  public currentWheelieXp: number = 0;     // Pending XP from current wheelie
  public activeStunt: string | null = null;// Live trick label (e.g. 'BACKFLIP x2', 'WHEELIE 2.1s')
  public lastLandBonus: number = 0;        // Bonus points awarded on last safe landing
  public lastLandTime: number = 0;         // Timestamp of last safe landing

  // Legacy/auxiliary stunt tracking
  public airTime: number = 0; // seconds
  public inAir: boolean = false;
  public airRotationAccumulator: number = 0;
  public previousAngle: number = 0;
  public wheelieTime: number = 0;
  public stoppieTime: number = 0;
  public stunts: StuntEvent[] = [];
  private stuntIdCounter: number = 1;

  // Rider danger & balance rescue tracking ("Rider Out" threat & rescue)
  public isRiderDanger: boolean = false;
  public dangerDirection: 'backward' | 'forward' | null = null;
  public dangerTimer: number = 0;
  private wasInDanger: boolean = false;
  public savedCounter: number = 0;

  // Crash animation ragdoll pieces
  public ragdollTumble: number = 0;

  // Dynamic fuel spawn threshold (between 25% and 30%, or sometimes earlier ~33-42%)
  public nextFuelThreshold: number = 28;

  public updateNextFuelThreshold() {
    // 35% chance to spawn earlier (33% - 42%), 65% chance between 25% and 30%
    if (Math.random() < 0.35) {
      this.nextFuelThreshold = 33 + Math.random() * 9;
    } else {
      this.nextFuelThreshold = 25 + Math.random() * 5;
    }
  }

  constructor(config: BikeConfig, terrain: DesertTerrain) {
    this.config = config;
    this.terrain = terrain;
    this.reset(120);
  }

  public reset(startX: number = 120) {
    this.rx = startX;
    this.fx = startX + this.config.wheelBase;

    const groundR = this.terrain.getHeight(this.rx);
    const groundF = this.terrain.getHeight(this.fx);

    this.ry = groundR - this.config.wheelRadius;
    this.fy = groundF - this.config.wheelRadius;

    this.rvx = 0;
    this.rvy = 0;
    this.fvx = 0;
    this.fvy = 0;

    this.rGrounded = true;
    this.fGrounded = true;

    this.cx = (this.rx + this.fx) / 2;
    this.cy = (this.ry + this.fy) / 2 - this.rideHeight;
    this.angle = Math.atan2(this.fy - this.ry, this.fx - this.rx);
    this.angularVelocity = 0;
    this.previousAngle = this.angle;
    this.airRotationAccumulator = 0;

    this.isCrashed = false;
    this.outType = null;
    this.crashReason = '';
    this.fuel = 100;
    this.outOfFuelTimer = 0;
    this.updateNextFuelThreshold();
    // Endless ride: survival is determined by fuel management and rider balance
    this.initialTimeLimit = 0;
    this.timeRemaining = 0;
    this.elapsedTime = 0;
    this.lastTickSecond = -1;
    this.nitro = 60;
    this.isNitroActive = false;
    this.speedKmh = 0;
    this.rpm = 0.2;
    this.airTime = 0;
    this.wheelieTime = 0;
    this.stoppieTime = 0;
    this.ragdollTumble = 0;
    this.score = 0;
    this.coins = 0;
    this.distanceTraveled = 0;
    this.maxForwardX = this.cx;
    this.stunts = [];

    // Reset Stunt XP & counters
    this.stuntXp = 0;
    this.pendingStuntXp = 0;
    this.backflipsCount = 0;
    this.frontflipsCount = 0;
    this.currentAirBackflips = 0;
    this.currentAirFrontflips = 0;
    this.wheelieCount = 0;
    this.wheelieTotalSec = 0;
    this.currentWheelieTime = 0;
    this.currentWheelieXp = 0;
    this.activeStunt = null;
    this.lastLandBonus = 0;
    this.lastLandTime = 0;

    this.isRiderDanger = false;
    this.dangerDirection = null;
    this.dangerTimer = 0;
    this.wasInDanger = false;
    this.savedCounter = 0;

    this.updateHelmet();
  }

  public getStuntStats(): StuntStats {
    return {
      stuntXp: this.stuntXp,
      pendingXp: Math.round(this.pendingStuntXp + this.currentWheelieXp),
      backflips: this.backflipsCount,
      frontflips: this.frontflipsCount,
      wheelies: this.wheelieCount,
      wheelieSec: Number(this.wheelieTotalSec.toFixed(1)),
      activeStunt: this.activeStunt,
      lastLandBonus: this.lastLandBonus,
      lastLandTime: this.lastLandTime,
    };
  }

  public addStunt(text: string, score: number, color: string = '#f59e0b') {
    const stunt: StuntEvent = {
      id: this.stuntIdCounter++,
      text,
      score,
      color,
      timestamp: Date.now(),
    };
    this.stunts.push(stunt);
    this.score += score;
    soundFX.playStunt();
  }

  public addStuntBanner(text: string, score: number, color: string = '#f59e0b') {
    const stunt: StuntEvent = {
      id: this.stuntIdCounter++,
      text,
      score,
      color,
      timestamp: Date.now(),
    };
    this.stunts.push(stunt);
  }

  private updateHelmet() {
    const cosA = Math.cos(this.angle);
    const sinA = Math.sin(this.angle);

    // Rider head/helmet center in local bike coordinates: (7, -49)
    const headX = 7;
    const headY = -49;
    this.hx = this.cx + headX * cosA - headY * sinA;
    this.hy = this.cy + headX * sinA + headY * cosA;

    // Helmet crown / apex top in local bike coordinates: (7, -58.5)
    const crownX = 7;
    const crownY = -58.5;
    this.crownX = this.cx + crownX * cosA - crownY * sinA;
    this.crownY = this.cy + crownX * sinA + crownY * cosA;
  }

  public update(controls: ControlsState, dt: number, weatherState?: WeatherState) {
    if (weatherState) {
      this.currentWeather = weatherState;
    }

    if (this.isCrashed) {
      this.ragdollTumble += dt * 4;
      soundFX.updateEngine(0, false, false);
      return;
    }

    // Accumulate total gameplay survival time
    this.elapsedTime += dt;

    // Track furthest forward progress and enforce 100-meter (1000 units) reverse ceiling
    this.maxForwardX = Math.max(this.maxForwardX, this.cx);
    const minReverseLimitX = Math.max(100, this.maxForwardX - 1000);

    const levelRatio = this.terrain.isEndless ? 0.6 : Math.min(1, Math.max(0, (this.terrain.levelId - 1) / 37));
    const stageGravMultiplier = (this.terrain as any).gravityMultiplier ?? 1.0;
    const gravity = (0.46 + levelRatio * 0.04) * stageGravMultiplier;
    // Dynamic weather friction modifier (e.g. loose sand in sandstorm, scorching loose sand in sun glare)
    const weatherFrictionMod = this.currentWeather ? this.currentWeather.frictionMultiplier : 1.0;
    const friction = 0.988 * weatherFrictionMod;
    const airResistance = 0.995 - levelRatio * 0.003;

    // Speed calibrated to match Sandstorm Mode speed (85 - 100 km/h, max ~115 km/h with nitro)
    // As requested: "bike ki speed utni rakhe jaise bike sandstorm mode main chal rahi hai"
    const baseTopSpeedKmh = 85 + ((this.config.speed - 7) / 3) * 15;
    const maxAllowedKmh = Math.min(115, baseTopSpeedKmh + (this.isNitroActive ? 15 : 0));
    // Since speedKmh = Math.round(speed * 7.5), max velocity is maxAllowedKmh / 7.5:
    const maxSpeed = maxAllowedKmh / 7.5;
    const baseAccel = (0.36 + this.config.acceleration * 0.030) * this.controlSensitivity;
    const accelPower = baseAccel;

    // Apply dynamic sandstorm / desert wind forces
    if (this.currentWeather && this.currentWeather.windX !== 0 && this.currentWeather.intensity > 0.05) {
      const windPush = this.currentWeather.windX * this.currentWeather.intensity * 0.06;
      this.rvx += windPush * dt;
      this.fvx += windPush * dt;
      if (!this.rGrounded && !this.fGrounded) {
        this.angularVelocity += windPush * 0.003 * dt * 60;
      }
    }

    // 1. Stage Countdown Timer & Time Out check
    if (this.timeRemaining > 0) {
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);
      const currentSec = Math.ceil(this.timeRemaining);
      if (currentSec <= 10 && currentSec > 0 && currentSec !== this.lastTickSecond) {
        this.lastTickSecond = currentSec;
        soundFX.playTimeTick();
      }

      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.isCrashed = true;
        this.outType = 'time_out';
        this.crashReason = '';
        soundFX.playTimeOut();
        return;
      }
    }

    // 2. Realistic Fuel consumption (burns fast so missing canisters causes Fuel Out)
    if (this.fuel > 0) {
      if (controls.gas) {
        const burnRate = this.isNitroActive ? 14.0 : 8.5;
        this.fuel = Math.max(0, this.fuel - dt * burnRate);
      } else {
        this.fuel = Math.max(0, this.fuel - dt * 0.8);
      }
    }

    // Nitro handling
    this.isNitroActive = controls.nitro && this.nitro > 0 && controls.gas;
    if (this.isNitroActive) {
      this.nitro = Math.max(0, this.nitro - dt * 18);
    }

    const currentAccel = this.isNitroActive ? accelPower * 1.8 : accelPower;
    const maxFlipSpeed = 0.135 + (this.config.agility - 5) * 0.005;
    const groundAngle = this.terrain.getAngle(this.cx);

    // Apply gravity
    this.rvy += gravity;
    this.fvy += gravity;

    // Ground check for rear wheel
    const groundR = this.terrain.getHeight(this.rx);
    const rPenetration = this.ry + this.config.wheelRadius - groundR;
    const rNormal = this.terrain.getNormal(this.rx);
    const suspensionReach = (this.rvy < -0.4 || this.fvy < -0.4) ? 2 : 10;
    const rearTouching = rPenetration > 0;
    const rearInReach = rPenetration > -suspensionReach;

    if (rearTouching || (rearInReach && this.fGrounded)) {
      this.rGrounded = true;
      const rSlopeVy = (rNormal.ny > 0.1 ? (-rNormal.nx / rNormal.ny) : 0) * this.rvx;
      if (rearTouching) {
        this.ry = groundR - this.config.wheelRadius;
        if (rSlopeVy < -0.35 && this.rvx > 1.2) {
          // Riding up a hill/dune: carry upward slope velocity so bike launches above the road at the crest!
          this.rvy = Math.min(this.rvy, rSlopeVy * 1.15);
        } else if (this.rvy > 0.6) {
          this.rvy = -Math.min(4.0, this.rvy * 0.28);
        } else if (this.rvy > 0) {
          this.rvy = 0;
        }
      } else if (rSlopeVy < -0.35 && this.rvx > 1.2) {
        this.rvy = Math.min(this.rvy, rSlopeVy * 1.1);
      } else if (this.rvy > 0) {
        this.rvy *= 0.75;
      }

      this.rvx *= friction;

      if (controls.gas && this.fuel > 0) {
        const tangentX = rNormal.ny;
        const tangentY = -rNormal.nx;
        // Smoothly taper throttle as speed approaches top limit (85-115 km/h)
        const currentSpeedKmh = Math.abs((this.rvx + this.fvx) / 2) * 7.5;
        const speedHeadroom = Math.max(0, (maxAllowedKmh - currentSpeedKmh) / 12);
        const throttleFactor = Math.min(1.0, speedHeadroom);
        // Hill-climb assist: provides extra torque on inclines so the bike doesn't stall on high dunes
        const climbAssist = rNormal.nx > 0.02 ? rNormal.nx * 0.5 : 0;
        const effectiveAccel = (currentAccel + climbAssist) * throttleFactor;
        if (effectiveAccel > 0) {
          this.rvx += tangentX * effectiveAccel;
          this.rvy += tangentY * (effectiveAccel * 0.85);
          this.fvx += tangentX * effectiveAccel * 0.65;

          // Hill Climb Racing style front wheelie lift on RACE:
          // Holding RACE lifts the front tire progressively so keeping it held too long risks flipping backward (Rider Out),
          // while pressing BRAKE brings the front tire back down to normal level condition.
          let relPitch = groundAngle - this.angle;
          while (relPitch > Math.PI) relPitch -= Math.PI * 2;
          while (relPitch < -Math.PI) relPitch += Math.PI * 2;

          if (relPitch < -0.03 || !this.rGrounded) {
            // Rear wheel is lifted up: pressing RACE brings rear wheel back down first
            const restoreRearTorque = (0.022 + Math.max(0, -relPitch) * 0.04) * this.controlSensitivity;
            this.angularVelocity = Math.max(-0.085, this.angularVelocity - restoreRearTorque);
            this.rvy += 1.75;
            this.fvy -= 0.35;
          } else {
            const liftFactor = Math.max(0.45, throttleFactor);
            const wheelieTorque = (this.isNitroActive ? 0.016 : 0.0115) * this.controlSensitivity;
            this.angularVelocity = Math.max(-0.075, this.angularVelocity - wheelieTorque);
            this.fvy -= (this.isNitroActive ? 1.35 : 0.95) * liftFactor;
            this.rvy += 0.25 * liftFactor;
          }
        }
        this.rAng += this.rvx * 0.15;
      } else if (controls.brake) {
        // Pressing BRAKE:
        // 1) If front tire is lifted up, brings it back down to normal road condition.
        // 2) Once front tire is down, lifts the rear tire (piche ka tyre) up — slightly less than the front tire lift!
        let relPitch = groundAngle - this.angle;
        while (relPitch > Math.PI) relPitch -= Math.PI * 2;
        while (relPitch < -Math.PI) relPitch += Math.PI * 2;

        if (relPitch > 0.03 || !this.fGrounded) {
          // Front wheel is lifted up: bring it firmly back down to normal road condition
          const restoreTorque = (0.024 + Math.max(0, relPitch) * 0.045) * this.controlSensitivity;
          this.angularVelocity = Math.min(0.09, this.angularVelocity + restoreTorque);
          this.fvy += 1.85;
          this.rvy -= 0.35;
        } else if (this.fGrounded && relPitch > -0.60) {
          // Lift rear tire up (slightly less than the front tire lift on RACE)
          const stoppieTorque = 0.0092 * this.controlSensitivity;
          this.angularVelocity = Math.min(0.058, this.angularVelocity + stoppieTorque);
          this.rvy -= 0.78;
          this.fvy += 0.22;
        }

        if (this.rvx > 0.3 || this.fvx > 0.3) {
          this.rvx *= 0.84;
          this.fvx *= 0.84;
        } else if (this.rx > 25 && this.cx > minReverseLimitX + 2) {
          // Gentle reverse when stopped or very slow
          const tangentX = rNormal.ny;
          const tangentY = -rNormal.nx;
          const revAccel = Math.min(0.25, Math.max(0.16, currentAccel * 0.28));
          this.rvx -= tangentX * revAccel;
          this.rvy -= tangentY * revAccel;
          this.rvx = Math.max(-4.5, this.rvx);
          this.fvx -= tangentX * revAccel * 0.88;
          this.fvx = Math.max(-4.5, this.fvx);
        } else if (this.cx <= minReverseLimitX + 2) {
          this.rvx = Math.max(0, this.rvx);
          this.fvx = Math.max(0, this.fvx);
        }
        this.rAng += this.rvx * 0.12;
      } else {
        // AUTOMATIC REVERSE WHEN RACE BUTTON IS RELEASED
        // As soon as race is released, bike decelerates and gently rolls backwards at low speed
        if (this.rvx > 0.3) {
          this.rvx *= 0.82;
          this.fvx *= 0.82;
        } else if (this.rx > 25 && this.cx > minReverseLimitX + 2) {
          // Gentle auto-reverse along terrain slope at low speed
          const tangentX = rNormal.ny;
          const tangentY = -rNormal.nx;
          const autoRevAccel = Math.min(0.18, Math.max(0.12, currentAccel * 0.2));
          this.rvx -= tangentX * autoRevAccel;
          this.rvy -= tangentY * autoRevAccel;
          this.rvx = Math.max(-3.0, this.rvx);
          this.fvx -= tangentX * autoRevAccel * 0.88;
          this.fvx = Math.max(-3.0, this.fvx);
        } else {
          // Reached reverse limit: stop firmly
          this.rvx = Math.max(0, this.rvx);
          this.fvx = Math.max(0, this.fvx);
        }
        this.rAng += this.rvx * 0.10;
      }
    } else {
      this.rGrounded = false;
      this.rvx *= airResistance;
      this.rvy *= airResistance;
      if (controls.gas && this.fuel > 0) {
        this.rAng += currentAccel * 0.35;
        this.rvx += 0.05;
        this.fvx += 0.05;
        // In the air: holding RACE lifts the front wheel / pitches backward (can cause Rider Out if not leveled with BRAKE)
        this.angularVelocity = Math.max(-0.075, this.angularVelocity - 0.011 * this.controlSensitivity);
      } else {
        this.rAng += this.rvx * 0.08;
      }
      if (controls.brake) {
        this.rAng *= 0.85;
        // In the air: holding BRAKE brings the front wheel down to level the bike
        let relPitch = groundAngle - this.angle;
        while (relPitch > Math.PI) relPitch -= Math.PI * 2;
        while (relPitch < -Math.PI) relPitch += Math.PI * 2;

        if (relPitch > -0.25) {
          this.angularVelocity = Math.min(0.085, this.angularVelocity + 0.018 * this.controlSensitivity);
        } else {
          this.angularVelocity *= 0.90;
        }
      }
    }

    // Ground check for front wheel
    const groundF = this.terrain.getHeight(this.fx);
    const fPenetration = this.fy + this.config.wheelRadius - groundF;
    const fNormal = this.terrain.getNormal(this.fx);
    const frontTouching = fPenetration > 0;
    const frontInReach = fPenetration > -suspensionReach;

    if (frontTouching || (frontInReach && this.rGrounded)) {
      this.fGrounded = true;
      const fSlopeVy = (fNormal.ny > 0.1 ? (-fNormal.nx / fNormal.ny) : 0) * this.fvx;
      if (frontTouching) {
        this.fy = groundF - this.config.wheelRadius;
        if (fSlopeVy < -0.35 && this.fvx > 1.2) {
          // Riding up a hill/dune: carry upward slope velocity so front wheel launches above the road at the crest!
          this.fvy = Math.min(this.fvy, fSlopeVy * 1.15);
        } else if (this.fvy > 0.6) {
          this.fvy = -Math.min(4.0, this.fvy * 0.28);
        } else if (this.fvy > 0) {
          this.fvy = 0;
        }
      } else if (fSlopeVy < -0.35 && this.fvx > 1.2) {
        this.fvy = Math.min(this.fvy, fSlopeVy * 1.1);
      } else if (this.fvy > 0) {
        this.fvy *= 0.75;
      }

      this.fvx *= friction;

      if (controls.gas && this.fuel > 0 && !this.rGrounded) {
        // Forward drive on front wheel when only front wheel is touching ground (e.g. bringing rear wheel down)
        const tangentX = fNormal.ny;
        const tangentY = -fNormal.nx;
        const currentSpeedKmh = Math.abs((this.rvx + this.fvx) / 2) * 7.5;
        const speedHeadroom = Math.max(0, (maxAllowedKmh - currentSpeedKmh) / 12);
        const throttleFactor = Math.min(1.0, speedHeadroom);
        const climbFrontAssist = fNormal.nx > 0.02 ? fNormal.nx * 0.35 : 0;
        const frontAccel = (currentAccel + climbFrontAssist) * 0.85 * throttleFactor;
        if (frontAccel > 0) {
          this.fvx += tangentX * frontAccel;
          this.fvy += tangentY * (frontAccel * 0.5);
          this.rvx += tangentX * frontAccel * 0.75;
        }
        // Pressing RACE when rear wheel is lifted brings the rear wheel back down to the road
        this.angularVelocity = Math.max(-0.085, this.angularVelocity - 0.022 * this.controlSensitivity);
        this.rvy += 1.75;
      } else if (controls.brake) {
        let relPitch = groundAngle - this.angle;
        while (relPitch > Math.PI) relPitch -= Math.PI * 2;
        while (relPitch < -Math.PI) relPitch += Math.PI * 2;

        // Maintain rear wheel lift while BRAKE is held (slightly less than front wheel lift)
        if (!this.rGrounded && relPitch <= 0.03 && relPitch > -0.60) {
          const stoppieTorque = 0.0088 * this.controlSensitivity;
          this.angularVelocity = Math.min(0.058, this.angularVelocity + stoppieTorque);
          this.rvy -= 0.72;
          this.fvy += 0.20;
        }

        if (this.fvx > 0.4) {
          this.fvx *= 0.78;
        } else if (!this.rGrounded && this.fx > 45 && this.cx > minReverseLimitX + 2) {
          // If only front wheel is touching ground, provide gentle reverse drive
          const tangentX = fNormal.ny;
          const tangentY = -fNormal.nx;
          const revAccel = Math.min(0.22, Math.max(0.14, currentAccel * 0.25));
          this.fvx -= tangentX * revAccel;
          this.fvy -= tangentY * revAccel;
          this.rvx -= tangentX * revAccel * 0.85;
          this.fvx = Math.max(-4.0, this.fvx);
          this.rvx = Math.max(-4.0, this.rvx);
        } else if (this.cx <= minReverseLimitX + 2) {
          this.fvx = Math.max(0, this.fvx);
          this.rvx = Math.max(0, this.rvx);
        }
      } else if (!controls.gas && !this.rGrounded) {
        // Front wheel auto-reverse when race is released
        if (this.fvx > 0.3) {
          this.fvx *= 0.82;
          this.rvx *= 0.82;
        } else if (this.fx > 45 && this.cx > minReverseLimitX + 2) {
          const tangentX = fNormal.ny;
          const tangentY = -fNormal.nx;
          const autoRev = Math.min(0.16, Math.max(0.10, currentAccel * 0.18));
          this.fvx -= tangentX * autoRev;
          this.fvy -= tangentY * autoRev;
          this.rvx -= tangentX * autoRev * 0.85;
          this.fvx = Math.max(-2.8, this.fvx);
          this.rvx = Math.max(-2.8, this.rvx);
        } else if (this.cx <= minReverseLimitX + 2) {
          this.fvx = Math.max(0, this.fvx);
          this.rvx = Math.max(0, this.rvx);
        }
      }
      this.fAng += this.fvx * 0.15;
    } else {
      this.fGrounded = false;
      this.fvx *= airResistance;
      this.fvy *= airResistance;
      if (controls.brake) {
        this.fAng *= 0.85;
      } else {
        this.fAng += this.fvx * 0.08;
      }
    }

    // Safety & race speed limits: Top forward velocity strictly capped at maxSpeed (150-180 km/h, max 24.0)
    const maxVelocity = maxSpeed;
    this.rvx = Math.max(-4.5, Math.min(maxVelocity, this.rvx));
    this.fvx = Math.max(-4.5, Math.min(maxVelocity, this.fvx));
    this.rvy = Math.max(-28, Math.min(28, this.rvy));
    this.fvy = Math.max(-28, Math.min(28, this.fvy));

    // Responsive Hill Climb Racing Balance & Air Dynamics
    const inAir = !this.rGrounded && !this.fGrounded;

    if (controls.tiltLeft) {
      if (inAir) {
        // Active BACK FLIP in the air
        this.angularVelocity = Math.max(-maxFlipSpeed, this.angularVelocity - 0.038 * this.controlSensitivity);
      } else {
        // Ground wheelie initiation / lean back: lifts front wheel
        this.angularVelocity = Math.max(-0.11, this.angularVelocity - 0.036 * this.controlSensitivity);
        this.fvy -= 2.2;
        this.rvy += 0.6;
      }
    } else if (controls.tiltRight) {
      if (inAir) {
        // Active FRONT FLIP in the air
        this.angularVelocity = Math.min(maxFlipSpeed, this.angularVelocity + 0.038 * this.controlSensitivity);
      } else {
        // Ground stoppie / lean forward: pushes front wheel down firmly to save from looping out!
        this.angularVelocity = Math.min(0.11, this.angularVelocity + 0.036 * this.controlSensitivity);
        this.fvy += 2.4;
        this.rvy -= 0.8;
      }
    } else {
      // When NO flip/tilt button is pressed:
      if (inAir) {
        // Hill Climb Racing: Realistic rotational inertia in the air without artificial auto-leveling!
        // Player must actively balance the bike; failing to level results in landing on head -> RIDER OUT!
        this.angularVelocity *= 0.985;
      } else if (this.rGrounded && this.fGrounded) {
        // Both wheels on ground: maintain natural ground balance when not actively lifting a wheel
        let uprightDiff = groundAngle - this.angle;
        while (uprightDiff > Math.PI) uprightDiff -= Math.PI * 2;
        while (uprightDiff < -Math.PI) uprightDiff += Math.PI * 2;
        if (controls.gas && this.fuel > 0 && uprightDiff >= -0.03) {
          this.angularVelocity *= 0.94;
        } else if (controls.brake && uprightDiff <= 0.03) {
          this.angularVelocity *= 0.94;
        } else {
          const alignStrength = 0.056;
          this.angularVelocity += uprightDiff * alignStrength;
          this.angularVelocity *= 0.80;
        }
      } else if (this.rGrounded && !this.fGrounded) {
        // Front wheel elevated (wheelie):
        let uprightDiff = groundAngle - this.angle;
        while (uprightDiff > Math.PI) uprightDiff -= Math.PI * 2;
        while (uprightDiff < -Math.PI) uprightDiff += Math.PI * 2;

        if (controls.brake) {
          // Pressing BRAKE actively brings the lifted front wheel back down to normal condition
          if (uprightDiff > 0) {
            this.angularVelocity += uprightDiff * 0.065 + 0.022;
            this.fvy += 2.2;
          }
          this.angularVelocity *= 0.85;
        } else if (controls.gas && this.fuel > 0) {
          // Holding RACE allows the front wheel to stay lifted and continue pitching back (risking Rider Out if held too long)
          this.angularVelocity *= 0.96;
        } else {
          // Neither RACE nor BRAKE pressed: gravity gently settles front wheel if below balance point
          if (uprightDiff > 0 && uprightDiff < 0.85) {
            this.angularVelocity += uprightDiff * 0.028;
            this.fvy += 0.75;
          }
          this.angularVelocity *= 0.90;
        }
      } else if (!this.rGrounded && this.fGrounded) {
        // Rear wheel elevated (stoppie):
        let uprightDiff = groundAngle - this.angle;
        while (uprightDiff > Math.PI) uprightDiff -= Math.PI * 2;
        while (uprightDiff < -Math.PI) uprightDiff += Math.PI * 2;

        if (controls.gas && this.fuel > 0) {
          // Pressing RACE actively brings the lifted rear wheel back down to normal condition
          if (uprightDiff < 0) {
            this.angularVelocity += uprightDiff * 0.065 - 0.022;
            this.rvy += 2.1;
          }
          this.angularVelocity *= 0.85;
        } else if (controls.brake) {
          // Holding BRAKE keeps the rear wheel lifted (capped slightly lower than the front tire lift)
          if (uprightDiff < -0.60) {
            this.angularVelocity += (uprightDiff + 0.60) * 0.06;
            this.rvy += 1.1;
          }
          this.angularVelocity *= 0.94;
        } else {
          // Neither RACE nor BRAKE pressed: gravity gently settles rear wheel back onto the road
          if (uprightDiff < 0) {
            this.angularVelocity += uprightDiff * 0.035;
            this.rvy += 0.95;
          }
          this.angularVelocity *= 0.88;
        }
      } else {
        // Natural pitch inertia while wheelying, stunting, or bouncing
        this.angularVelocity *= 0.92;
      }
    }

    // Apply angular rotation around true center of the two wheels
    const midX = (this.rx + this.fx) / 2;
    const midY = (this.ry + this.fy) / 2;
    if (Math.abs(this.angularVelocity) > 0.0001) {
      const cosA = Math.cos(this.angularVelocity);
      const sinA = Math.sin(this.angularVelocity);

      const rdx = this.rx - midX;
      const rdy = this.ry - midY;
      this.rx = midX + (rdx * cosA - rdy * sinA);
      this.ry = midY + (rdx * sinA + rdy * cosA);

      const fdx = this.fx - midX;
      const fdy = this.fy - midY;
      this.fx = midX + (fdx * cosA - fdy * sinA);
      this.fy = midY + (fdx * sinA + fdy * cosA);
    }

    // Rigid Wheelbase Distance Constraint
    const targetDist = this.config.wheelBase;
    const dx = this.fx - this.rx;
    const dy = this.fy - this.ry;
    const currentDist = Math.max(1, Math.hypot(dx, dy));
    const distDiff = (currentDist - targetDist) / currentDist;

    this.rx += dx * distDiff * 0.5;
    this.ry += dy * distDiff * 0.5;
    this.fx -= dx * distDiff * 0.5;
    this.fy -= dy * distDiff * 0.5;

    // Couple velocities along the wheelbase (softened from 0.4 to 0.22 to eliminate bounce transfer)
    const nx = dx / currentDist;
    const ny = dy / currentDist;
    const relVel = (this.fvx - this.rvx) * nx + (this.fvy - this.rvy) * ny;
    this.rvx += nx * relVel * 0.22;
    this.rvy += ny * relVel * 0.22;
    this.fvx -= nx * relVel * 0.22;
    this.fvy -= ny * relVel * 0.22;

    // Move wheels by velocity
    this.rx += this.rvx;
    this.ry += this.rvy;
    this.fx += this.fvx;
    this.fy += this.fvy;

    // Floor clamping post-movement to prevent ground penetration jitter
    const gR = this.terrain.getHeight(this.rx);
    if (this.ry + this.config.wheelRadius >= gR) {
      this.ry = gR - this.config.wheelRadius;
      if (this.rvy > 0) this.rvy = 0;
      this.rGrounded = true;
    }
    const gF = this.terrain.getHeight(this.fx);
    if (this.fy + this.config.wheelRadius >= gF) {
      this.fy = gF - this.config.wheelRadius;
      if (this.fvy > 0) this.fvy = 0;
      this.fGrounded = true;
    }

    // Rebound damping when grounded: allows energetic bounce over bumps while keeping stability
    if (this.rGrounded && this.rvy < -2.4) {
      this.rvy *= 0.72;
    }
    if (this.fGrounded && this.fvy < -2.4) {
      this.fvy *= 0.72;
    }

    // 100-meter reverse limit: Bike cannot reverse or roll back more than 100 meters (1000 units) from furthest reached position
    if (this.cx < minReverseLimitX) {
      const push = minReverseLimitX - this.cx;
      this.rx += push;
      this.fx += push;
      this.cx = minReverseLimitX;
      this.rvx = Math.max(0, this.rvx);
      this.fvx = Math.max(0, this.fvx);
    }

    // Track starting boundary limit (cannot drive backwards off the world)
    if (this.rx < 20) {
      const push = 20 - this.rx;
      this.rx = 20;
      this.fx += push;
      this.rvx = Math.max(0, this.rvx);
      this.fvx = Math.max(0, this.fvx);
    }

    // Update chassis center, angle, and helmet
    this.cx = (this.rx + this.fx) / 2;
    this.cy = (this.ry + this.fy) / 2 - this.rideHeight;
    this.angle = Math.atan2(this.fy - this.ry, this.fx - this.rx);
    this.updateHelmet();

    // Calculate speedometer and RPM (calibrated to sandstorm speed range)
    const avgVx = (this.rvx + this.fvx) / 2;
    const speed = Math.abs(avgVx);
    this.speedKmh = Math.min(120, Math.round(speed * 7.5));
    this.distanceTraveled = Math.max(0, Math.floor((this.cx - 100) / 10));

    // Dynamic RPM calculation (revs engine during gas OR during reverse)
    const isReversing = avgVx < -0.5;
    const targetRpm = controls.gas
      ? Math.min(1.0, 0.3 + (speed / maxSpeed) * 0.65 + (this.isNitroActive ? 0.2 : 0))
      : isReversing
      ? Math.min(0.75, 0.25 + (speed / maxSpeed) * 0.55)
      : Math.max(0.1, (speed / maxSpeed) * 0.4);
    this.rpm += (targetRpm - this.rpm) * 0.12;
    soundFX.updateEngine(this.rpm, controls.gas || isReversing, this.isNitroActive);

    // Stunt detection logic (Real-time Backflips, Wheelies & Pending XP)
    const bothInAir = !this.rGrounded && !this.fGrounded;

    if (bothInAir) {
      if (!this.inAir) {
        this.inAir = true;
        this.airRotationAccumulator = 0;
        this.previousAngle = this.angle;
        this.currentAirBackflips = 0;
        this.currentAirFrontflips = 0;
      }
      this.airTime += dt;

      // Track rotational deltas for flips
      let deltaAngle = this.angle - this.previousAngle;
      // Normalize delta angle
      while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
      this.airRotationAccumulator += deltaAngle;
      this.previousAngle = this.angle;

      // Check for flip thresholds in air:
      // Backward rotation is negative delta angle in this screen coordinate system
      if (this.airRotationAccumulator <= -Math.PI * 1.85) {
        this.currentAirBackflips++;
        const flipPoints = 350 + (this.currentAirBackflips - 1) * 150;
        this.pendingStuntXp += flipPoints;
        this.nitro = Math.min(100, this.nitro + 35);
        this.activeStunt = this.currentAirBackflips > 1
          ? `⚡ BACKFLIP x${this.currentAirBackflips} (+${this.pendingStuntXp} XP PENDING)`
          : `⚡ BACKFLIP (+${flipPoints} XP PENDING)`;
        this.addStuntBanner(this.activeStunt, flipPoints, '#38bdf8');
        soundFX.playStunt();
        this.airRotationAccumulator += Math.PI * 2;
      } else if (this.airRotationAccumulator >= Math.PI * 1.85) {
        this.currentAirFrontflips++;
        const flipPoints = 350 + (this.currentAirFrontflips - 1) * 150;
        this.pendingStuntXp += flipPoints;
        this.nitro = Math.min(100, this.nitro + 35);
        this.activeStunt = this.currentAirFrontflips > 1
          ? `🔥 FRONTFLIP x${this.currentAirFrontflips} (+${this.pendingStuntXp} XP PENDING)`
          : `🔥 FRONTFLIP (+${flipPoints} XP PENDING)`;
        this.addStuntBanner(this.activeStunt, flipPoints, '#f97316');
        soundFX.playStunt();
        this.airRotationAccumulator -= Math.PI * 2;
      } else if (this.airTime > 1.2 && this.currentAirBackflips === 0 && this.currentAirFrontflips === 0) {
        this.activeStunt = `🚀 BIG AIR (${this.airTime.toFixed(1)}s)`;
      }
    } else {
      // Wheelie detection: Rear wheel grounded, front wheel high in air with forward momentum
      if (this.rGrounded && !this.fGrounded && this.rvx > 2.2 && this.angle < -0.24) {
        this.currentWheelieTime += dt;
        this.currentWheelieXp += dt * 140; // Accrue ~140 XP per second of sustained wheelie
        this.activeStunt = `🏍️ WHEELIE (${this.currentWheelieTime.toFixed(1)}s) +${Math.round(this.currentWheelieXp)} XP`;
      } else {
        // Safe Wheelie Completion: Front wheel gently returned to ground or leveled out
        if (this.currentWheelieTime >= 0.75 && !this.isCrashed) {
          const wheelieBonus = Math.round(this.currentWheelieXp + this.currentWheelieTime * 80);
          this.stuntXp += wheelieBonus;
          this.score += wheelieBonus; // Add bonus points directly to score!
          this.wheelieCount++;
          this.wheelieTotalSec += this.currentWheelieTime;
          this.lastLandBonus = wheelieBonus;
          this.lastLandTime = Date.now();
          this.addStuntBanner(`🏍️ SAFE WHEELIE LANDED! (${this.currentWheelieTime.toFixed(1)}s) +${wheelieBonus} STUNT XP BONUS`, wheelieBonus, '#eab308');
          soundFX.playSafeLandingStuntBonus();
        }
        this.currentWheelieTime = 0;
        this.currentWheelieXp = 0;
        if (this.activeStunt?.startsWith('🏍️ WHEELIE')) {
          this.activeStunt = null;
        }
      }

      // Stoppie detection: Front wheel grounded, rear wheel up in air during braking
      if (this.fGrounded && !this.rGrounded && this.fvx > 2.0 && this.angle > 0.35) {
        this.stoppieTime += dt;
      } else {
        if (this.stoppieTime > 0.8 && !this.isCrashed) {
          const stoppieBonus = 160;
          this.stuntXp += stoppieBonus;
          this.score += stoppieBonus;
          this.lastLandBonus = stoppieBonus;
          this.lastLandTime = Date.now();
          this.addStuntBanner(`🏁 SAFE STOPPIE! +${stoppieBonus} STUNT XP BONUS`, stoppieBonus, '#22c55e');
          soundFX.playSafeLandingStuntBonus();
        }
        this.stoppieTime = 0;
      }
    }

    // Compute relative angle of bike compared to the local ground slope
    let relToGround = this.angle - groundAngle;
    while (relToGround > Math.PI) relToGround -= Math.PI * 2;
    while (relToGround < -Math.PI) relToGround += Math.PI * 2;

    // Crash & Out Detection:
    // 1. RIDER OUT! (Driver head/helmet touches the road/ground)
    const groundAtHelmet = this.terrain.getHeight(this.hx);
    const groundAtCrown = this.terrain.getHeight(this.crownX);
    const minGroundNearHead = Math.min(
      groundAtHelmet,
      groundAtCrown,
      this.terrain.getHeight(this.hx - 9),
      this.terrain.getHeight(this.hx + 9),
      this.terrain.getHeight(this.crownX - 9),
      this.terrain.getHeight(this.crownX + 9)
    );

    // Calculate vertical clearance between rider's helmet/crown and the ground
    const headClearance = minGroundNearHead - (this.hy + 8);
    const crownClearance = groundAtCrown - (this.crownY + 1.5);
    const minClearance = Math.min(headClearance, crownClearance);

    // In Danger Zone detection (for stunt bonus on recovery, without intrusive UI warnings)
    const isDangerousBackwardPitch = relToGround < -0.72; // ~41° rearward tilt
    const isDangerousForwardPitch = relToGround > 0.72;   // ~41° forward tilt
    const isCriticalHeadProximity = minClearance < 25;
    const inDangerZone = isDangerousBackwardPitch || isDangerousForwardPitch || isCriticalHeadProximity;

    if (inDangerZone && !this.isCrashed) {
      this.isRiderDanger = false; // Keep warning false so no warning alert displays
      this.dangerTimer += dt;
      this.wasInDanger = true;
    } else if (!inDangerZone && this.wasInDanger && !this.isCrashed) {
      // Player actively balanced the bike and saved the rider from RIDER OUT!
      if (this.dangerTimer >= 0.20 && Math.abs(relToGround) < 0.38 && minClearance > 36) {
        this.savedCounter++;
        const saveBonus = 150;
        this.score += saveBonus;
        this.addStuntBanner('🛡️ RIDER SAVED! +150 BALANCE RECOVERY', saveBonus, '#10b981');
        soundFX.playSafeLandingStuntBonus();
      }
      this.isRiderDanger = false;
      this.dangerDirection = null;
      this.dangerTimer = 0;
      this.wasInDanger = false;
    }

    // Hill Climb Racing Bike #2 Crash Condition:
    // Rider does NOT get out during normal riding, wheelies, or stoppies.
    // Rider ONLY gets out when bike genuinely capsizes upside-down onto the helmet,
    // or when the helmet directly smashes forcefully into the terrain!
    const isUpsideDown = Math.abs(relToGround) > 1.85; // Over ~106° upside down
    const isHelmetCrushed = (isUpsideDown && crownClearance <= -1.5) || minClearance <= -7.0;
    const isHeadTouchingRoad = isHelmetCrushed;

    if (isHeadTouchingRoad) {
      this.isCrashed = true;
      this.outType = 'rider_out';
      this.crashReason = '👤 RIDER OUT!';
      this.isRiderDanger = false;
      this.dangerDirection = null;
      this.dangerTimer = 0;
      this.wasInDanger = false;
      // Crash forfeiture: lose unbanked stunt XP
      if (this.pendingStuntXp > 0 || this.currentWheelieXp > 0) {
        const lost = Math.round(this.pendingStuntXp + this.currentWheelieXp);
        this.addStuntBanner(`💥 CRASHED! LOST ${lost} UNBANKED STUNT XP`, 0, '#ef4444');
        this.pendingStuntXp = 0;
        this.currentWheelieXp = 0;
        this.currentAirBackflips = 0;
        this.currentAirFrontflips = 0;
      }
      this.activeStunt = null;
      soundFX.playCrash();
      return;
    }

    // 2. CRASHED OUT! (Severe upside-down landing on chassis or high-speed chassis collision)
    const crashSpeed = Math.abs((this.rvx + this.fvx) / 2);
    if (crashSpeed > 8.0) {
      const isUpsideDown = Math.abs(relToGround) > Math.PI * 0.90;
      if (isUpsideDown && (this.cy >= groundAtHelmet - 6)) {
        this.isCrashed = true;
        this.outType = 'crashed_out';
        this.crashReason = 'CRASHED OUT! Bike flipped inverted on dunes';
        if (this.pendingStuntXp > 0 || this.currentWheelieXp > 0) {
          const lost = Math.round(this.pendingStuntXp + this.currentWheelieXp);
          this.addStuntBanner(`💥 CRASHED! LOST ${lost} UNBANKED STUNT XP`, 0, '#ef4444');
          this.pendingStuntXp = 0;
          this.currentWheelieXp = 0;
          this.currentAirBackflips = 0;
          this.currentAirFrontflips = 0;
        }
        this.activeStunt = null;
        soundFX.playCrash();
        return;
      }
    }

    // Fall check (if bike falls into canyon)
    if (this.cy > 2500) {
      this.isCrashed = true;
      this.outType = 'crashed_out';
      this.crashReason = 'CRASHED OUT! Fell into desert canyon';
      this.pendingStuntXp = 0;
      this.currentWheelieXp = 0;
      this.activeStunt = null;
      soundFX.playCrash();
      return;
    }

    // SAFE LANDING DETECTION (When touchdown occurs safely without crashing!)
    if (!bothInAir && this.inAir && !this.isCrashed) {
      soundFX.playLand(Math.min(1.0, Math.abs(this.rvy) / 10));

      // Add Big Air bonus if high jump
      if (this.airTime > 1.2 && this.currentAirBackflips === 0 && this.currentAirFrontflips === 0) {
        const airBonus = Math.round(this.airTime * 70);
        this.pendingStuntXp += airBonus;
      }

      if (this.pendingStuntXp > 0) {
        const safeLandingBonus = this.pendingStuntXp;
        // Bank safely into Stunt XP and add bonus points directly to score!
        this.stuntXp += safeLandingBonus;
        this.score += safeLandingBonus;
        this.backflipsCount += this.currentAirBackflips;
        this.frontflipsCount += this.currentAirFrontflips;
        this.lastLandBonus = safeLandingBonus;
        this.lastLandTime = Date.now();

        // Celebratory banner with breakdown
        let landingLabel = '🏆 SAFE LANDING!';
        if (this.currentAirBackflips > 0) {
          landingLabel = `⚡ ${this.currentAirBackflips > 1 ? `x${this.currentAirBackflips} ` : ''}BACKFLIP LANDED!`;
        } else if (this.currentAirFrontflips > 0) {
          landingLabel = `🔥 ${this.currentAirFrontflips > 1 ? `x${this.currentAirFrontflips} ` : ''}FRONTFLIP LANDED!`;
        }
        this.addStuntBanner(`${landingLabel} +${safeLandingBonus} STUNT XP BONUS!`, safeLandingBonus, '#10b981');
        soundFX.playSafeLandingStuntBonus();
      }

      // Reset airborne state
      this.inAir = false;
      this.pendingStuntXp = 0;
      this.currentAirBackflips = 0;
      this.currentAirFrontflips = 0;
      this.airTime = 0;
      this.airRotationAccumulator = 0;
      if (this.activeStunt?.includes('FLIP') || this.activeStunt?.includes('AIR')) {
        this.activeStunt = null;
      }
    }

    // 3. FUEL OUT! (when fuel runs out completely and bike loses momentum)
    if (this.fuel <= 0 && this.cx > 140) {
      this.outOfFuelTimer += dt;
      const currentSpeed = Math.abs((this.rvx + this.fvx) / 2);
      if (currentSpeed < 1.6 || this.outOfFuelTimer > 1.2) {
        this.isCrashed = true;
        this.outType = 'fuel_out';
        this.crashReason = 'FUEL OUT! Gasoline tank is completely dry';
        soundFX.playFuelOut();
        return;
      }
    } else {
      this.outOfFuelTimer = 0;
    }

    // Dynamic fuel canister spawn ahead when fuel drops to threshold (25-30% or sometimes earlier)
    if (this.fuel <= this.nextFuelThreshold && this.cx > 140) {
      this.terrain.spawnFuelAhead(this.cx);
    }

    // Clean up old stunts
    const now = Date.now();
    this.stunts = this.stunts.filter((s) => now - s.timestamp < 2500);

    // Check collectibles collision
    this.checkCollectibles();
  }

  private checkCollectibles() {
    const checkRadius = 40;
    for (const item of this.terrain.collectibles) {
      if (item.collected) continue;
      const d1 = Math.hypot(item.x - this.cx, item.y - this.cy);
      const d2 = Math.hypot(item.x - this.rx, item.y - this.ry);
      const d3 = Math.hypot(item.x - this.fx, item.y - this.fy);

      if (d1 < checkRadius || d2 < checkRadius || d3 < checkRadius) {
        item.collected = true;
        if (item.type === 'coin') {
          this.coins += 5;
          this.score += 100;
          soundFX.playCoin();
        } else if (item.type === 'fuel') {
          this.fuel = Math.min(100, this.fuel + 75);
          this.addStunt('⛽ FUEL REFILLED +75%!', 150, '#ef4444');
          soundFX.playFuel();
          this.updateNextFuelThreshold();
        } else if (item.type === 'nitro') {
          this.nitro = 100;
          this.addStunt('⚡ NITRO SUPERCHARGED!', 100, '#06b6d4');
          soundFX.playFuel();
        }
      }
    }

    // Check checkpoints
    for (const cp of this.terrain.checkpoints) {
      if (!cp.reached && this.cx >= cp.x) {
        cp.reached = true;
        this.addStunt('🚩 CHECKPOINT! +200', 200, '#10b981');
        soundFX.playCoin();
      }
    }
  }
}
