/**
 * Vehicle designs, SVG generators, and visual paint customization presets.
 */
const CAR_MODELS = [
  {
    id: "gt-hyper",
    name: "Apex Hyper GT",
    tagline: "Aerodynamic track monster with aggressive twin downforce wings",
    baseSpeedBonus: "High Top-End",
    bodyClass: "car-gt"
  },
  {
    id: "cyber-dart",
    name: "Cyber Dart 2099",
    tagline: "Angular wedge chassis inspired by neon retro-future concepts",
    baseSpeedBonus: "Instant Acceleration",
    bodyClass: "car-wedge"
  },
  {
    id: "phantom-stealth",
    name: "Midnight Phantom",
    tagline: "Low-profile stealth silhouette engineered for maximum laminar flow",
    baseSpeedBonus: "Smooth Cadence",
    bodyClass: "car-stealth"
  },
  {
    id: "retro-rod",
    name: "Thunder Turbo",
    tagline: "Classic muscular lines fused with twin-turbocharged quad exhausts",
    baseSpeedBonus: "Nitro Mastery",
    bodyClass: "car-muscle"
  }
];

const CAR_PAINTS = [
  { id: "cyan", name: "Neon Cyan", primary: "#00f0ff", secondary: "#0077aa", glow: "rgba(0, 240, 255, 0.6)" },
  { id: "magenta", name: "Cyber Magenta", primary: "#ff007f", secondary: "#99004d", glow: "rgba(255, 0, 127, 0.6)" },
  { id: "lime", name: "Toxic Lime", primary: "#39ff14", secondary: "#1e820a", glow: "rgba(57, 255, 20, 0.6)" },
  { id: "gold", name: "Solar Gold", primary: "#ffb703", secondary: "#b58000", glow: "rgba(255, 183, 3, 0.6)" },
  { id: "purple", name: "Synth Violet", primary: "#a855f7", secondary: "#6b21a8", glow: "rgba(168, 85, 247, 0.6)" },
  { id: "white", name: "Ghost Frost", primary: "#f8fafc", secondary: "#94a3b8", glow: "rgba(248, 250, 252, 0.5)" },
  { id: "orange", name: "Inferno Orange", primary: "#ff5400", secondary: "#a83200", glow: "rgba(255, 84, 0, 0.6)" }
];

/**
 * Returns a high-detail inline SVG string of a sleek top-down racer.
 */
function generateCarSvg(modelId, paintConfig, options = {}) {
  const primary = paintConfig.primary || "#00f0ff";
  const secondary = paintConfig.secondary || "#0077aa";
  const glow = paintConfig.glow || "rgba(0,240,255,0.6)";
  const isGhost = options.isGhost || false;

  const ghostOpacity = isGhost ? "0.45" : "1";
  const ghostFilter = isGhost ? "filter: drop-shadow(0 0 8px #a855f7);" : "";

  // Dynamic SVG based on model chassis
  if (modelId === "cyber-dart") {
    return `
      <svg class="car-svg" viewBox="0 0 100 48" style="opacity: ${ghostOpacity}; ${ghostFilter}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cyberBody_${paintConfig.id}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${secondary}"/>
            <stop offset="60%" stop-color="${primary}"/>
            <stop offset="100%" stop-color="#ffffff"/>
          </linearGradient>
          <linearGradient id="cyberGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#111827"/>
            <stop offset="50%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#38bdf8"/>
          </linearGradient>
        </defs>
        <!-- Wheels -->
        <rect x="18" y="2" width="16" height="6" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <rect x="70" y="2" width="16" height="6" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <rect x="18" y="40" width="16" height="6" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <rect x="70" y="40" width="16" height="6" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1"/>

        <!-- Chassis Shadow -->
        <polygon points="10,24 22,9 85,12 96,24 85,36 22,39" fill="rgba(0,0,0,0.6)"/>

        <!-- Main Sharp Wedge Body -->
        <polygon points="8,24 20,8 86,11 98,24 86,37 20,40" fill="url(#cyberBody_${paintConfig.id})" stroke="${primary}" stroke-width="1.2"/>

        <!-- Cyber Angular Cockpit -->
        <polygon points="34,24 45,15 72,17 78,24 72,31 45,33" fill="url(#cyberGlass)" stroke="#64748b" stroke-width="0.8"/>
        <!-- Cockpit reflection stripe -->
        <line x1="50" y1="18" x2="70" y2="22" stroke="rgba(255,255,255,0.7)" stroke-width="1.2"/>

        <!-- Side Vent Aeroblades -->
        <polygon points="26,12 36,10 38,14 28,15" fill="${secondary}"/>
        <polygon points="26,36 36,38 38,34 28,33" fill="${secondary}"/>

        <!-- Front LED Light Bar -->
        <line x1="93" y1="18" x2="98" y2="24" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="93" y1="30" x2="98" y2="24" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>

        <!-- Rear Twin Jet Exhaust Pipes -->
        <rect x="6" y="16" width="4" height="4" rx="1" fill="#1e293b" stroke="#ef4444" stroke-width="0.8"/>
        <rect x="6" y="28" width="4" height="4" rx="1" fill="#1e293b" stroke="#ef4444" stroke-width="0.8"/>
        <!-- Exhaust glow -->
        <circle cx="8" cy="18" r="2" fill="#ff4500"/>
        <circle cx="8" cy="30" r="2" fill="#ff4500"/>
      </svg>
    `;
  }

  if (modelId === "retro-rod") {
    return `
      <svg class="car-svg" viewBox="0 0 100 48" style="opacity: ${ghostOpacity}; ${ghostFilter}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rodBody_${paintConfig.id}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0a0a0a"/>
            <stop offset="40%" stop-color="${secondary}"/>
            <stop offset="90%" stop-color="${primary}"/>
          </linearGradient>
        </defs>
        <!-- Wide Tread Tires -->
        <rect x="14" y="1" width="18" height="7" rx="2" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
        <rect x="68" y="2" width="16" height="6" rx="2" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
        <rect x="14" y="40" width="18" height="7" rx="2" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
        <rect x="68" y="40" width="16" height="6" rx="2" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>

        <!-- Muscular Curved Body -->
        <rect x="10" y="8" width="85" height="32" rx="10" fill="url(#rodBody_${paintConfig.id})" stroke="${primary}" stroke-width="1.2"/>

        <!-- Twin Racing Stripes -->
        <rect x="10" y="21" width="85" height="2.5" fill="#ffffff" opacity="0.8"/>
        <rect x="10" y="25" width="85" height="2.5" fill="#ffffff" opacity="0.8"/>

        <!-- Curved Windshield -->
        <ellipse cx="56" cy="24" rx="14" ry="9" fill="#0f172a" stroke="#475569" stroke-width="1"/>
        <ellipse cx="54" cy="24" rx="9" ry="6" fill="#1e293b"/>

        <!-- Big Supercharger Scoop on hood -->
        <rect x="74" y="20" width="10" height="8" rx="2" fill="#d4d4d8" stroke="#71717a" stroke-width="0.8"/>
        <rect x="80" y="22" width="3" height="4" fill="#000000"/>

        <!-- Headlights -->
        <circle cx="94" cy="14" r="3" fill="#fef08a" stroke="#eab308" stroke-width="0.8"/>
        <circle cx="94" cy="34" r="3" fill="#fef08a" stroke="#eab308" stroke-width="0.8"/>

        <!-- Rear Heavy Spoiler -->
        <rect x="7" y="6" width="6" height="36" rx="2" fill="#27272a" stroke="${primary}" stroke-width="1"/>
      </svg>
    `;
  }

  if (modelId === "phantom-stealth") {
    return `
      <svg class="car-svg" viewBox="0 0 100 48" style="opacity: ${ghostOpacity}; ${ghostFilter}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="stealthBody_${paintConfig.id}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#05050a"/>
            <stop offset="60%" stop-color="${secondary}"/>
            <stop offset="100%" stop-color="${primary}"/>
          </linearGradient>
        </defs>
        <!-- Sleek Inset Wheels -->
        <rect x="16" y="3" width="16" height="5" rx="2" fill="#09090b" stroke="#27272a" stroke-width="1"/>
        <rect x="68" y="3" width="16" height="5" rx="2" fill="#09090b" stroke="#27272a" stroke-width="1"/>
        <rect x="16" y="40" width="16" height="5" rx="2" fill="#09090b" stroke="#27272a" stroke-width="1"/>
        <rect x="68" y="40" width="16" height="5" rx="2" fill="#09090b" stroke="#27272a" stroke-width="1"/>

        <!-- Stealth Aerodynamic Hull -->
        <path d="M 6 24 C 8 12, 24 9, 50 10 C 76 11, 92 18, 97 24 C 92 30, 76 37, 50 38 C 24 39, 8 36, 6 24 Z" 
              fill="url(#stealthBody_${paintConfig.id})" stroke="${primary}" stroke-width="1.2"/>

        <!-- Stealth Canopy -->
        <ellipse cx="50" cy="24" rx="18" ry="7" fill="#09090b" stroke="#38bdf8" stroke-width="0.8"/>
        <!-- Visor Neon Glow -->
        <path d="M 40 24 Q 50 20 62 24" stroke="${primary}" stroke-width="1.5" fill="none"/>

        <!-- Front Laser Projectors -->
        <line x1="94" y1="19" x2="97" y2="21" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <line x1="94" y1="29" x2="97" y2="27" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>

        <!-- Rear Diffusers -->
        <rect x="4" y="18" width="4" height="12" rx="1" fill="#18181b" stroke="#f43f5e" stroke-width="0.8"/>
      </svg>
    `;
  }

  // Default: "gt-hyper" (Flagship Le Mans / GT3 Style Racer)
  return `
    <svg class="car-svg" viewBox="0 0 100 48" style="opacity: ${ghostOpacity}; ${ghostFilter}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gtBody_${paintConfig.id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${secondary}"/>
          <stop offset="50%" stop-color="${primary}"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
        <linearGradient id="canopyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#090d16"/>
          <stop offset="70%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
      </defs>
      <!-- Wheels with Calipers -->
      <rect x="18" y="2" width="16" height="6" rx="2" fill="#09090b" stroke="#52525b" stroke-width="1"/>
      <rect x="68" y="2" width="16" height="6" rx="2" fill="#09090b" stroke="#52525b" stroke-width="1"/>
      <rect x="18" y="40" width="16" height="6" rx="2" fill="#09090b" stroke="#52525b" stroke-width="1"/>
      <rect x="68" y="40" width="16" height="6" rx="2" fill="#09090b" stroke="#52525b" stroke-width="1"/>

      <!-- Widebody Main Shell -->
      <path d="M 8 24 
               C 10 12, 20 8, 35 9 
               C 50 10, 68 8, 86 12 
               C 96 15, 98 22, 98 24 
               C 98 26, 96 33, 86 36 
               C 68 40, 50 38, 35 39 
               C 20 40, 10 36, 8 24 Z" 
            fill="url(#gtBody_${paintConfig.id})" stroke="${primary}" stroke-width="1.3"/>

      <!-- Central Cockpit Bubble -->
      <path d="M 32 24 C 36 15, 64 15, 72 24 C 64 33, 36 33, 32 24 Z" fill="url(#canopyGrad)" stroke="#475569" stroke-width="1"/>
      <line x1="42" y1="18" x2="65" y2="22" stroke="rgba(255,255,255,0.7)" stroke-width="1"/>

      <!-- Engine Hood Louvers / Heat Vents -->
      <line x1="77" y1="19" x2="84" y2="19" stroke="#09090b" stroke-width="1.2"/>
      <line x1="77" y1="24" x2="85" y2="24" stroke="#09090b" stroke-width="1.2"/>
      <line x1="77" y1="29" x2="84" y2="29" stroke="#09090b" stroke-width="1.2"/>

      <!-- Twin Carbon GT Rear Wing -->
      <rect x="5" y="4" width="7" height="40" rx="2" fill="#18181b" stroke="${primary}" stroke-width="1"/>
      <line x1="9" y1="4" x2="9" y2="44" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/>

      <!-- Front Dual Angled LED Blades -->
      <polygon points="90,14 96,16 93,19 88,17" fill="#ffffff"/>
      <polygon points="90,34 96,32 93,29 88,31" fill="#ffffff"/>

      <!-- Exhaust Ports -->
      <circle cx="6" cy="18" r="2.2" fill="#18181b" stroke="#f43f5e" stroke-width="0.8"/>
      <circle cx="6" cy="30" r="2.2" fill="#18181b" stroke="#f43f5e" stroke-width="0.8"/>
    </svg>
  `;
}

