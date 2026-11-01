/**
 * Every word on the site, taken from the REUDE product brochure and the
 * REUDE Technologies LinkedIn page. Edit copy here, not in the components.
 */

export const brand = {
  name: 'REUDE Technologies',
  short: 'REUDE',
  tagline: 'One Drone. Endless Possibilities.',
  sub: '1 drone - multiple functions, revolutionizing farming, defense, and beyond.',
  industry: 'Aviation and Aerospace Component Manufacturing · Chennai, Tamil Nadu',
  positioning: 'Next-Gen Industrial UAV — Advance Technology for Superior Drone Solutions',
  address: 'No.1, Nehru Street, Vasantham Nagar, Avadi, Poonamallee, Tiruvallur – 600071, Tamil Nadu, India',
  site: 'reude.in',
  siteUrl: 'https://reude.in',
  email: 'ceo_ira@reude.tech',
  businessEmail: 'business@reude.tech',
  phone: '+91 99621 85898',
  whatsapp: '919962185898',
  gps: '13.1067°N 80.0977°E',
};

/** Verify these handles before launch — they are the safest links, not confirmed profile URLs. */
export const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/search/results/companies/?keywords=REUDE%20Technologies' },
  { label: 'Instagram', href: 'https://www.instagram.com/reude.in/' },
  { label: 'YouTube', href: 'https://www.youtube.com/results?search_query=REUDE+Technologies' },
  { label: 'X', href: 'https://x.com/search?q=REUDE%20Technologies' },
];

export const nav = [
  { label: 'Home', id: 'home' },
  { label: 'Products', id: 'products' },
  { label: 'Industries', id: 'industries' },
  { label: 'Technology', id: 'technology' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

export const marquee = ['Logistics', 'Inspection', 'Defense', 'Agriculture', 'Renewable Energy', 'Testing'];

export type Stat = { to: number; prefix?: string; suffix?: string; unit?: string; label: string };
export const stats: Stat[] = [
  { to: 50, suffix: 'K+', label: 'Operation cycles' },
  { to: 10, suffix: 'K', label: 'Landings' },
  { to: 85, suffix: '%', label: 'Inspection accuracy' },
  { to: 200, suffix: 'ms', label: 'Latency' },
  { to: 50, prefix: '5–', unit: 'KG', label: 'Payload range' },
  { to: 30, prefix: '≤', unit: 'SEC', label: 'Payload swap' },
];

export type Feature = { value: string; label: string };
export type Product = {
  id: string;
  division: string;
  divisionName: string;
  name: string;
  kicker: string;
  tagline: string;
  desc: string;
  image: string;
  fit: 'cover' | 'contain';
  features: Feature[];
  chips: string[];
  useCase: string;
};

export const products: Product[] = [
  {
    id: 'stingraey-logi',
    division: '01',
    divisionName: 'REUDE Logistics',
    name: 'Stingraey Logi™',
    kicker: 'Autonomous Logistics System',
    tagline: 'Intelligent Aerial Logistics Platform — deliver Beyond Boundaries.',
    desc: 'A dual-patented, high-payload autonomous drone enabling rapid payload swapping, precision operations, and reliable performance across logistics, agriculture, and industrial applications — even in extreme conditions.',
    image: '/products/stingraey-logi.webp',
    fit: 'cover',
    features: [
      { value: '5–50 KG', label: 'Payload range' },
      { value: '≤ 30 SEC', label: 'Payload swap time' },
      { value: '360°', label: 'Anti-collision' },
      { value: 'CABLE-LESS', label: 'Operations' },
      { value: '6', label: 'Docking arms' },
      { value: '10 KG', label: 'Std. payload' },
    ],
    chips: ['Dual-patented', '5–50 KG', '360° anti-collision'],
    useCase: 'Logistics & delivery',
  },
  {
    id: 'gaps',
    division: '01',
    divisionName: 'REUDE Logistics',
    name: 'GAPs System',
    kicker: 'Grabber Arm Payload Secure',
    tagline: 'Autonomous payload handling, no hooks, ropes or winches.',
    desc: 'An in-house developed, patented robotic payload handling mechanism engineered for secure locking, lifting, transportation, and autonomous release of payloads up to 50 kg. Safer, faster, and fully automated.',
    image: '/products/gaps.webp',
    fit: 'cover',
    features: [
      { value: 'UP TO 50 KG', label: 'Secure payloads' },
      { value: 'PATENTED', label: 'Robotic mechanism' },
      { value: 'AUTO RELEASE', label: 'Autonomous drop' },
      { value: '10K', label: 'Landings capable' },
      { value: '50K+', label: 'Operation cycles' },
      { value: 'NO WINCH', label: 'Replaces hooks & ropes' },
    ],
    chips: ['Patented', 'Up to 50 KG', 'Autonomous release'],
    useCase: 'Logistics & delivery',
  },
  {
    id: 'stingraey-inspect',
    division: '02',
    divisionName: 'REUDE Inspect',
    name: 'Stingraey Inspect™',
    kicker: 'Industrial Inspection UAV',
    tagline: 'High-resolution RGB, thermal and sensor data with exceptional precision.',
    desc: "A high-performance industrial inspection drone built on REUDE's modular UAV platform. It flies autonomous inspection missions and plugs straight into CompliQ for AI-powered defect detection and predictive maintenance.",
    image: '/products/stingraey-inspect.webp',
    fit: 'cover',
    features: [
      { value: 'RGB + THERMAL', label: 'Multi-sensor payload' },
      { value: 'AUTONOMOUS', label: 'Inspection missions' },
      { value: 'MODULAR', label: 'UAV platform' },
      { value: 'WIND BLADES', label: 'Turbine inspection' },
      { value: 'SOLAR', label: 'Panel inspection' },
      { value: 'POWER LINES', label: 'Utility inspection' },
    ],
    chips: ['RGB + Thermal', 'Autonomous', 'CompliQ-ready'],
    useCase: 'Inspection (wind, solar, power lines)',
  },
  {
    id: 'compliq',
    division: '02',
    divisionName: 'REUDE Inspect',
    name: 'CompliQ AI',
    kicker: 'AI-Powered Inspection Intelligence',
    tagline: 'Drone imagery, thermal scans and telemetry become maintenance intelligence.',
    desc: 'Actionable maintenance intelligence through AI analytics, interactive visualization and enterprise reporting — for renewable energy operators, utilities and infrastructure owners. Faster inspections, better decisions, predictive maintenance at scale.',
    image: '/products/compliq.webp',
    fit: 'contain',
    features: [
      { value: 'AI', label: 'Defect detection' },
      { value: 'CLOUD', label: 'Asset management' },
      { value: 'AI COPILOT', label: 'Natural-language queries' },
      { value: 'PDF', label: 'Report format' },
      { value: '1000+', label: 'Annotated images' },
      { value: '85% · 200 ms', label: 'Accuracy · latency' },
    ],
    chips: ['AI defect detection', 'AI Copilot', 'PDF reports'],
    useCase: 'Inspection (wind, solar, power lines)',
  },
  {
    id: 'dynox',
    division: '03',
    divisionName: 'REUDE Testing',
    name: 'DynoX',
    kicker: 'UAV Propulsion Testing System',
    tagline: 'Precision propulsion testing platform for UAV & eVTOL development.',
    desc: 'DynoX turns the traditional thrust stand into an intelligent, AI-powered testing platform. It detects and eliminates measurement errors in real time — clean, high-fidelity data instantly, with no post-test filtering.',
    image: '/products/dynox.webp',
    fit: 'contain',
    features: [
      { value: 'THRUST · TORQUE', label: 'Real-time' },
      { value: 'RPM', label: 'Real-time' },
      { value: 'V · A · TEMP', label: 'Real-time' },
      { value: 'VIBRATION', label: 'Real-time' },
      { value: 'AI', label: 'Anomaly detection' },
      { value: 'ZERO', label: 'Post-test filtering' },
    ],
    chips: ['UAV & eVTOL', 'Real-time data', 'AI anomaly detection'],
    useCase: 'Propulsion testing (DynoX / RotriX)',
  },
  {
    id: 'rotrix',
    division: '03',
    divisionName: 'REUDE Testing',
    name: 'RotriX',
    kicker: "India's Indigenous Motor Testing Software",
    tagline: 'AI-powered motor testing and data acquisition in one system.',
    desc: 'An advanced motor testing and data-acquisition platform that brings control, monitoring and analytics into a single intelligent system — built for propulsion engineers, UAV developers and R&D teams.',
    image: '/products/rotrix.webp',
    fit: 'contain',
    features: [
      { value: '7', label: 'Variants · RTS Micro – Ultra' },
      { value: 'LIVE', label: 'Interactive dashboard' },
      { value: 'AI ENABLED', label: 'Decision analytics' },
      { value: 'TREND', label: 'Analysis' },
      { value: 'MODULAR', label: 'Plug-and-play' },
      { value: 'PDF & CSV', label: 'Reports' },
    ],
    chips: ['7 variants', 'Live dashboard', 'PDF & CSV'],
    useCase: 'Propulsion testing (DynoX / RotriX)',
  },
];

export const story = {
  eyebrow: 'Technology',
  heading: 'From takeoff to report. Every blade, scanned.',
  note: 'Illustrative visualisation of a REUDE Inspect mission.',
  steps: [
    { n: '01', title: 'Takeoff', mode: 'TAKEOFF', body: 'Stingraey Inspect lifts off and flies an autonomous route to the turbine. The rotor is parked for the mission.' },
    { n: '02', title: 'Scan Blade (Thermal)', mode: 'THERMAL SCAN', body: 'RGB + thermal sensors sweep the blade, capturing high-resolution imagery and heat signatures in one pass.' },
    { n: '03', title: 'AI Detects Crack', mode: 'AI DETECTION', body: 'CompliQ flags the anomaly with a red box — a defect a person on the ground would never see.' },
    { n: '04', title: 'Report Generated in CompliQ', mode: 'REPORT READY', body: 'Imagery, thermal and telemetry become a maintenance report, ready to export as PDF.' },
  ],
};

export const industries = [
  { title: 'Farming', sub: 'Crop Spraying', body: 'Autonomous, even coverage across large fields with swappable payloads.' },
  { title: 'Defense', sub: 'Border Surveillance', body: 'Long-endurance surveillance and secure payload handling in extreme conditions.' },
  { title: 'Logistics', sub: 'Medical Delivery', body: 'Fast, cable-less delivery of 5–50 KG payloads with 30-second payload swaps.' },
  { title: 'Renewable Energy', sub: 'Windmill + Solar Inspection', body: 'RGB + thermal inspection of turbine blades and solar arrays, analysed by AI.' },
  { title: 'Infrastructure', sub: 'Bridge, Powerline', body: 'Close-up inspection of assets that are slow, costly or dangerous to reach.' },
  { title: 'Industrial', sub: 'Factory', body: 'Repeatable site inspection and internal logistics for industrial operations.' },
];

export const why = [
  { title: 'Dual Patented', body: 'Core payload and handling technology protected by two patents.' },
  { title: 'Made in India', body: 'Designed and built in Chennai, Tamil Nadu — including RotriX, India\'s indigenous motor-testing software.' },
  { title: 'Autonomous', body: 'Autonomous missions, autonomous payload release, autonomous inspection.' },
  { title: 'Cable-Less', body: 'No hooks, ropes or winches — cable-less operations with 360° anti-collision.' },
  { title: 'AI-Powered', body: 'CompliQ detects defects, DynoX flags anomalies and an AI Copilot answers in plain language.' },
  { title: 'Extreme Conditions', body: 'Built to keep working across logistics, agriculture and industrial environments.' },
];

export const supporters = [
  { name: 'Stanford Seed', logo: '/clients/stanford-seed.webp', w: 200 },
  { name: 'StartupTN', logo: '/clients/startup-tn.webp', w: 170 },
  { name: 'Dassault Systèmes', logo: '/clients/dassault.webp', w: 170 },
  { name: 'Startup India', logo: '/clients/startup-india.webp', w: 150 },
  { name: 'DST NIDHI', logo: '/clients/dst-nidhi.webp', w: 150 },
];

export const clients = [
  { name: 'Atomberg', logo: '/clients/atomberg-w.webp', w: 150 },
  { name: 'DRDO', logo: '/clients/drdo.webp', w: 76 },
  { name: 'Dustrac', logo: '/clients/dustrac-w.webp', w: 150 },
  { name: 'Tobitek', logo: '/clients/tobitek.webp', w: 80 },
  { name: 'Amity University', logo: '/clients/amity-w.webp', w: 170 },
  { name: 'Aban', logo: '/clients/aban-w.webp', w: 100 },
  { name: 'Tihan', logo: '/clients/tihan-w.webp', w: 150 },
];

export const useCases = [
  'Logistics & delivery',
  'Inspection (wind, solar, power lines)',
  'Defense & surveillance',
  'Agriculture',
  'Propulsion testing (DynoX / RotriX)',
  'Something else',
];
