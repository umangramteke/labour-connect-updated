const pptxgen = require('pptxgenjs');
const path = require('path');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Prince Bansal, Pankaj Bharsakle, Umang Ramteke, Ayush Dudhe';
pres.company = 'MIT Academy of Engineering, Alandi, Pune';
pres.title = 'Labour Connect — Web Technology Project Presentation';

// Color Palette
const COLORS = {
  bgDark: '0F172A',     // Slate 900
  bgCardDark: '1E293B', // Slate 800
  bgLight: 'F8FAFC',    // Slate 50
  cardBorder: 'E2E8F0', // Slate 200
  teal: '0D9488',       // Teal 600
  tealLight: 'CCFBF1',  // Teal 100
  cyan: '06B6D4',       // Cyan 500
  emerald: '059669',    // Emerald 600
  textDark: '0F172A',   // Slate 900
  textMuted: '64748B',  // Slate 500
  textLight: 'F1F5F9',  // Slate 100
  white: 'FFFFFF',
  accentBlue: '2563EB'
};

// Helper: Header for Light Slides
function addLightHeader(slide, category, title) {
  // Category Pill
  slide.addText(category.toUpperCase(), {
    x: 0.8, y: 0.4, w: 6.0, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.teal, fontFace: 'Calibri'
  });
  // Title
  slide.addText(title, {
    x: 0.8, y: 0.65, w: 11.5, h: 0.55,
    fontSize: 22, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  // Divider
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.25, w: 11.7, h: 0.02,
    fill: { color: COLORS.cardBorder }, line: { color: COLORS.cardBorder, width: 0 }
  });
}

// Helper: Footer
function addFooter(slide, isDark = false) {
  slide.addText('Labour Connect | MIT Academy of Engineering | Web Technology (2310362L)', {
    x: 0.8, y: 7.1, w: 9.0, h: 0.3,
    fontSize: 9, color: isDark ? '64748B' : '94A3B8', fontFace: 'Calibri'
  });
  slide.addText('MERN Stack Platform', {
    x: 10.5, y: 7.1, w: 2.0, h: 0.3,
    fontSize: 9, bold: true, align: 'right', color: isDark ? COLORS.cyan : COLORS.teal, fontFace: 'Calibri'
  });
}

// ==========================================
// SLIDE 1: TITLE SLIDE (Dark)
// ==========================================
const s1 = pres.addSlide();
s1.background = { color: COLORS.bgDark };

// Badge
s1.addText('MIT ACADEMY OF ENGINEERING, PUNE  •  DEPARTMENT OF COMPUTER ENGINEERING (SOFTWARE ENGINEERING)', {
  x: 0.8, y: 0.55, w: 11.5, h: 0.3,
  fontSize: 10, bold: true, color: COLORS.cyan, fontFace: 'Calibri'
});
s1.addText('THIRD YEAR B.TECH (2026–2027)  •  WEB TECHNOLOGY (2310362L)  •  GUIDE & COORDINATOR: MRS. NITA GORE', {
  x: 0.8, y: 0.85, w: 11.5, h: 0.3,
  fontSize: 9.5, color: '94A3B8', fontFace: 'Calibri'
});

// Title & Subtitle
s1.addText('LABOUR CONNECT', {
  x: 0.8, y: 1.4, w: 11.5, h: 0.9,
  fontSize: 42, bold: true, color: COLORS.white, fontFace: 'Arial'
});
s1.addText('A Modern Digital Platform for Blue-Collar Skilled Employment & On-Demand Hyperlocal Trade Services', {
  x: 0.8, y: 2.35, w: 11.5, h: 0.55,
  fontSize: 15, color: COLORS.tealLight, fontFace: 'Calibri'
});

// Architecture Pill Box
s1.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 3.1, w: 11.7, h: 0.65,
  fill: { color: COLORS.bgCardDark }, line: { color: COLORS.teal, width: 1.5 }, rectRadius: 0.1
});
s1.addText('Full-Stack MERN Architecture: MongoDB Atlas  •  Express.js  •  React 18 (Vite)  •  Node.js  •  RESTful APIs  •  Vercel & Render', {
  x: 1.0, y: 3.25, w: 11.3, h: 0.35,
  fontSize: 11.5, bold: true, color: COLORS.cyan, fontFace: 'Calibri', align: 'center'
});

// Team Members Box (4 Members)
const teamData = [
  { name: 'Prince Bansal', prn: '202401100064', roll: 'TY (A3-63)' },
  { name: 'Pankaj Bharsakle', prn: '202401100067', roll: 'TY (A3-65)' },
  { name: 'Umang Ramteke', prn: '202401100068', roll: 'TY (A3-66)' },
  { name: 'Ayush Dudhe', prn: '202401100073', roll: 'TY (A3-70)' }
];

teamData.forEach((m, idx) => {
  const xPos = 0.8 + idx * 2.95;
  s1.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 4.15, w: 2.8, h: 1.7,
    fill: { color: COLORS.bgCardDark }, line: { color: '334155', width: 1 }, rectRadius: 0.1
  });
  s1.addText(m.name, {
    x: xPos + 0.15, y: 4.3, w: 2.5, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.white, fontFace: 'Arial'
  });
  s1.addText(`PRN: ${m.prn}\nClass: ${m.roll}\nThird Year B.Tech (SE)\nMIT AOE (2026–2027)`, {
    x: xPos + 0.15, y: 4.75, w: 2.5, h: 0.95,
    fontSize: 9.5, color: '94A3B8', fontFace: 'Calibri'
  });
});

// Live URLs Box
s1.addText('Live Web App: https://labour-connect-updated.vercel.app/   |   API: https://labour-connect-updated.onrender.com/api/v1', {
  x: 0.8, y: 6.2, w: 11.7, h: 0.4,
  fontSize: 10, color: COLORS.emerald, fontFace: 'Consolas', align: 'center'
});
addFooter(s1, true);

// ==========================================
// SLIDE 2: WT SYLLABUS & COURSE OUTCOMES MAPPING
// ==========================================
const s2 = pres.addSlide();
s2.background = { color: COLORS.bgLight };
addLightHeader(s2, 'Academic Syllabus Mapping', 'Alignment with Web Technology Course Outcomes (2310362L)');

const coData = [
  {
    co: '2310362L.CO.1 [L3]',
    title: 'Web Fundamentals & Layouts',
    practical: 'Practical 1 & 2',
    desc: 'Construct responsive layouts using HTML5, modern CSS3, Tailwind CSS, Flexbox/Grid, and JavaScript validation for seamless mobile and desktop accessibility.'
  },
  {
    co: '2310362L.CO.2 [L3]',
    title: 'Frontend Development (ReactJS)',
    practical: 'Practical 3',
    desc: 'Develop a Single Page Application (SPA) using React 18, Vite build tooling, React Router 6, component state management, interactive modals, and Axios.'
  },
  {
    co: '2310362L.CO.3 [L3]',
    title: 'Backend Runtime & Server (Node/Express)',
    practical: 'Practical 4 & 5',
    desc: 'Construct and configure an asynchronous backend server using Node.js runtime and Express.js framework with modular routing, JWT auth, and RBAC middleware.'
  },
  {
    co: '2310362L.CO.4 [L3]',
    title: 'RESTful API & NoSQL Database',
    practical: 'Practical 6 & 7',
    desc: 'Design 48 RESTful endpoints for CRUD operations, connect to MongoDB Atlas NoSQL document store with Mongoose schemas, and deploy to live cloud hosts.'
  }
];

coData.forEach((item, idx) => {
  const xPos = 0.8 + (idx % 2) * 6.0;
  const yPos = 1.5 + Math.floor(idx / 2) * 2.6;

  s2.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: yPos, w: 5.7, h: 2.4,
    fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.1
  });

  s2.addText(item.co + '  •  ' + item.practical, {
    x: xPos + 0.3, y: yPos + 0.2, w: 5.1, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.teal, fontFace: 'Calibri'
  });
  s2.addText(item.title, {
    x: xPos + 0.3, y: yPos + 0.5, w: 5.1, h: 0.35,
    fontSize: 14, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s2.addText(item.desc, {
    x: xPos + 0.3, y: yPos + 0.9, w: 5.1, h: 1.3,
    fontSize: 11, color: COLORS.textMuted, fontFace: 'Calibri', lineSpacing: 16
  });
});
addFooter(s2);

// ==========================================
// SLIDE 3: PROBLEM STATEMENT
// ==========================================
const s3 = pres.addSlide();
s3.background = { color: COLORS.bgLight };
addLightHeader(s3, 'Industry & Academic Context', 'Problem Statement: Challenges in the Blue-Collar Sector');

const problems = [
  {
    num: '01',
    title: 'Fragmented Employment Discovery',
    desc: 'Daily-wage and contract laborers gather physically at labor chowks without guaranteed work, transparent wage rates, or verifiable employer credentials.'
  },
  {
    num: '02',
    title: 'Employer Hiring Bottlenecks',
    desc: 'Small business owners, contractors, and retail shops struggle to quickly locate workers possessing verified skills and immediate availability.'
  },
  {
    num: '03',
    title: 'Lack of Hyperlocal Trade Verification',
    desc: 'Household customers encounter unverified technicians (plumbers, electricians) with unpredictable pricing, no background checks, and no safety assurance.'
  },
  {
    num: '04',
    title: 'Absence of Digital Accountability',
    desc: 'Disputes, no-shows, and substandard work go unrecorded without centralized ratings, administrative dispute resolution, or compliance audit trails.'
  }
];

problems.forEach((p, idx) => {
  const xPos = 0.8 + idx * 2.95;
  s3.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 1.6, w: 2.75, h: 4.9,
    fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.1
  });

  s3.addText(p.num, {
    x: xPos + 0.2, y: 1.9, w: 2.35, h: 0.5,
    fontSize: 26, bold: true, color: COLORS.teal, fontFace: 'Arial'
  });
  s3.addText(p.title, {
    x: xPos + 0.2, y: 2.5, w: 2.35, h: 0.8,
    fontSize: 13, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s3.addText(p.desc, {
    x: xPos + 0.2, y: 3.4, w: 2.35, h: 2.8,
    fontSize: 11, color: COLORS.textMuted, fontFace: 'Calibri', lineSpacing: 16
  });
});
addFooter(s3);

// ==========================================
// SLIDE 4: PROJECT OBJECTIVES & GOALS
// ==========================================
const s4 = pres.addSlide();
s4.background = { color: COLORS.bgLight };
addLightHeader(s4, 'Project Mission', 'Project Objectives & Core Design Goals');

const objectives = [
  {
    icon: '🎯',
    title: 'Dual-Vertical Unified Platform',
    desc: 'Unify daily-wage/regular job postings with on-demand trade service booking on a single full-stack responsive web application.'
  },
  {
    icon: '🔒',
    title: 'Secure Role-Based Access Control (RBAC)',
    desc: 'Enforce stateless JWT security across 5 distinct user roles (Admin, Employer, Worker, Customer, Provider) with granular permission gates.'
  },
  {
    icon: '⚡',
    title: 'Lifecycle State Automation',
    desc: 'Implement validated state transitions for job applications (APPLIED → SHORTLISTED → ACCEPTED) and services (REQUESTED → ACCEPTED → ON_THE_WAY → STARTED → COMPLETED).'
  },
  {
    icon: '🛡️',
    title: 'Trust & Governance Mechanisms',
    desc: 'Incorporate government ID proof auditing, verified provider badges, bidirectional review scoring, and formal administrative dispute resolution.'
  },
  {
    icon: '☁️',
    title: 'Cloud-Native Scalability',
    desc: 'Migrate from relational storage to MongoDB Atlas NoSQL with atomic sequence generators, hosting on Vercel Edge CDN and Render Web Services.'
  }
];

objectives.forEach((obj, idx) => {
  const yPos = 1.5 + idx * 1.05;
  s4.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: yPos, w: 11.7, h: 0.9,
    fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.08
  });

  s4.addText(obj.icon + '  ' + obj.title, {
    x: 1.1, y: yPos + 0.15, w: 4.5, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s4.addText(obj.desc, {
    x: 5.8, y: yPos + 0.15, w: 6.4, h: 0.6,
    fontSize: 11, color: COLORS.textMuted, fontFace: 'Calibri'
  });
});
addFooter(s4);

// ==========================================
// SLIDE 5: SYSTEM ARCHITECTURE (3-TIER)
// ==========================================
const s5 = pres.addSlide();
s5.background = { color: COLORS.bgLight };
addLightHeader(s5, 'System Engineering', 'Three-Tier MERN Full-Stack System Architecture');

const tiers = [
  {
    layer: 'PRESENTATION TIER (CLIENT)',
    tech: 'React 18  •  Vite  •  Tailwind CSS',
    items: [
      'Single Page Application (SPA) with React Router 6',
      'Client-side authentication state via AuthContext',
      'Interactive modals for bookings, reviews & disputes',
      'Responsive UI for desktop, tablet, and mobile screens',
      'Instant toast feedback via ToastContext',
      'Global Edge CDN hosting on Vercel'
    ]
  },
  {
    layer: 'APPLICATION TIER (REST API)',
    tech: 'Node.js 24  •  Express.js 4  •  JWT',
    items: [
      'Modular RESTful routing mounted at /api/v1/*',
      'Stateless Bearer JWT token generation & verification',
      'RBAC middleware authorizing 5 distinct user roles',
      'Haversine algorithm for hyperlocal distance matching',
      'Audit logging service for compliance and security events',
      'Hosted as Web Service on Render Cloud'
    ]
  },
  {
    layer: 'PERSISTENCE TIER (DATABASE)',
    tech: 'MongoDB Atlas  •  Mongoose ODM 8',
    items: [
      'Cloud-hosted NoSQL Document Database in AWS Mumbai',
      '15 Mongoose Schemas with strict type validations',
      'Atomic sequence counter collection ($inc) for numeric IDs',
      'Compound indexes for optimized query performance',
      'Bidirectional reviews & audit trails stored as documents',
      'Automated seed scripts & JSON backup utilities'
    ]
  }
];

tiers.forEach((t, idx) => {
  const xPos = 0.8 + idx * 4.0;
  s5.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 1.5, w: 3.7, h: 5.1,
    fill: { color: COLORS.white }, line: { color: idx === 1 ? COLORS.teal : COLORS.cardBorder, width: idx === 1 ? 2 : 1 }, rectRadius: 0.1
  });

  s5.addText(t.layer, {
    x: xPos + 0.2, y: 1.7, w: 3.3, h: 0.35,
    fontSize: 10, bold: true, color: COLORS.teal, fontFace: 'Calibri'
  });
  s5.addText(t.tech, {
    x: xPos + 0.2, y: 2.05, w: 3.3, h: 0.45,
    fontSize: 12, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s5.addShape(pres.ShapeType.rect, {
    x: xPos + 0.2, y: 2.6, w: 3.3, h: 0.02,
    fill: { color: COLORS.cardBorder }, line: { color: COLORS.cardBorder, width: 0 }
  });

  const bullets = t.items.map((it) => ({ text: it, options: { bullet: true, fontSize: 10.5, color: COLORS.textMuted, lineSpacing: 18 } }));
  s5.addText(bullets, {
    x: xPos + 0.2, y: 2.75, w: 3.3, h: 3.6,
    fontFace: 'Calibri'
  });
});
addFooter(s5);

// ==========================================
// SLIDE 6: TECHNOLOGIES USED
// ==========================================
const s6 = pres.addSlide();
s6.background = { color: COLORS.bgLight };
addLightHeader(s6, 'Technical Stack', 'Modern Full-Stack Technologies & Libraries');

const techCats = [
  {
    cat: 'Frontend Tier',
    items: [
      { name: 'React 18.3', role: 'Component-based reactive UI framework' },
      { name: 'Vite 5.4', role: 'Next-gen fast frontend build tooling' },
      { name: 'Tailwind CSS', role: 'Utility-first responsive design system' },
      { name: 'Lucide Icons', role: 'Clean, modern SVG UI icon library' },
      { name: 'Axios', role: 'HTTP client with JWT request interceptors' }
    ]
  },
  {
    cat: 'Backend Tier',
    items: [
      { name: 'Node.js 24', role: 'Asynchronous event-driven JavaScript runtime' },
      { name: 'Express.js 4', role: 'Minimal, robust web framework for REST APIs' },
      { name: 'JSON Web Tokens', role: 'Stateless secure authentication standard' },
      { name: 'Bcrypt.js', role: 'Salted cryptographic password hashing' },
      { name: 'Helmet & CORS', role: 'HTTP header security & origin whitelist' }
    ]
  },
  {
    cat: 'Database & Cloud',
    items: [
      { name: 'MongoDB Atlas', role: 'Managed cloud NoSQL document database' },
      { name: 'Mongoose 8.2', role: 'Strict schema modeling & validation' },
      { name: 'Render', role: 'Node.js backend cloud web service hosting' },
      { name: 'Vercel', role: 'Global Edge CDN frontend hosting' },
      { name: 'GitHub', role: 'Git version control & CI/CD deployment hooks' }
    ]
  }
];

techCats.forEach((tc, idx) => {
  const xPos = 0.8 + idx * 4.0;
  s6.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 1.5, w: 3.7, h: 5.1,
    fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.1
  });

  s6.addText(tc.cat, {
    x: xPos + 0.3, y: 1.8, w: 3.1, h: 0.4,
    fontSize: 15, bold: true, color: COLORS.teal, fontFace: 'Arial'
  });

  let curY = 2.4;
  tc.items.forEach((it) => {
    s6.addText(it.name, {
      x: xPos + 0.3, y: curY, w: 3.1, h: 0.25,
      fontSize: 11, bold: true, color: COLORS.textDark, fontFace: 'Arial'
    });
    s6.addText(it.role, {
      x: xPos + 0.3, y: curY + 0.23, w: 3.1, h: 0.45,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: 'Calibri'
    });
    curY += 0.75;
  });
});
addFooter(s6);

// ==========================================
// SLIDE 7: KEY MODULE 1 — EMPLOYMENT CONNECT
// ==========================================
const s7 = pres.addSlide();
s7.background = { color: COLORS.bgLight };
addLightHeader(s7, 'Core Functional Module 1', 'Employment Connect: Daily-Wage & Regular Job Marketplace');

const steps = [
  { step: 'Step 1', actor: 'EMPLOYER', title: 'Job Creation', desc: 'Publishes vacancies specifying Daily-Wage or Regular Monthly pay, required skills, location, and working hours.' },
  { step: 'Step 2', actor: 'WORKER', title: 'Search & Filtering', desc: 'Discovers opportunities using smart filters for wage compensation, city, trade skills, and employment type.' },
  { step: 'Step 3', actor: 'WORKER', title: 'Application & Bidding', desc: 'Submits formal application with expected wage bid and experience cover note.' },
  { step: 'Step 4', actor: 'EMPLOYER', title: 'Candidate Review', desc: 'Reviews applicants, checks ratings, and updates status: APPLIED → SHORTLISTED → ACCEPTED.' },
  { step: 'Step 5', actor: 'SYSTEM', title: 'Fulfillment & Closure', desc: 'Employer closes job post when positions are filled. Worker tracks accepted notifications.' }
];

steps.forEach((st, idx) => {
  const xPos = 0.8 + idx * 2.38;
  s7.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 1.6, w: 2.2, h: 4.8,
    fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.1
  });

  s7.addText(st.step, {
    x: xPos + 0.15, y: 1.8, w: 1.9, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.teal, fontFace: 'Calibri'
  });
  s7.addText(st.actor, {
    x: xPos + 0.15, y: 2.1, w: 1.9, h: 0.3,
    fontSize: 9, bold: true, color: COLORS.cyan, fontFace: 'Calibri'
  });
  s7.addText(st.title, {
    x: xPos + 0.15, y: 2.45, w: 1.9, h: 0.6,
    fontSize: 13, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s7.addText(st.desc, {
    x: xPos + 0.15, y: 3.15, w: 1.9, h: 3.0,
    fontSize: 10.5, color: COLORS.textMuted, fontFace: 'Calibri', lineSpacing: 16
  });
});
addFooter(s7);

// ==========================================
// SLIDE 8: KEY MODULE 2 — ON-DEMAND SERVICE CONNECT
// ==========================================
const s8 = pres.addSlide();
s8.background = { color: COLORS.bgLight };
addLightHeader(s8, 'Core Functional Module 2', 'On-Demand Service Connect: Hyperlocal Trade Lifecycle');

const serviceStates = [
  { state: '1. REQUESTED', color: '3B82F6', title: 'Customer Booking', desc: 'Customer selects trade category (Plumbing, Electrical, etc.), chooses verified provider, and submits address with job description.' },
  { state: '2. ACCEPTED', color: '0D9488', title: 'Provider Acceptance', desc: 'Provider reviews incoming alert on Provider Dashboard and accepts or rejects based on schedule and service area.' },
  { state: '3. ON_THE_WAY', color: 'EAB308', title: 'Technician Dispatched', desc: 'Provider signals departure. Live 5-step progress bar on Customer Dashboard updates in real time.' },
  { state: '4. STARTED', color: '8B5CF6', title: 'Work in Progress', desc: 'Technician arrives on-site and commences service diagnostics and repairs.' },
  { state: '5. COMPLETED', color: '10B981', title: 'Completion & Review', desc: 'Provider records final invoice amount. Customer confirms completion and submits 1–5 star rating and feedback.' }
];

serviceStates.forEach((ss, idx) => {
  const yPos = 1.5 + idx * 1.05;
  s8.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: yPos, w: 11.7, h: 0.9,
    fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.08
  });

  s8.addText(ss.state, {
    x: 1.1, y: yPos + 0.15, w: 2.5, h: 0.35,
    fontSize: 12, bold: true, color: ss.color, fontFace: 'Arial'
  });
  s8.addText(ss.title, {
    x: 3.6, y: yPos + 0.15, w: 2.6, h: 0.35,
    fontSize: 12, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s8.addText(ss.desc, {
    x: 6.2, y: yPos + 0.15, w: 6.0, h: 0.6,
    fontSize: 10.5, color: COLORS.textMuted, fontFace: 'Calibri'
  });
});
addFooter(s8);

// ==========================================
// SLIDE 9: USER ROLES & PERMISSION MATRIX
// ==========================================
const s9 = pres.addSlide();
s9.background = { color: COLORS.bgLight };
addLightHeader(s9, 'Security & Authorization', '5 Specialized User Roles & Dedicated Portals');

const roles = [
  { role: 'Platform Admin', badge: 'ROLE_ADMIN', features: 'System analytics stats, review & verify trade license badges, resolve user disputes, suspend/reactivate non-compliant accounts, live audit trail.' },
  { role: 'Employer', badge: 'ROLE_EMPLOYER', features: 'Post regular & daily-wage jobs, search worker talent pool, review applicants, update candidate status, manage job closure.' },
  { role: 'Skilled Worker', badge: 'ROLE_WORKER', features: 'Maintain verified trade skills & hourly/daily rates, discover nearby jobs, submit wage bids with cover notes, track active applications.' },
  { role: 'Customer', badge: 'ROLE_CUSTOMER', features: 'Browse local certified contractors, book on-demand trade repairs, track 5-step live lifecycle, submit star ratings and formal complaints.' },
  { role: 'Service Provider', badge: 'ROLE_PROVIDER', features: 'Business profile showcase, upload ID verification credentials, accept/decline service orders, update dispatch progress and final cost.' }
];

roles.forEach((r, idx) => {
  const yPos = 1.5 + idx * 1.05;
  s9.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: yPos, w: 11.7, h: 0.9,
    fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.08
  });

  s9.addText(r.role, {
    x: 1.1, y: yPos + 0.15, w: 2.3, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s9.addText(r.badge, {
    x: 3.5, y: yPos + 0.18, w: 2.0, h: 0.3,
    fontSize: 9.5, bold: true, color: COLORS.teal, fontFace: 'Consolas'
  });
  s9.addText(r.features, {
    x: 5.6, y: yPos + 0.15, w: 6.6, h: 0.65,
    fontSize: 10.5, color: COLORS.textMuted, fontFace: 'Calibri'
  });
});
addFooter(s9);

// ==========================================
// SLIDE 10: DATABASE DESIGN (MONGODB ATLAS)
// ==========================================
const s10 = pres.addSlide();
s10.background = { color: COLORS.bgLight };
addLightHeader(s10, 'NoSQL Persistence Tier', 'MongoDB Database Architecture & Schema Collections');

const dbCols = [
  { group: 'Authentication & System', cols: 'users, roles, auditlogs, counters' },
  { group: 'Master Taxonomies', cols: 'skills (14 trade skills), servicecategories (6 categories)' },
  { group: 'Actor Profiles', cols: 'workerprofiles, employerprofiles, customerprofiles, providerprofiles' },
  { group: 'Core Business Operations', cols: 'jobs (daily & regular), jobapplications, servicerequests' },
  { group: 'Feedback & Compliance', cols: 'reviews (1–5 star ratings), complaints (formal disputes)' }
];

dbCols.forEach((dc, idx) => {
  const yPos = 1.5 + idx * 0.75;
  s10.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: yPos, w: 11.7, h: 0.65,
    fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.08
  });
  s10.addText(dc.group, {
    x: 1.1, y: yPos + 0.15, w: 3.5, h: 0.35,
    fontSize: 12, bold: true, color: COLORS.teal, fontFace: 'Arial'
  });
  s10.addText(dc.cols, {
    x: 4.8, y: yPos + 0.15, w: 7.4, h: 0.35,
    fontSize: 11, color: COLORS.textDark, fontFace: 'Consolas'
  });
});

// Technical highlight callout
s10.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 5.4, w: 11.7, h: 1.3,
  fill: { color: 'F0FDFA' }, line: { color: COLORS.teal, width: 1 }, rectRadius: 0.1
});
s10.addText('Key NoSQL Design Highlights:', {
  x: 1.1, y: 5.55, w: 11.1, h: 0.3,
  fontSize: 11, bold: true, color: COLORS.teal, fontFace: 'Arial'
});
s10.addText('• Atomic Sequence Generator: Implemented a dedicated "counters" collection utilizing MongoDB $inc for numeric IDs.\n• Hybrid Referencing: Combined document embedding for fast nested lookups with relational-style referencing for audit logs.\n• Performance Indexing: Compound indexes on (status, categoryId, city) and text indexes on titles and descriptions.', {
  x: 1.1, y: 5.85, w: 11.1, h: 0.75,
  fontSize: 10, color: COLORS.textDark, fontFace: 'Calibri'
});
addFooter(s10);

// ==========================================
// SLIDE 11: RESTFUL API & AUTOMATED TESTING
// ==========================================
const s11 = pres.addSlide();
s11.background = { color: COLORS.bgLight };
addLightHeader(s11, 'Quality Assurance & API Design', 'RESTful Endpoints & 100% Automated Test Suite Verification');

const testStats = [
  { label: 'Total REST Endpoints', val: '48', sub: 'CRUD operations mapped to /api/v1/*' },
  { label: 'Automated Test Suites', val: '16/16', sub: '100% Pass Rate in ~2.6 seconds' },
  { label: 'Frontend Production Build', val: '0 Errors', sub: '1,672 modules compiled in 3.56s' },
  { label: 'Security Enforcement', val: '100%', sub: 'JWT verification & RBAC authorization' }
];

testStats.forEach((ts, idx) => {
  const xPos = 0.8 + idx * 2.95;
  s11.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 1.5, w: 2.75, h: 1.6,
    fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.1
  });
  s11.addText(ts.val, {
    x: xPos + 0.2, y: 1.7, w: 2.35, h: 0.5,
    fontSize: 22, bold: true, color: COLORS.emerald, fontFace: 'Arial'
  });
  s11.addText(ts.label, {
    x: xPos + 0.2, y: 2.2, w: 2.35, h: 0.35,
    fontSize: 11, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s11.addText(ts.sub, {
    x: xPos + 0.2, y: 2.5, w: 2.35, h: 0.45,
    fontSize: 9, color: COLORS.textMuted, fontFace: 'Calibri'
  });
});

// Test Cases List Box
s11.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 3.3, w: 11.7, h: 3.4,
  fill: { color: COLORS.white }, line: { color: COLORS.cardBorder, width: 1 }, rectRadius: 0.1
});
s11.addText('Summary of Verified Automated Test Scenarios (Node.js Test Runner + Supertest):', {
  x: 1.1, y: 3.5, w: 11.1, h: 0.35,
  fontSize: 12, bold: true, color: COLORS.textDark, fontFace: 'Arial'
});

const testList1 = [
  '✔ Health Check & MongoDB status UP',
  '✔ Active Service Categories retrieval',
  '✔ Seeded Skills (Regular & Trade) retrieval',
  '✔ JWT Authentication across 5 Demo Accounts',
  '✔ Job Search with Regular/Daily-wage filters',
  '✔ Verified Provider directory & Haversine distance',
  '✔ Admin Stats & RBAC 401/403 Security Guards',
  '✔ Worker Application submission & tracking'
];
const testList2 = [
  '✔ Role Profile management (Worker & Employer)',
  '✔ Service Request booking creation & acceptance',
  '✔ Employer candidate hiring (Shortlist → Accept)',
  '✔ Complete 5-step Service Lifecycle & Final Billing',
  '✔ Customer Review & Star Rating submission',
  '✔ Service Request cancellation with reason',
  '✔ Dispute Filing & Admin Resolution workflow',
  '✔ Admin User Suspension (401 block) & Reactivation'
];

s11.addText(testList1.join('\n'), {
  x: 1.1, y: 3.9, w: 5.3, h: 2.6,
  fontSize: 10, color: COLORS.emerald, fontFace: 'Consolas', lineSpacing: 18
});
s11.addText(testList2.join('\n'), {
  x: 6.8, y: 3.9, w: 5.3, h: 2.6,
  fontSize: 10, color: COLORS.emerald, fontFace: 'Consolas', lineSpacing: 18
});
addFooter(s11);

// ==========================================
// SLIDE 12: LIVE CLOUD DEPLOYMENT
// ==========================================
const s12 = pres.addSlide();
s12.background = { color: COLORS.bgLight };
addLightHeader(s12, 'Cloud Production Architecture', 'Live Cloud Hosting & Multi-Tier Deployment Architecture');

const deployCards = [
  {
    tier: 'FRONTEND DEPLOYMENT',
    host: 'Vercel Global Edge Network',
    url: 'https://labour-connect-updated.vercel.app/',
    details: [
      'Built with Vite 5 production pipeline',
      'Instant global CDN distribution and SSL',
      'Configured vercel.json & _redirects for SPA routing',
      'Zero-latency static asset caching'
    ]
  },
  {
    tier: 'BACKEND REST API',
    host: 'Render Cloud Web Service',
    url: 'https://labour-connect-updated.onrender.com/api/v1',
    details: [
      'Node.js runtime environment on port 8081 / 10000',
      'Automated Git-triggered builds from main branch',
      'CORS security with dynamic origin validation',
      'Production environment variables for secrets'
    ]
  },
  {
    tier: 'CLOUD DATABASE',
    host: 'MongoDB Atlas (AWS Mumbai)',
    url: 'mongodb+srv://... (Cluster0)',
    details: [
      'Highly available M0 cloud replica set',
      'Encrypted at rest and in transit (TLS 1.3)',
      'Whitelisted network access (0.0.0.0/0)',
      'Pre-seeded with demo data & collections'
    ]
  }
];

deployCards.forEach((dc, idx) => {
  const xPos = 0.8 + idx * 4.0;
  s12.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 1.5, w: 3.7, h: 5.1,
    fill: { color: COLORS.white }, line: { color: COLORS.teal, width: 1.5 }, rectRadius: 0.1
  });

  s12.addText(dc.tier, {
    x: xPos + 0.2, y: 1.7, w: 3.3, h: 0.3,
    fontSize: 9.5, bold: true, color: COLORS.teal, fontFace: 'Calibri'
  });
  s12.addText(dc.host, {
    x: xPos + 0.2, y: 2.0, w: 3.3, h: 0.45,
    fontSize: 13, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s12.addText(dc.url, {
    x: xPos + 0.2, y: 2.5, w: 3.3, h: 0.45,
    fontSize: 9, color: COLORS.accentBlue, fontFace: 'Consolas'
  });
  s12.addShape(pres.ShapeType.rect, {
    x: xPos + 0.2, y: 3.0, w: 3.3, h: 0.02,
    fill: { color: COLORS.cardBorder }, line: { color: COLORS.cardBorder, width: 0 }
  });

  const bList = dc.details.map((d) => ({ text: d, options: { bullet: true, fontSize: 10.5, color: COLORS.textMuted, lineSpacing: 18 } }));
  s12.addText(bList, {
    x: xPos + 0.2, y: 3.15, w: 3.3, h: 3.2,
    fontFace: 'Calibri'
  });
});
addFooter(s12);

// ==========================================
// SLIDE 13: LIMITATIONS & FUTURE SCOPE
// ==========================================
const s13 = pres.addSlide();
s13.background = { color: COLORS.bgLight };
addLightHeader(s13, 'Roadmap & Future Work', 'Current Project Limitations & Strategic Roadmap');

const limitations = [
  { title: 'Offline Payment Settlement', desc: 'Currently service invoices and daily wages are settled offline directly between parties; online payment gateway integration is pending.' },
  { title: 'Static Coordinate Haversine Matching', desc: 'Distance calculation utilizes static latitude/longitude profile coordinates rather than live real-time GPS telemetry.' },
  { title: 'In-App Alerts vs External Gateways', desc: 'Notifications and audit alerts operate within the application database rather than via external SMS or push notification gateways.' }
];

const future = [
  { title: 'UPI & Payment Gateway Integration', desc: 'Integrate Razorpay or Cashfree for automated escrow wage deposits and instant digital service payments.' },
  { title: 'Real-Time GPS Tracking & WebSockets', desc: 'Implement WebSocket connections with Leaflet/Mapbox for live technician en-route tracking on interactive maps.' },
  { title: 'Multilingual Localization', desc: 'Add multi-language localization (Hindi, Marathi, Kannada) to improve accessibility for blue-collar tradespeople.' },
  { title: 'Cross-Platform Mobile App', desc: 'Develop a companion React Native / Flutter mobile app for workers and service contractors on the move.' }
];

// Left Box: Limitations
s13.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.5, w: 5.7, h: 5.1,
  fill: { color: COLORS.white }, line: { color: 'FCA5A5', width: 1.5 }, rectRadius: 0.1
});
s13.addText('CURRENT LIMITATIONS', {
  x: 1.1, y: 1.7, w: 5.1, h: 0.35,
  fontSize: 13, bold: true, color: 'DC2626', fontFace: 'Arial'
});

let limY = 2.2;
limitations.forEach((l) => {
  s13.addText('• ' + l.title, {
    x: 1.1, y: limY, w: 5.1, h: 0.25,
    fontSize: 11, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s13.addText(l.desc, {
    x: 1.1, y: limY + 0.25, w: 5.1, h: 0.6,
    fontSize: 10, color: COLORS.textMuted, fontFace: 'Calibri'
  });
  limY += 0.95;
});

// Right Box: Future Scope
s13.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.1,
  fill: { color: COLORS.white }, line: { color: COLORS.teal, width: 1.5 }, rectRadius: 0.1
});
s13.addText('FUTURE ENHANCEMENTS', {
  x: 7.1, y: 1.7, w: 5.1, h: 0.35,
  fontSize: 13, bold: true, color: COLORS.teal, fontFace: 'Arial'
});

let futY = 2.2;
future.forEach((f) => {
  s13.addText('• ' + f.title, {
    x: 7.1, y: futY, w: 5.1, h: 0.25,
    fontSize: 11, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });
  s13.addText(f.desc, {
    x: 7.1, y: futY + 0.25, w: 5.1, h: 0.5,
    fontSize: 10, color: COLORS.textMuted, fontFace: 'Calibri'
  });
  futY += 0.75;
});
addFooter(s13);

// ==========================================
// SLIDE 14: CONCLUSION & LIVE DEMO (Dark)
// ==========================================
const s14 = pres.addSlide();
s14.background = { color: COLORS.bgDark };

s14.addText('PROJECT DEMONSTRATION & CONCLUSION', {
  x: 0.8, y: 0.6, w: 11.5, h: 0.3,
  fontSize: 11, bold: true, color: COLORS.cyan, fontFace: 'Calibri'
});
s14.addText('Labour Connect is Live & Production-Ready', {
  x: 0.8, y: 0.95, w: 11.5, h: 0.6,
  fontSize: 26, bold: true, color: COLORS.white, fontFace: 'Arial'
});

// Live URLs Section
s14.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.7, w: 11.7, h: 2.1,
  fill: { color: COLORS.bgCardDark }, line: { color: COLORS.teal, width: 1.5 }, rectRadius: 0.1
});
s14.addText('LIVE DEPLOYED CLOUD URLS', {
  x: 1.1, y: 1.9, w: 11.1, h: 0.3,
  fontSize: 11, bold: true, color: COLORS.cyan, fontFace: 'Calibri'
});
s14.addText('🌐 Production Web Application:  https://labour-connect-updated.vercel.app/\n⚡ Production REST API:        https://labour-connect-updated.onrender.com/api/v1\n🏥 API Health Status:         https://labour-connect-updated.onrender.com/api/v1/health\n📂 GitHub Source Repository:   https://github.com/umangramteke/labour-connect-updated', {
  x: 1.1, y: 2.3, w: 11.1, h: 1.3,
  fontSize: 11.5, color: COLORS.white, fontFace: 'Consolas', lineSpacing: 22
});

// Demo Credentials Grid
s14.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 4.0, w: 11.7, h: 2.6,
  fill: { color: COLORS.bgCardDark }, line: { color: '334155', width: 1 }, rectRadius: 0.1
});
s14.addText('PRE-SEEDED DEMO CREDENTIALS FOR VIVA EVALUATION', {
  x: 1.1, y: 4.2, w: 11.1, h: 0.3,
  fontSize: 11, bold: true, color: COLORS.emerald, fontFace: 'Calibri'
});

const demoAccounts = [
  { role: 'Admin', email: 'admin@labourconnect.com', pass: 'Admin@1234', desc: 'Stats, Verifications, Disputes, Audit' },
  { role: 'Employer', email: 'employer@labourconnect.com', pass: 'Employer@1234', desc: 'Post Jobs, Review Candidates, Hire' },
  { role: 'Worker', email: 'worker@labourconnect.com', pass: 'Worker@1234', desc: 'Browse & Filter Jobs, Bid, Track' },
  { role: 'Customer', email: 'customer@labourconnect.com', pass: 'Customer@1234', desc: 'Book Technicians, Track 5-Step, Review' },
  { role: 'Provider', email: 'provider@labourconnect.com', pass: 'Provider@1234', desc: 'Accept Orders, Dispatch, Bill Cost' }
];

demoAccounts.forEach((acc, idx) => {
  const yPos = 4.6 + idx * 0.38;
  s14.addText(`• ${acc.role}:`, {
    x: 1.1, y: yPos, w: 1.4, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.white, fontFace: 'Arial'
  });
  s14.addText(acc.email, {
    x: 2.5, y: yPos, w: 3.2, h: 0.3,
    fontSize: 10, color: COLORS.tealLight, fontFace: 'Consolas'
  });
  s14.addText(`Password: ${acc.pass}`, {
    x: 5.7, y: yPos, w: 2.4, h: 0.3,
    fontSize: 10, color: COLORS.cyan, fontFace: 'Consolas'
  });
  s14.addText(`(${acc.desc})`, {
    x: 8.1, y: yPos, w: 4.2, h: 0.3,
    fontSize: 9.5, color: '94A3B8', fontFace: 'Calibri'
  });
});

addFooter(s14, true);

// Output presentation file
const outputPath = path.join(__dirname, '..', '..', 'Labour_Connect_Presentation.pptx');
pres.writeFile({ fileName: outputPath })
  .then((fileName) => {
    console.log(`Presentation generated successfully: ${fileName}`);
  })
  .catch((err) => {
    console.error(`Error generating presentation: ${err.message}`);
    process.exit(1);
  });
