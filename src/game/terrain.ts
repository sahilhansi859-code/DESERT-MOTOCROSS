import { Collectible, Checkpoint, LevelInfo } from '../types';

export interface TerrainSegment {
  x: number;
  y: number;
}

export const CAMPAIGN_LEVELS: LevelInfo[] = [
  {
    id: 1,
    name: 'Valley of the Pharaohs',
    description: 'Ancient Egyptian tomb necropolis with stepped mastaba ramps, towering pyramids, and golden sand.',
    length: 25000,
    difficulty: 'Easy',
    starsEarned: 0,
    themeId: 'sahara_sunset',
    themeName: 'Valley of the Pharaohs',
    unlocked: true,
    cost: 0,
  },
  {
    id: 2,
    name: 'Dinosaur Fossil Badlands',
    description: 'Prehistoric excavation gorge with giant T-Rex ribcage arches, fossilized bone spines, and chalky dunes.',
    length: 26000,
    difficulty: 'Medium',
    starsEarned: 0,
    themeId: 'fossil_badlands',
    themeName: 'Dinosaur Fossil Badlands',
    unlocked: false,
    cost: 50000,
  },
  {
    id: 4,
    name: 'Meteor Impact Basin',
    description: 'Deep cosmic collision crater with scorched basalt boulders and explosive rim launch ramps.',
    length: 28000,
    difficulty: 'Hard',
    starsEarned: 0,
    themeId: 'meteor_crater',
    themeName: 'Meteor Impact Basin',
    unlocked: false,
    cost: 100000,
  },
  {
    id: 5,
    name: 'Skeleton Coast Shipwrecks',
    description: 'Haunting coastal desert graveyard with massive 18th-century galleon wrecks, anchors, and beach dunes.',
    length: 27000,
    difficulty: 'Medium',
    starsEarned: 0,
    themeId: 'skeleton_coast',
    themeName: 'Skeleton Coast Shipwrecks',
    unlocked: false,
    cost: 150000,
  },
  {
    id: 6,
    name: 'Wadi Rum Red Archways',
    description: 'Colossal natural sandstone rock arches to jump through, steep red canyon gorges, and sheer walls.',
    length: 29000,
    difficulty: 'Hard',
    starsEarned: 0,
    themeId: 'red_rock_canyon',
    themeName: 'Wadi Rum Red Archways',
    unlocked: false,
    cost: 200000,
  },
  {
    id: 7,
    name: 'Desert Oilfield Outpost',
    description: 'Industrial drill field featuring giant nodding pumpjacks, desert oil pipelines, and steel launch ramps.',
    length: 28000,
    difficulty: 'Hard',
    starsEarned: 0,
    themeId: 'oilfield_outpost',
    themeName: 'Desert Oilfield Outpost',
    unlocked: false,
    cost: 250000,
  },
  {
    id: 8,
    name: 'Lost Bedouin Citadel',
    description: 'Sunken fortress ruins with mud-brick battlement jumps, ancient aqueduct leaps, and crumbling gates.',
    length: 30000,
    difficulty: 'Extreme',
    starsEarned: 0,
    themeId: 'lost_citadel',
    themeName: 'Lost Bedouin Citadel',
    unlocked: false,
    cost: 300000,
  },
];

export class DesertTerrain {
  public baseHeight: number = 440;
  public levelId: number = 1;
  public isEndless: boolean = true;
  public levelLength: number = 999999;
  public gravityMultiplier: number = 1.0;
  public collectibles: Collectible[] = [];
  public checkpoints: Checkpoint[] = [];

  constructor(levelId: number = 1, isEndless: boolean = true) {
    this.setLevel(levelId, isEndless);
  }

  public setLevel(levelId: number = 1, isEndless: boolean = true) {
    this.levelId = levelId;
    this.isEndless = isEndless;
    const info = CAMPAIGN_LEVELS.find((l) => l.id === levelId) || CAMPAIGN_LEVELS[0];
    this.gravityMultiplier = info?.gravityMultiplier ?? 1.0;
    this.levelLength = 999999;
    this.generateCollectiblesAndCheckpoints();
  }

  // Continuous mathematical height function with thrilling dunes, rolling hills,
  // deep valleys, step-up jump kickers, and moguls
  public getHeight(x: number): number {
    if (x < 240) {
      return this.baseHeight;
    }

    const dist = x - 240;
    // Smooth ramp-in transition from flat starting launch pad
    const blend = Math.min(1, dist / 220);

    // Dynamic elevation & jump profiles tailored for each pure desert stage
    let ampScale = 1.25;
    let whoopScale = 1.0;
    let jumpScale = 1.1;
    let freqMod = 1.0;

    switch (this.levelId) {
      case 1: // Valley of the Pharaohs: Smooth sweeping dunes with stepped mastaba pyramid ramps
        ampScale = 1.1;
        whoopScale = 0.8;
        jumpScale = 1.0;
        freqMod = 0.95;
        break;
      case 2: // Dinosaur Fossil Badlands: Jagged prehistoric bone spines & fossil mounds
        ampScale = 1.35;
        whoopScale = 1.3;
        jumpScale = 1.2;
        freqMod = 1.08;
        break;
      case 3: // Ghost Town Mine Run: Elevated wooden mine trestles & steep chute drops
        ampScale = 1.2;
        whoopScale = 0.9;
        jumpScale = 1.3;
        freqMod = 0.96;
        break;
      case 4: // Meteor Impact Basin: Massive deep impact crater depression bowl & explosive lip launches
        ampScale = 1.5;
        whoopScale = 1.0;
        jumpScale = 1.6;
        freqMod = 1.02;
        break;
      case 5: // Skeleton Coast Shipwrecks: High coastal beach dune drops & sweeping sand washboards
        ampScale = 1.35;
        whoopScale = 1.1;
        jumpScale = 1.25;
        freqMod = 1.0;
        break;
      case 6: // Wadi Rum Red Archways: High canyon step-ups through rock arches & deep sandstone ravines
        ampScale = 1.55;
        whoopScale = 1.15;
        jumpScale = 1.4;
        freqMod = 1.06;
        break;
      case 7: // Desert Oilfield Outpost: Pipeline bund crossings, terraced gravel pads & rhythm bumps
        ampScale = 1.25;
        whoopScale = 1.35;
        jumpScale = 1.25;
        freqMod = 1.1;
        break;
      case 8: // Lost Bedouin Citadel: Ancient sunken aqueduct trenches & fortress rampart drops
        ampScale = 1.6;
        whoopScale = 1.2;
        jumpScale = 1.45;
        freqMod = 1.12;
        break;
      case 9: // Dune Roller-Wave Superpark: Sculpted supercross rhythm section & giant halfpipe waves
        ampScale = 1.4;
        whoopScale = 1.8;
        jumpScale = 1.55;
        freqMod = 1.18;
        break;
      case 10: // Grand Mesa Slot Canyon: Monumental tabletop mesas & terrifying bottomless canyon gaps
        ampScale = 1.85;
        whoopScale = 1.25;
        jumpScale = 1.7;
        freqMod = 1.15;
        break;
    }

    // Grand Undulating Desert Mountain Dunes & Deep Valleys ("Ucha-Nicha")
    // Starts with an upward mountain climb right after the launch pad
    const majorHill = -Math.sin(dist * (0.0024 * freqMod)) * (82 * ampScale);

    // Secondary rolling desert ridge
    const rollingRidge = -Math.sin(dist * (0.0052 * freqMod) + 0.4) * (44 * ampScale);

    // Tertiary camel-back double humps (softened for smooth riding)
    const camelHumps = Math.cos(x * 0.008 + 0.5) * (13 * ampScale);

    // Motocross Whoops / Mogul Rhythm Sections
    const whoopCycle = 880;
    const whoopPhase = (x % whoopCycle) / whoopCycle;
    let zigZagWhoops = 0;
    if (whoopPhase > 0.18 && whoopPhase < 0.58) {
      const env = Math.sin(((whoopPhase - 0.18) / 0.40) * Math.PI);
      zigZagWhoops = Math.sin(x * 0.026) * (8 * env * whoopScale);
    }

    // Tall Desert Mountain Launch Peaks ("Ucha Pahad") & Smooth Downhill Landings
    const jumpCycle = 740;
    const jumpPhase = ((x + 260) % jumpCycle) / jumpCycle;
    let jumpRamp = 0;
    if (jumpPhase > 0.48 && jumpPhase < 0.94) {
      const p = (jumpPhase - 0.48) / 0.46;
      if (p < 0.58) {
        // Steep upward mountain ramp that angles skyward right up to the peak
        const upP = p / 0.58;
        const rampCurve = 0.45 * Math.sin(upP * (Math.PI / 2)) + 0.55 * (upP * upP);
        jumpRamp = -rampCurve * (78 * jumpScale);
      } else {
        const downP = (p - 0.58) / 0.42;
        jumpRamp = -Math.cos(downP * (Math.PI / 2)) * (78 * jumpScale);
      }
    }

    // Stage-Specific Signature Landmark Obstacles & Topography
    let signatureFeature = 0;
    switch (this.levelId) {
      case 1: {
        // Valley of the Pharaohs: Stepped mastaba pyramid terrace climb
        const pCycle = 1200;
        const pPhase = (x % pCycle) / pCycle;
        if (pPhase > 0.45 && pPhase < 0.85) {
          const stepIdx = Math.floor((pPhase - 0.45) * 8);
          signatureFeature = -stepIdx * 6.5;
        }
        break;
      }
      case 2: {
        // Dinosaur Fossil Badlands: Jagged prehistoric dinosaur spine ridges & bone mounds
        const fCycle = 750;
        const fPhase = (x % fCycle) / fCycle;
        if (fPhase > 0.28 && fPhase < 0.72) {
          signatureFeature = Math.abs(Math.sin(x * 0.032)) * -24;
        }
        break;
      }
      case 3: {
        // Ghost Town Mine Run: Elevated wooden trestle tabletop & steep mine chute drop
        const tCycle = 1300;
        const tPhase = (x % tCycle) / tCycle;
        if (tPhase > 0.35 && tPhase < 0.62) {
          signatureFeature = -38; // elevated wooden trestle plateau
        } else if (tPhase >= 0.62 && tPhase < 0.76) {
          const dp = (tPhase - 0.62) / 0.14;
          signatureFeature = -38 * (1 - dp); // steep drop chute
        }
        break;
      }
      case 4: {
        // Meteor Impact Basin: Deep crater bowl depression (downward) & explosive rim launch
        const cCycle = 1450;
        const cPhase = (x % cCycle) / cCycle;
        if (cPhase > 0.25 && cPhase < 0.72) {
          const cp = (cPhase - 0.25) / 0.47;
          signatureFeature = Math.sin(cp * Math.PI) * 78; // deep crater depression
        } else if (cPhase >= 0.72 && cPhase < 0.85) {
          const rp = (cPhase - 0.72) / 0.13;
          signatureFeature = -Math.sin(rp * Math.PI) * 36; // explosive rim launch ramp
        }
        break;
      }
      case 5: {
        // Skeleton Coast Shipwrecks: High beach slip-face drops into soft tidal sand
        const sCycle = 1100;
        const sPhase = (x % sCycle) / sCycle;
        if (sPhase > 0.52 && sPhase < 0.70) {
          const sp = (sPhase - 0.52) / 0.18;
          signatureFeature = sp * 48; // beach dune drop
        }
        break;
      }
      case 6: {
        // Wadi Rum Red Archways: Step-up rock arch bridge launches & deep sandstone canyon floor
        const aCycle = 1200;
        const aPhase = (x % aCycle) / aCycle;
        if (aPhase > 0.38 && aPhase < 0.56) {
          const ap = (aPhase - 0.38) / 0.18;
          signatureFeature = -Math.sin(ap * (Math.PI / 2)) * 44; // rock arch step-up
        } else if (aPhase >= 0.56 && aPhase < 0.75) {
          signatureFeature = 30; // sandstone canyon floor
        }
        break;
      }
      case 7: {
        // Desert Oilfield Outpost: Pipeline bund berms & terraced industrial gravel pads
        const oCycle = 850;
        const oPhase = (x % oCycle) / oCycle;
        if (oPhase > 0.30 && oPhase < 0.46) {
          signatureFeature = -Math.sin(((oPhase - 0.30) / 0.16) * Math.PI) * 28;
        }
        break;
      }
      case 8: {
        // Lost Bedouin Citadel: Ancient sunken aqueduct canal & fortress parapet step jump
        const cCycle = 1350;
        const cPhase = (x % cCycle) / cCycle;
        if (cPhase > 0.40 && cPhase < 0.54) {
          signatureFeature = 38; // sunken aqueduct canal
        } else if (cPhase >= 0.54 && cPhase < 0.74) {
          signatureFeature = -34; // elevated fortress wall
        }
        break;
      }
      case 9: {
        // Dune Roller-Wave Superpark: Sculpted rhythm whoops & high-speed wave crests
        const rCycle = 750;
        const rPhase = (x % rCycle) / rCycle;
        if (rPhase > 0.15 && rPhase < 0.85) {
          signatureFeature = Math.sin(x * 0.034) * 20;
        }
        break;
      }
      case 10: {
        // Grand Mesa Slot Canyon: Towering tabletop mesa plateau & dizzying canyon chasm
        const mCycle = 1600;
        const mPhase = (x % mCycle) / mCycle;
        if (mPhase > 0.25 && mPhase < 0.58) {
          signatureFeature = -50; // tabletop mesa
        } else if (mPhase >= 0.58 && mPhase < 0.74) {
          const mp = (mPhase - 0.58) / 0.16;
          signatureFeature = -50 + mp * 105; // plunge into deep slot canyon
        }
        break;
      }
    }

    return (
      this.baseHeight +
      (majorHill + rollingRidge + camelHumps + zigZagWhoops + jumpRamp + signatureFeature) * blend
    );
  }

  // Calculate tangent angle of terrain at x (Smooth finite difference)
  public getAngle(x: number): number {
    const delta = 8;
    const y1 = this.getHeight(x - delta);
    const y2 = this.getHeight(x + delta);
    return Math.atan2(y2 - y1, delta * 2);
  }

  // Calculate normal vector (pointing perpendicular upward from ground)
  public getNormal(x: number): { nx: number; ny: number } {
    const angle = this.getAngle(x);
    return {
      nx: -Math.sin(angle),
      ny: Math.cos(angle),
    };
  }

  private generateCollectiblesAndCheckpoints() {
    this.collectibles = [];
    this.checkpoints = [];

    const totalLen = 20000;
    let collectibleId = 1;

    // Checkpoints spaced evenly every 250m (2500 world units) across the desert track
    const cpDistance = 2500;
    const cpEnd = 18000;
    for (let x = cpDistance; x < cpEnd; x += cpDistance) {
      this.checkpoints.push({
        id: this.checkpoints.length + 1,
        x,
        y: this.getHeight(x),
        reached: false,
      });
    }

    // Sparsely placed, clean desert coin clusters (reduced quantity/density)
    // Placed at pleasant intervals (~750 units) in small 2-3 coin arcs
    for (let x = 650; x < totalLen - 300; x += 750) {
      const clusterCount = Math.floor(x / 750) % 3 === 0 ? 3 : 2;
      for (let c = 0; c < clusterCount; c++) {
        const coinX = x + c * 42;
        const groundY = this.getHeight(coinX);
        this.collectibles.push({
          id: collectibleId++,
          x: coinX,
          y: groundY - 34,
          type: 'coin',
          collected: false,
          value: 20,
        });
      }
    }
  }

  // Dynamically spawn fuel canister ahead when player fuel is low
  public spawnFuelAhead(playerX: number, minDistance = 500, maxDistance = 750) {
    // Check if there is already an active uncollected fuel canister ahead
    const hasFuelAhead = this.collectibles.some(
      (c) => c.type === 'fuel' && !c.collected && c.x >= playerX - 100 && c.x <= playerX + 1800
    );
    if (hasFuelAhead) return;

    const spawnDist = minDistance + Math.random() * (maxDistance - minDistance);
    const fx = Math.round(playerX + spawnDist);

    const gy = this.getHeight(fx);
    const nextId = this.collectibles.length + 1;
    this.collectibles.push({
      id: nextId,
      x: fx,
      y: gy - 36,
      type: 'fuel',
      collected: false,
      value: 100,
    });
  }

  // Extend collectibles in endless mode when player moves far
  public ensureEndlessArea(currentX: number) {
    const maxExisting = this.collectibles.length > 0 ? this.collectibles[this.collectibles.length - 1].x : 0;
    if (currentX + 3500 > maxExisting) {
      let collectibleId = this.collectibles.length + 1;
      const startX = Math.max(maxExisting + 100, currentX + 800);
      const endX = startX + 6000;

      // Add endless checkpoints every 2500 units
      const lastCpX = this.checkpoints.length > 0 ? this.checkpoints[this.checkpoints.length - 1].x : 0;
      for (let cpx = Math.max(lastCpX + 2500, startX); cpx < endX; cpx += 2500) {
        this.checkpoints.push({
          id: this.checkpoints.length + 1,
          x: cpx,
          y: this.getHeight(cpx),
          reached: false,
        });
      }

      // Add sparsely placed coins in endless mode (reduced density)
      for (let x = startX; x < endX; x += 750) {
        const clusterCount = Math.floor(x / 750) % 3 === 0 ? 3 : 2;
        for (let c = 0; c < clusterCount; c++) {
          const coinX = x + c * 42;
          const gy = this.getHeight(coinX);
          this.collectibles.push({
            id: collectibleId++,
            x: coinX,
            y: gy - 34,
            type: 'coin',
            collected: false,
            value: 20,
          });
        }
      }
    }
  }
}
