/* ==========================================================================
   INDIAN TRAFFIC SIGN DATASET (IRC:67-2012 Standard & MV Act Specifications)
   ========================================================================== */

const INDIAN_TRAFFIC_SIGNS = [
  // --- MANDATORY / REGULATORY SIGNS ---
  {
    id: "M-01",
    name: "Stop Sign",
    category: "mandatory",
    categoryLabel: "Mandatory / Regulatory",
    ircCode: "IRC:67-2012 (Type M-01)",
    mvActSection: "Section 177 & 184 MV Act",
    fineAmount: "₹1,000 - ₹2,000",
    description: "Driver must bring vehicle to a complete stop before crossing the stop line. Mandatory right-of-way yield.",
    recommendation: "Bring vehicle to complete halt, observe both directions, proceed only when clear.",
    accuracy: 99.4,
    datasetSamples: 3840,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#ef4444" stroke="#ffffff" stroke-width="4"/>
      <text x="50" y="58" font-size="22" font-weight="900" font-family="Arial, sans-serif" fill="#ffffff" text-anchor="middle">STOP</text>
    </svg>`
  },
  {
    id: "M-02",
    name: "Give Way",
    category: "mandatory",
    categoryLabel: "Mandatory / Regulatory",
    ircCode: "IRC:67-2012 (Type M-02)",
    mvActSection: "Section 177 MV Act",
    fineAmount: "₹500 - ₹1,000",
    description: "Yield right of way to traffic proceeding on the main road before merging or entering an intersection.",
    recommendation: "Slow down, prepare to stop if necessary, yield to main road vehicles.",
    accuracy: 98.7,
    datasetSamples: 2950,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,92 8,15 92,15" fill="#ffffff" stroke="#ef4444" stroke-width="12"/>
      <polygon points="50,82 16,22 84,22" fill="#ffffff"/>
    </svg>`
  },
  {
    id: "M-03",
    name: "No Entry",
    category: "mandatory",
    categoryLabel: "Mandatory / Regulatory",
    ircCode: "IRC:67-2012 (Type M-03)",
    mvActSection: "Section 179 MV Act",
    fineAmount: "₹2,000 + License Endorsement",
    description: "Entry prohibited for all classes of vehicular traffic in this direction (One-Way violation).",
    recommendation: "Do not enter. Turn back or find alternate approved lane.",
    accuracy: 99.1,
    datasetSamples: 3120,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="44" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
      <rect x="18" y="42" width="64" height="16" fill="#ffffff" rx="3"/>
    </svg>`
  },
  {
    id: "M-04",
    name: "Speed Limit 50 km/h",
    category: "mandatory",
    categoryLabel: "Mandatory / Regulatory",
    ircCode: "IRC:67-2012 (Type M-08-50)",
    mvActSection: "Section 183 MV Act (Over-speeding)",
    fineAmount: "₹1,000 - ₹2,000 (LMV) / ₹4,000 (HMV)",
    description: "Maximum permissible vehicular speed limit is restricted to 50 km/h on this roadway segment.",
    recommendation: "Reduce vehicle speed below 50 km/h immediately to avoid speed camera penalty.",
    accuracy: 99.6,
    datasetSamples: 4210,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#ef4444" stroke-width="10"/>
      <text x="50" y="62" font-size="34" font-weight="900" font-family="Arial, sans-serif" fill="#0f172a" text-anchor="middle">50</text>
    </svg>`
  },
  {
    id: "M-05",
    name: "No U-Turn",
    category: "mandatory",
    categoryLabel: "Mandatory / Regulatory",
    ircCode: "IRC:67-2012 (Type M-12)",
    mvActSection: "Section 177 MV Act",
    fineAmount: "₹500 - ₹1,500",
    description: "U-Turn maneuver is strictly prohibited at this intersection or median break.",
    recommendation: "Continue straight to the next designated roundabout or U-turn median.",
    accuracy: 98.9,
    datasetSamples: 2780,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#ef4444" stroke-width="10"/>
      <path d="M35 70 V42 A 15 15 0 0 1 65 42 V 55" fill="none" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
      <polygon points="65,65 55,50 75,50" fill="#0f172a"/>
      <line x1="22" y1="22" x2="78" y2="78" stroke="#ef4444" stroke-width="8"/>
    </svg>`
  },
  {
    id: "M-06",
    name: "Compulsory Keep Left",
    category: "mandatory",
    categoryLabel: "Mandatory / Regulatory",
    ircCode: "IRC:67-2012 (Type M-22)",
    mvActSection: "Section 177 MV Act",
    fineAmount: "₹500",
    description: "Vehicles must strictly drive on the left lane of the divider or traffic island.",
    recommendation: "Steer to left side of median barrier.",
    accuracy: 97.8,
    datasetSamples: 1940,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="44" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/>
      <path d="M68 32 L35 65 M35 65 H55 M35 65 V45" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },

  // --- CAUTIONARY / WARNING SIGNS ---
  {
    id: "C-01",
    name: "School Ahead",
    category: "cautionary",
    categoryLabel: "Cautionary / Warning",
    ircCode: "IRC:67-2012 (Type C-34)",
    mvActSection: "Safety Advisory (School Zone)",
    fineAmount: "₹1,000 (Speeding in School Zone)",
    description: "School premises ahead. High probability of children crossing roadway unexpectedly.",
    recommendation: "Reduce speed to 25 km/h, maintain high alertness, yield to pedestrians.",
    accuracy: 99.2,
    datasetSamples: 3600,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,8 94,88 6,88" fill="#ffffff" stroke="#ef4444" stroke-width="9"/>
      <!-- Simplified School Child Icon -->
      <circle cx="42" cy="40" r="5" fill="#0f172a"/>
      <path d="M42 45 L42 62 M42 50 L34 58 M42 50 L50 58 M42 62 L36 76 M42 62 L48 76" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
      <circle cx="60" cy="48" r="4" fill="#0f172a"/>
      <path d="M60 52 L60 66 M60 56 L54 62 M60 56 L66 62 M60 66 L55 76 M60 66 L65 76" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "C-02",
    name: "Narrow Bridge Ahead",
    category: "cautionary",
    categoryLabel: "Cautionary / Warning",
    ircCode: "IRC:67-2012 (Type C-18)",
    mvActSection: "Safety Advisory",
    fineAmount: "N/A (Caution Zone)",
    description: "Road width narrows significantly ahead to cross a river/gorge bridge structure.",
    recommendation: "Check oncoming traffic, do not attempt overtaking, proceed single file.",
    accuracy: 98.4,
    datasetSamples: 2310,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,8 94,88 6,88" fill="#ffffff" stroke="#ef4444" stroke-width="9"/>
      <path d="M35 78 V58 L45 42 V28 M65 78 V58 L55 42 V28" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "C-03",
    name: "Pedestrian Crossing",
    category: "cautionary",
    categoryLabel: "Cautionary / Warning",
    ircCode: "IRC:67-2012 (Type C-33)",
    mvActSection: "Section 177 MV Act",
    fineAmount: "₹500 - ₹1,000",
    description: "Zebra pedestrian crossing location ahead.",
    recommendation: "Slow down and prepare to yield to pedestrians on crosswalk.",
    accuracy: 99.0,
    datasetSamples: 3910,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,8 94,88 6,88" fill="#ffffff" stroke="#ef4444" stroke-width="9"/>
      <circle cx="50" cy="38" r="5" fill="#0f172a"/>
      <path d="M50 43 L45 60 L38 76 M45 60 L58 55 M50 43 L60 52 L68 48" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
      <line x1="28" y1="78" x2="72" y2="78" stroke="#0f172a" stroke-width="4"/>
    </svg>`
  },
  {
    id: "C-04",
    name: "Sharp Right Hairpin Curve",
    category: "cautionary",
    categoryLabel: "Cautionary / Warning",
    ircCode: "IRC:67-2012 (Type C-03)",
    mvActSection: "Safety Advisory (Ghat Road)",
    fineAmount: "N/A",
    description: "Sharp right turn curve in mountainous/hilly terrain.",
    recommendation: "Downshift to low gear, sound horn before entering blind curve.",
    accuracy: 98.1,
    datasetSamples: 2150,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,8 94,88 6,88" fill="#ffffff" stroke="#ef4444" stroke-width="9"/>
      <path d="M40 76 V50 A 12 12 0 0 1 64 50 V 38" fill="none" stroke="#0f172a" stroke-width="7" stroke-linecap="round"/>
      <polygon points="64,28 54,42 74,42" fill="#0f172a"/>
    </svg>`
  },

  // --- INFORMATIONAL SIGNS ---
  {
    id: "I-01",
    name: "Hospital Zone",
    category: "informational",
    categoryLabel: "Informational",
    ircCode: "IRC:67-2012 (Type I-01)",
    mvActSection: "No Honking Zone",
    fineAmount: "₹1,000 (Unnecessary Honking)",
    description: "Medical hospital facilities nearby. Silence zone enforcement.",
    recommendation: "Do not use horn. Drive quietly and avoid engine revving.",
    accuracy: 99.5,
    datasetSamples: 2980,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="8" y="8" width="84" height="84" rx="12" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/>
      <rect x="25" y="25" width="50" height="50" rx="8" fill="#ffffff"/>
      <path d="M50 32 V68 M32 50 H68" fill="none" stroke="#ef4444" stroke-width="12" stroke-linecap="square"/>
    </svg>`
  },
  {
    id: "I-02",
    name: "Fuel Station (24x7)",
    category: "informational",
    categoryLabel: "Informational",
    ircCode: "IRC:67-2012 (Type I-04)",
    mvActSection: "Public Utility",
    fineAmount: "N/A",
    description: "Fuel dispensing station located 500m ahead on highway.",
    recommendation: "Pull into left service lane for refueling.",
    accuracy: 98.8,
    datasetSamples: 2450,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="8" y="8" width="84" height="84" rx="12" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/>
      <rect x="30" y="30" width="28" height="42" rx="4" fill="#ffffff"/>
      <path d="M58 40 H68 V62 C 68 68 62 70 62 70" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
      <rect x="36" y="36" width="16" height="14" fill="#3b82f6"/>
    </svg>`
  }
];

// Helper search function
function getSignsByCategory(cat) {
  if (!cat || cat === 'all') return INDIAN_TRAFFIC_SIGNS;
  return INDIAN_TRAFFIC_SIGNS.filter(s => s.category === cat);
}

function findSignById(id) {
  return INDIAN_TRAFFIC_SIGNS.find(s => s.id === id);
}
