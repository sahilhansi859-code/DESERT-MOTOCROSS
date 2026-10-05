import { BikeConfig } from '../types';

export const BIKES: BikeConfig[] = [
  {
    id: 'motocross_250',
    name: 'Apex Rally 350R',
    subtitle: 'High-Performance Desert Sport Rally Bike',
    category: 'Sport Rally',
    image: '/bikes/motocross_250.jpg',
    speed: 8,
    acceleration: 9,
    suspension: 9,
    agility: 9,
    color: '#e11d48', // Vibrant Racing Rose / Crimson
    secondaryColor: '#0f172a', // Carbon Slate
    accentColor: '#facc15', // Electric Racing Gold
    wheelColor: '#18181b', // Matte Gunmetal
    wheelRadius: 19,
    wheelBase: 60,
    mass: 0.98,
    unlocked: true,
    cost: 0,
  },
  {
    id: 'dune_quad_400',
    name: 'Dune Beast ATV',
    subtitle: 'Heavy 4-Wheel Sand Crawler',
    category: 'Quad / ATV',
    image: '/bikes/dune_quad_400.jpg',
    speed: 7,
    acceleration: 9,
    suspension: 9,
    agility: 7,
    color: '#0284c7', // Sky blue
    secondaryColor: '#0f172a',
    accentColor: '#38bdf8',
    wheelColor: '#18181b',
    wheelRadius: 21,
    wheelBase: 64,
    mass: 1.35,
    unlocked: false,
    cost: 50000,
  },
  {
    id: 'nitro_supercross',
    name: 'Thunderbolt 450R',
    subtitle: 'Pro Competition Supercross Beast',
    category: 'Supercross',
    image: '/bikes/nitro_supercross.jpg',
    speed: 9,
    acceleration: 10,
    suspension: 9,
    agility: 9,
    color: '#16a34a', // Emerald Green
    secondaryColor: '#111827',
    accentColor: '#4ade80',
    wheelColor: '#1e293b',
    wheelRadius: 19,
    wheelBase: 60,
    mass: 0.95,
    unlocked: false,
    cost: 100000,
  },
  {
    id: 'golden_chopper',
    name: 'Sultan Desert Chopper',
    subtitle: 'High Torque Golden Cruiser',
    category: 'Custom Chopper',
    image: '/bikes/golden_chopper.jpg',
    speed: 10,
    acceleration: 8,
    suspension: 8,
    agility: 7,
    color: '#eab308', // Gold
    secondaryColor: '#451a03',
    accentColor: '#fef08a',
    wheelColor: '#020617',
    wheelRadius: 22,
    wheelBase: 70,
    mass: 1.2,
    unlocked: false,
    cost: 150000,
  },
  {
    id: 'cyber_phantom_900',
    name: 'Cyber Phantom Neo-9',
    subtitle: 'Futuristic Neon Plasma Hyperbike',
    category: 'Cyber Speeder',
    image: '/bikes/cyber_phantom_900.jpg',
    speed: 10,
    acceleration: 10,
    suspension: 9,
    agility: 10,
    color: '#a855f7', // Electric Violet
    secondaryColor: '#09090b', // Obsidian Carbon
    accentColor: '#06b6d4', // Neon Cyan
    wheelColor: '#3b0764', // Deep Violet Rim
    wheelRadius: 20,
    wheelBase: 62,
    mass: 0.92,
    unlocked: false,
    cost: 200000,
  },
  {
    id: 'desert_ghost_rr',
    name: 'Ghost Pearl RR 1000',
    subtitle: 'Ultra-Light Aerodynamic Track Monster',
    category: 'Hyper Sport',
    image: '/bikes/desert_ghost_rr.jpg',
    speed: 10,
    acceleration: 9,
    suspension: 9,
    agility: 10,
    color: '#f8fafc', // Ghost Pearl White
    secondaryColor: '#0f172a', // Stealth Slate
    accentColor: '#ef4444', // Racing Scarlet
    wheelColor: '#020617', // Matte Black
    wheelRadius: 19,
    wheelBase: 61,
    mass: 0.89,
    unlocked: false,
    cost: 250000,
  },
  {
    id: 'venom_bobber_1200',
    name: 'Venom V-Twin Bobber',
    subtitle: 'Low-Slung Custom Street Brawler',
    category: 'Muscle Bobber',
    image: '/bikes/venom_bobber_1200.jpg',
    speed: 9,
    acceleration: 10,
    suspension: 8,
    agility: 8,
    color: '#84cc16', // Toxic Lime Green
    secondaryColor: '#18181b', // Matte Charcoal
    accentColor: '#eab308', // Acid Gold
    wheelColor: '#09090b',
    wheelRadius: 22,
    wheelBase: 68,
    mass: 1.15,
    unlocked: false,
    cost: 300000,
  },
  {
    id: 'sahara_sandstorm_500',
    name: 'Dakar Mirage 550',
    subtitle: 'Long-Travel Desert Dakar Trophy Bike',
    category: 'Dakar Enduro',
    image: '/bikes/sahara_sandstorm_500.jpg',
    speed: 8,
    acceleration: 9,
    suspension: 10,
    agility: 9,
    color: '#f97316', // Blaze Dakar Orange
    secondaryColor: '#7c2d12', // Desert Rust
    accentColor: '#fef08a', // Sunbeam Yellow
    wheelColor: '#1c1917',
    wheelRadius: 20,
    wheelBase: 63,
    mass: 1.02,
    unlocked: false,
    cost: 350000,
  },
  {
    id: 'solar_flare_mach1',
    name: 'Solar Flare Mach-1',
    subtitle: 'Twin-Turbine Rocket Cruiser',
    category: 'Prototype Rocket',
    image: '/bikes/solar_flare_mach1.jpg',
    speed: 10,
    acceleration: 10,
    suspension: 9,
    agility: 9,
    color: '#dc2626', // Solar Inferno Red
    secondaryColor: '#1e1b4b', // Midnight Indigo
    accentColor: '#facc15', // Plasma Gold
    wheelColor: '#312e81',
    wheelRadius: 21,
    wheelBase: 65,
    mass: 0.94,
    unlocked: false,
    cost: 400000,
  },
  {
    id: 'titan_dune_crawler',
    name: 'Titan Sand Overlord',
    subtitle: 'All-Terrain Armored Desert Dominator',
    category: 'Armored Rover',
    image: '/bikes/titan_dune_crawler.jpg',
    speed: 8,
    acceleration: 10,
    suspension: 10,
    agility: 8,
    color: '#0d9488', // Dark Teal
    secondaryColor: '#134e4a', // Deep Forest
    accentColor: '#fbbf24', // Amber Hazard
    wheelColor: '#1e293b',
    wheelRadius: 23,
    wheelBase: 72,
    mass: 1.45,
    unlocked: false,
    cost: 450000,
  },
];
