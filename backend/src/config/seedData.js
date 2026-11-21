const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { Counter } = require('../models/Counter');
const Role = require('../models/Role');
const Skill = require('../models/Skill');
const ServiceCategory = require('../models/ServiceCategory');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const CustomerProfile = require('../models/CustomerProfile');
const ProviderProfile = require('../models/ProviderProfile');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');

async function syncCounter(sequenceName, maxVal) {
  const current = await Counter.findById(sequenceName);
  if (!current || current.seq < maxVal) {
    await Counter.findByIdAndUpdate(
      sequenceName,
      { seq: maxVal },
      { upsert: true, new: true }
    );
  }
}

async function seedDatabase() {
  console.log('[Seed] Checking and seeding Labour Connect reference & demo data...');

  // 1. ROLES
  const rolesList = ['ROLE_ADMIN', 'ROLE_EMPLOYER', 'ROLE_WORKER', 'ROLE_CUSTOMER', 'ROLE_PROVIDER'];
  for (let i = 0; i < rolesList.length; i++) {
    const rName = rolesList[i];
    await Role.findOneAndUpdate(
      { name: rName },
      { id: i + 1, name: rName },
      { upsert: true }
    );
  }
  await syncCounter('roles', rolesList.length);

  // 2. SKILLS
  const defaultSkills = [
    { id: 1, name: 'Masonry', category: 'Construction', description: 'Bricklaying, stone work, concrete mixing, and plastering' },
    { id: 2, name: 'Carpentry', category: 'Woodwork', description: 'Furniture making, doors/windows fixing, and structural woodwork' },
    { id: 3, name: 'Plumbing', category: 'Maintenance', description: 'Pipe installation, sanitary fixtures, and drainage maintenance' },
    { id: 4, name: 'Electrical Wiring', category: 'Electrical', description: 'House wiring, electrical fixture installations, and fault diagnosis' },
    { id: 5, name: 'House Painting', category: 'Finishing', description: 'Interior and exterior wall painting, primer, and waterproofing' },
    { id: 6, name: 'Tile Laying', category: 'Flooring', description: 'Floor and wall ceramic/granite tile installation' },
    { id: 7, name: 'Welding & Fabrication', category: 'Metalwork', description: 'Arc welding, gate fabrication, and metal repairs' },
    { id: 8, name: 'Loading & Unloading', category: 'Logistics', description: 'Heavy cargo loading, warehouse material shifting, and logistics' },
    { id: 9, name: 'General Construction Labour', category: 'Construction', description: 'Site clearing, excavation, earth moving, and material helper' },
    { id: 10, name: 'Bar Bending / Steel Fixing', category: 'Construction', description: 'Reinforcement steel bar bending and tying for RCC structures' },
    { id: 11, name: 'Retail Sales & Customer Service', category: 'Retail & Sales', description: 'Showroom sales, customer assistance, billing, and product demonstrations' },
    { id: 12, name: 'Shop Assistant & Inventory', category: 'Retail & Sales', description: 'Stock handling, inventory checking, shop upkeep, and customer support' },
    { id: 13, name: 'Cashier & Billing', category: 'Commerce', description: 'POS counter billing, cash handling, and daily accounts reconciliation' },
    { id: 14, name: 'Office Assistant', category: 'Administration', description: 'Office maintenance, document handling, filing, and errand support' }
  ];

  for (const s of defaultSkills) {
    await Skill.findOneAndUpdate({ name: s.name }, s, { upsert: true });
  }
  await syncCounter('skills', defaultSkills.length);

  // 3. SERVICE CATEGORIES
  const defaultCategories = [
    { id: 1, name: 'Plumbing Services', slug: 'plumbing', iconName: 'Wrench', description: 'Pipe leaks, tap repair, bathroom fittings, water tank and drainage solutions', active: true },
    { id: 2, name: 'Electrical Repair', slug: 'electrical', iconName: 'Zap', description: 'Short circuit fix, switchboard installation, ceiling fans, lighting, and wiring', active: true },
    { id: 3, name: 'Carpentry & Woodwork', slug: 'carpentry', iconName: 'Hammer', description: 'Door lock fixing, furniture repair, wooden partitioning, and custom fittings', active: true },
    { id: 4, name: 'House Painting & Polishing', slug: 'painting', iconName: 'Paintbrush', description: 'Wall repainting, putty work, waterproof coatings, and wood varnish', active: true },
    { id: 5, name: 'Appliance Repair', slug: 'appliance-repair', iconName: 'Tv', description: 'Air conditioner servicing, washing machines, refrigerators, and microwave repairs', active: true },
    { id: 6, name: 'Automobile & Mechanics', slug: 'mechanical', iconName: 'Car', description: 'Emergency roadside puncture, two-wheeler servicing, and mechanical checks', active: true }
  ];

  for (const c of defaultCategories) {
    await ServiceCategory.findOneAndUpdate({ slug: c.slug }, c, { upsert: true });
  }
  await syncCounter('service_categories', defaultCategories.length);

  // 4. USERS AND PROFILES
  let currentUserId = 0;

  // Admin
  const adminEmail = 'admin@labourconnect.com';
  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    currentUserId++;
    adminUser = await User.create({
      id: currentUserId,
      email: adminEmail,
      passwordHash: await bcrypt.hash('Admin@1234', 10),
      fullName: 'Platform Administrator',
      phoneNumber: '+91-9876543210',
      roles: ['ROLE_ADMIN'],
      active: true,
      suspended: false
    });
  } else {
    currentUserId = Math.max(currentUserId, adminUser.id);
  }

  // Employers
  const employerData = [
    {
      email: 'employer@labourconnect.com',
      password: 'Employer@1234',
      fullName: 'Apex Construction & Hardware',
      phone: '+91-9123456780',
      companyName: 'Apex Construction & Hardware Stores',
      businessType: 'CONTRACTOR',
      address: '45 Ring Road, Indiranagar',
      city: 'Bangalore',
      contactPerson: 'Ramesh Kumar'
    },
    {
      email: 'employer2@labourconnect.com',
      password: 'Employer@1234',
      fullName: 'UrbanEdge Design & Renovations',
      phone: '+91-9123456789',
      companyName: 'UrbanEdge Interior Design & Renovations',
      businessType: 'ENTERPRISE',
      address: '122 100-Ft Road, Indiranagar',
      city: 'Bangalore',
      contactPerson: 'Kavita Rao'
    }
  ];

  const employers = [];
  for (let i = 0; i < employerData.length; i++) {
    const ed = employerData[i];
    let u = await User.findOne({ email: ed.email });
    if (!u) {
      currentUserId++;
      u = await User.create({
        id: currentUserId,
        email: ed.email,
        passwordHash: await bcrypt.hash(ed.password, 10),
        fullName: ed.fullName,
        phoneNumber: ed.phone,
        roles: ['ROLE_EMPLOYER'],
        active: true,
        suspended: false
      });
    } else {
      currentUserId = Math.max(currentUserId, u.id);
    }

    let ep = await EmployerProfile.findOne({ userId: u.id });
    if (!ep) {
      ep = await EmployerProfile.create({
        id: i + 1,
        userId: u.id,
        companyName: ed.companyName,
        businessType: ed.businessType,
        address: ed.address,
        city: ed.city,
        contactPerson: ed.contactPerson,
        phone: ed.phone
      });
    }
    employers.push(ep);
  }
  await syncCounter('employer_profiles', employers.length);

  // Workers
  const workerData = [
    { email: 'worker@labourconnect.com', name: 'Suresh Sharma', phone: '+91-9845123456', headline: 'Experienced Mason & Concrete Specialist', bio: 'Residential masonry, bricklaying, and cement plastering.', exp: 8, daily: 950, hourly: 150, city: 'Bangalore', area: 'Indiranagar', lat: 12.9716, lng: 77.5946, skills: [1, 9] },
    { email: 'worker2@labourconnect.com', name: 'Ramesh Naik', phone: '+91-9845123457', headline: 'Master Woodwork & Furniture Carpenter', bio: 'Custom wardrobes, doors, windows, and modular cabinetry.', exp: 6, daily: 1000, hourly: 160, city: 'Bangalore', area: 'Koramangala', lat: 12.9352, lng: 77.6245, skills: [2] },
    { email: 'worker3@labourconnect.com', name: 'Vikram Singh', phone: '+91-9845123458', headline: 'Certified Electrical Wiring Specialist', bio: 'Single-phase and 3-phase industrial and house wiring.', exp: 7, daily: 1100, hourly: 175, city: 'Bangalore', area: 'Whitefield', lat: 12.9698, lng: 77.7500, skills: [4] },
    { email: 'worker4@labourconnect.com', name: 'Deepak Verma', phone: '+91-9845123459', headline: 'Professional Wall Painter & Putty Artist', bio: 'Interior emulsion, exterior weather coats, and waterproof priming.', exp: 5, daily: 850, hourly: 130, city: 'Bangalore', area: 'HSR Layout', lat: 12.9121, lng: 77.6446, skills: [5] },
    { email: 'worker5@labourconnect.com', name: 'Manoj Kumar', phone: '+91-9845123460', headline: 'Precision Granite & Vitrified Tile Layer', bio: 'High-precision floor leveling, granite borders, and bathroom tiling.', exp: 9, daily: 1050, hourly: 170, city: 'Bangalore', area: 'Jayanagar', lat: 12.9308, lng: 77.5838, skills: [6] }
  ];

  const workers = [];
  for (let i = 0; i < workerData.length; i++) {
    const wd = workerData[i];
    let u = await User.findOne({ email: wd.email });
    if (!u) {
      currentUserId++;
      u = await User.create({
        id: currentUserId,
        email: wd.email,
        passwordHash: await bcrypt.hash('Worker@1234', 10),
        fullName: wd.name,
        phoneNumber: wd.phone,
        roles: ['ROLE_WORKER'],
        active: true,
        suspended: false
      });
    } else {
      currentUserId = Math.max(currentUserId, u.id);
    }

    let wp = await WorkerProfile.findOne({ userId: u.id });
    if (!wp) {
      wp = await WorkerProfile.create({
        id: i + 1,
        userId: u.id,
        headline: wd.headline,
        bio: wd.bio,
        yearsOfExperience: wd.exp,
        dailyRate: wd.daily,
        hourlyRate: wd.hourly,
        city: wd.city,
        area: wd.area,
        latitude: wd.lat,
        longitude: wd.lng,
        availabilityStatus: 'AVAILABLE',
        skillIds: wd.skills
      });
    }
    workers.push(wp);
  }
  await syncCounter('worker_profiles', workers.length);

  // Customers
  const custData = [
    { email: 'customer@labourconnect.com', name: 'Priya Venkatesh', phone: '+91-9988776655', address: 'Flat 302, Green Glen Layout, Bellandur', city: 'Bangalore', area: 'Bellandur', lat: 12.9304, lng: 77.6784 },
    { email: 'customer2@labourconnect.com', name: 'Anand Murthy', phone: '+91-9988776656', address: '14th Main, Sector 4, HSR Layout', city: 'Bangalore', area: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
    { email: 'customer3@labourconnect.com', name: 'Sneha Patel', phone: '+91-9988776657', address: 'Palm Meadows Villa 42, Whitefield', city: 'Bangalore', area: 'Whitefield', lat: 12.9698, lng: 77.7500 }
  ];

  const customers = [];
  for (let i = 0; i < custData.length; i++) {
    const cd = custData[i];
    let u = await User.findOne({ email: cd.email });
    if (!u) {
      currentUserId++;
      u = await User.create({
        id: currentUserId,
        email: cd.email,
        passwordHash: await bcrypt.hash('Customer@1234', 10),
        fullName: cd.name,
        phoneNumber: cd.phone,
        roles: ['ROLE_CUSTOMER'],
        active: true,
        suspended: false
      });
    } else {
      currentUserId = Math.max(currentUserId, u.id);
    }

    let cp = await CustomerProfile.findOne({ userId: u.id });
    if (!cp) {
      cp = await CustomerProfile.create({
        id: i + 1,
        userId: u.id,
        address: cd.address,
        city: cd.city,
        area: cd.area,
        latitude: cd.lat,
        longitude: cd.lng
      });
    }
    customers.push(cp);
  }
  await syncCounter('customer_profiles', customers.length);

  // Service Providers
  const provData = [
    { email: 'provider@labourconnect.com', name: 'Sunil Master Plumbers', phone: '+91-9871122334', bio: 'Licensed plumbing contractor. Emergency water leak repair, bathroom renovations, and pipe fittings.', exp: 6, base: 350, hourly: 200, city: 'Bangalore', radius: 20, lat: 12.9784, lng: 77.6408, cats: [1] },
    { email: 'provider2@labourconnect.com', name: 'SparkVolt Electrical Solutions', phone: '+91-9871122335', bio: 'Master electricians for short circuit repair, DB box upgrades, switchboard setup, and inverter wiring.', exp: 8, base: 400, hourly: 250, city: 'Bangalore', radius: 25, lat: 12.9352, lng: 77.6245, cats: [2] },
    { email: 'provider3@labourconnect.com', name: 'MasterCraft Furniture & Carpentry', phone: '+91-9871122336', bio: 'Expert carpenters for door lock alignment, wooden wardrobe repair, kitchen drawer channels, and partitions.', exp: 7, base: 450, hourly: 220, city: 'Bangalore', radius: 20, lat: 12.9121, lng: 77.6446, cats: [3] },
    { email: 'provider4@labourconnect.com', name: 'ColorPro Home Painting & Waterproofing', phone: '+91-9871122337', bio: 'Reliable residential painters for interior wall touch-ups, waterproof primer, and wood polish.', exp: 5, base: 500, hourly: 180, city: 'Bangalore', radius: 20, lat: 12.9698, lng: 77.7500, cats: [4] }
  ];

  const providers = [];
  for (let i = 0; i < provData.length; i++) {
    const pd = provData[i];
    let u = await User.findOne({ email: pd.email });
    if (!u) {
      currentUserId++;
      u = await User.create({
        id: currentUserId,
        email: pd.email,
        passwordHash: await bcrypt.hash('Provider@1234', 10),
        fullName: pd.name,
        phoneNumber: pd.phone,
        roles: ['ROLE_PROVIDER'],
        active: true,
        suspended: false
      });
    } else {
      currentUserId = Math.max(currentUserId, u.id);
    }

    let pp = await ProviderProfile.findOne({ userId: u.id });
    if (!pp) {
      pp = await ProviderProfile.create({
        id: i + 1,
        userId: u.id,
        businessName: pd.name,
        bio: pd.bio,
        yearsOfExperience: pd.exp,
        baseRate: pd.base,
        hourlyRate: pd.hourly,
        city: pd.city,
        serviceAreaRadiusKm: pd.radius,
        latitude: pd.lat,
        longitude: pd.lng,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        available: true,
        categoryIds: pd.cats
      });
    }
    providers.push(pp);
  }
  await syncCounter('provider_profiles', providers.length);
  await syncCounter('users', currentUserId);

  // 5. JOBS
  const sampleJobs = [
    { empIdx: 0, title: 'Senior Bricklayer & Mason Required for Commercial Renovation', desc: 'Need 2 skilled masons for high-precision brickwork and exterior cement plastering for a 5-day project.', type: 'DAILY_WAGE', wage: 1000, days: 5, city: 'Bangalore', area: 'Indiranagar', lat: 12.9716, lng: 77.5946, status: 'OPEN', skills: [1] },
    { empIdx: 0, title: 'Emergency Commercial Electrical Cable Pulling & Conduit Fitting', desc: 'Heavy gauge cable pulling and metal conduit fixing for new commercial retail floor.', type: 'DAILY_WAGE', wage: 1100, days: 3, city: 'Bangalore', area: 'Indiranagar', lat: 12.9716, lng: 77.5946, status: 'OPEN', skills: [4] },
    { empIdx: 1, title: 'Master Carpenter Needed for Teak Wood Wardrobes & Modular Kitchen', desc: 'Precision joinery, hinge alignment, and laminate pasting for high-end residential apartment.', type: 'DAILY_WAGE', wage: 1200, days: 6, city: 'Bangalore', area: 'Koramangala', lat: 12.9352, lng: 77.6245, status: 'OPEN', skills: [2] },
    { empIdx: 1, title: 'Full Villa Exterior Waterproofing & Primer Painting', desc: 'Exterior scaffolding work, crack filling, and weather-shield paint application for 3-story villa.', type: 'CONTRACT', wage: 950, days: 7, city: 'Bangalore', area: 'Whitefield', lat: 12.9698, lng: 77.7500, status: 'OPEN', skills: [5] },
    { empIdx: 0, title: 'Italian Marble & Vitrified Tile Layer Required', desc: 'Laser leveling and diamond cutter fixing for 2,400 sq.ft living hall tile replacement.', type: 'DAILY_WAGE', wage: 1050, days: 4, city: 'Bangalore', area: 'Jayanagar', lat: 12.9308, lng: 77.5838, status: 'OPEN', skills: [6] },
    { empIdx: 0, title: 'Heavy Warehouse Cargo Loading & Shifting Crew', desc: 'Loading heavy construction materials, cement bags, and steel rods onto transport trucks.', type: 'DAILY_WAGE', wage: 800, days: 2, city: 'Bangalore', area: 'Electronic City', lat: 12.8452, lng: 77.6602, status: 'OPEN', skills: [8] },
    { empIdx: 1, title: 'Structural Metal Fabrication & Grille Welder', desc: 'Arc welding of heavy steel security gates, terrace railings, and MS window grilles.', type: 'DAILY_WAGE', wage: 1150, days: 5, city: 'Bangalore', area: 'HSR Layout', lat: 12.9121, lng: 77.6446, status: 'IN_PROGRESS', skills: [7] },
    { empIdx: 0, title: 'Residential Plumbing Line Installation for 3-Story Apartment', desc: 'CPVC pipeline laying, drainage manifold fixing, and overhead tank connection.', type: 'DAILY_WAGE', wage: 950, days: 6, city: 'Bangalore', area: 'Bellandur', lat: 12.9304, lng: 77.6784, status: 'OPEN', skills: [3] },
    { empIdx: 0, title: 'Construction Site Excavation & Earth Moving Helper', desc: 'Manual foundation trench excavation, soil shifting, and backfilling for boundary wall.', type: 'DAILY_WAGE', wage: 750, days: 4, city: 'Bangalore', area: 'Indiranagar', lat: 12.9716, lng: 77.5946, status: 'OPEN', skills: [9] },
    { empIdx: 1, title: 'RCC Column Steel Bar Bending Specialist', desc: 'Tying and bending 16mm and 20mm TMT steel reinforcement cages for residential pillars.', type: 'DAILY_WAGE', wage: 1000, days: 4, city: 'Bangalore', area: 'Whitefield', lat: 12.9698, lng: 77.7500, status: 'OPEN', skills: [10] },
    { empIdx: 1, title: 'Interior Acrylic Wall Painting & Wall Putty Finish', desc: 'Complete two coats of Birla putty, primer sanding, and Asian Paints Royale application.', type: 'CONTRACT', wage: 900, days: 5, city: 'Bangalore', area: 'Koramangala', lat: 12.9352, lng: 77.6245, status: 'CLOSED', skills: [5] },
    { empIdx: 0, title: 'Commercial HVAC & Duct Piping Assistant', desc: 'Assisting senior AC mechanics with refrigerant copper piping and insulation wrapping.', type: 'DAILY_WAGE', wage: 1100, days: 3, city: 'Bangalore', area: 'Electronic City', lat: 12.8452, lng: 77.6602, status: 'OPEN', skills: [3] },
    // Regular employment jobs
    { empIdx: 0, title: 'Retail Store Salesman & Shop Assistant Required', desc: 'Seeking an energetic retail salesman for garments and accessories shop. Responsibilities include customer greeting, item display, stock inventory, and assisting shoppers.', type: 'REGULAR', wage: 700, days: 365, city: 'Bangalore', area: 'Indiranagar', lat: 12.9716, lng: 77.5946, status: 'OPEN', skills: [11], minSalary: 18000, maxSalary: 24000, hours: '10:00 AM - 8:30 PM (6 days/week)' },
    { empIdx: 1, title: 'Showroom Cashier & Billing Executive', desc: 'Looking for a punctual and reliable cashier for an electronic retail showroom. Candidate should handle POS billing, cash counting, card swiping, and daily invoice reconciliation.', type: 'REGULAR', wage: 800, days: 365, city: 'Bangalore', area: 'Koramangala', lat: 12.9352, lng: 77.6245, status: 'OPEN', skills: [13], minSalary: 20000, maxSalary: 26000, hours: '9:30 AM - 7:30 PM (Mon-Sat)' },
    { empIdx: 0, title: 'Commercial Office Assistant & General Helper', desc: 'Hiring a full-time office assistant for commercial office maintenance. Duties include managing daily files, courier packages, tea/coffee service, and office errands.', type: 'REGULAR', wage: 650, days: 365, city: 'Bangalore', area: 'Electronic City', lat: 12.8452, lng: 77.6602, status: 'OPEN', skills: [14], minSalary: 16000, maxSalary: 22000, hours: '9:00 AM - 6:00 PM (Mon-Sat)' },
    { empIdx: 1, title: 'Hardware & Electrical Shop Assistant & Counter Sales', desc: 'Hardware shop looking for assistant to handle inventory stocking, customer counter queries, and material loading for electrical goods.', type: 'REGULAR', wage: 750, days: 365, city: 'Bangalore', area: 'Whitefield', lat: 12.9698, lng: 77.7500, status: 'OPEN', skills: [12], minSalary: 18000, maxSalary: 25000, hours: '10:00 AM - 8:00 PM' }
  ];

  const jobs = [];
  for (let i = 0; i < sampleJobs.length; i++) {
    const sj = sampleJobs[i];
    const emp = employers[sj.empIdx] || employers[0];
    let j = await Job.findOne({ title: sj.title });
    if (!j) {
      j = await Job.create({
        id: i + 1,
        employerId: emp.id,
        title: sj.title,
        description: sj.desc,
        jobType: sj.type,
        dailyWage: sj.wage,
        minMonthlySalary: sj.minSalary || null,
        maxMonthlySalary: sj.maxSalary || null,
        workingHours: sj.hours || null,
        estimatedDays: sj.days,
        city: sj.city,
        area: sj.area,
        latitude: sj.lat,
        longitude: sj.lng,
        status: sj.status,
        requiredSkillIds: sj.skills
      });
    }
    jobs.push(j);
  }
  await syncCounter('jobs', jobs.length);

  // 6. JOB APPLICATIONS
  if (workers.length >= 5 && jobs.length >= 9) {
    const appData = [
      { jobIdx: 0, wIdx: 0, status: 'ACCEPTED', bid: 1000, note: 'Ready to start immediately. Have 8 years masonry experience with clean line work.' },
      { jobIdx: 8, wIdx: 0, status: 'SHORTLISTED', bid: 750, note: 'Can bring a team of 2 helpers if required for site excavation.' },
      { jobIdx: 5, wIdx: 0, status: 'APPLIED', bid: 800, note: 'Available for cargo handling shifts this weekend.' },
      { jobIdx: 2, wIdx: 1, status: 'ACCEPTED', bid: 1200, note: 'Expert in Blum fittings and Godrej lock mechanisms. Own power tools.' },
      { jobIdx: 0, wIdx: 1, status: 'REJECTED', bid: 950, note: 'Available for construction helper tasks if carpentry is not needed.' },
      { jobIdx: 6, wIdx: 1, status: 'UNDER_REVIEW', bid: 1100, note: 'Have experience in metal framing and door shutter fixing.' },
      { jobIdx: 1, wIdx: 2, status: 'ACCEPTED', bid: 1100, note: 'Licensed wireman. Done commercial electrical conduit installations for IT parks.' },
      { jobIdx: 7, wIdx: 2, status: 'APPLIED', bid: 950, note: 'Can do bathroom concealed pipe routing and pressure testing.' },
      { jobIdx: 6, wIdx: 2, status: 'REJECTED', bid: 1200, note: 'Can assist with welding electrical points setup.' },
      { jobIdx: 3, wIdx: 3, status: 'SHORTLISTED', bid: 950, note: 'Specialized in exterior Dr. Fixit waterproofing and roller finish.' },
      { jobIdx: 4, wIdx: 4, status: 'ACCEPTED', bid: 1050, note: 'Italian marble specialist. Have precision angle cutters and spacers.' },
      { jobIdx: 0, wIdx: 4, status: 'UNDER_REVIEW', bid: 1000, note: 'Can assist with bricklaying and wall plastering.' },
      { jobIdx: 7, wIdx: 0, status: 'APPLIED', bid: 950, note: 'Experienced with pipe trenching and sanitary drainage fitting.' },
      { jobIdx: 1, wIdx: 4, status: 'REJECTED', bid: 1100, note: 'Willing to assist electrical team with floor chiseling.' }
    ];

    let appId = 0;
    for (const ad of appData) {
      const targetJob = jobs[ad.jobIdx] || jobs[0];
      const targetWorker = workers[ad.wIdx] || workers[0];
      const existing = await JobApplication.findOne({ jobId: targetJob.id, workerId: targetWorker.id });
      if (!existing) {
        appId++;
        await JobApplication.create({
          id: appId,
          jobId: targetJob.id,
          workerId: targetWorker.id,
          status: ad.status,
          bidAmount: ad.bid,
          coverNote: ad.note
        });
      } else {
        appId = Math.max(appId, existing.id);
      }
    }
    await syncCounter('job_applications', appId);
  }

  // 7. SERVICE REQUESTS
  if (customers.length >= 3 && providers.length >= 4) {
    const reqData = [
      { cIdx: 0, pIdx: 0, catId: 1, title: 'Bathroom tap leakage & angle valve replacement', desc: 'Water leaking continuously from master bathroom washbasin hot/cold mixer and angle stop valve.', addr: 'Flat 302, Green Glen Layout, Bellandur', city: 'Bangalore', lat: 12.9304, lng: 77.6784, status: 'COMPLETED', est: 450, final: 450 },
      { cIdx: 1, pIdx: 1, catId: 2, title: 'Living room main circuit breaker tripping repair', desc: 'MCB trips whenever AC and geyser are switched on simultaneously. Needs load rebalancing.', addr: '14th Main, Sector 4, HSR Layout', city: 'Bangalore', lat: 12.9121, lng: 77.6446, status: 'COMPLETED', est: 650, final: 650 },
      { cIdx: 2, pIdx: 2, catId: 3, title: 'Wooden front door lock alignment & latch replacement', desc: 'Main entrance door latch is jammed and rubbing against the wooden frame.', addr: 'Palm Meadows Villa 42, Whitefield', city: 'Bangalore', lat: 12.9698, lng: 77.7500, status: 'SERVICE_STARTED', est: 450, final: null },
      { cIdx: 0, pIdx: 0, catId: 1, title: 'Kitchen sink drain pipe blockage clearing', desc: 'Heavy grease clog in kitchen sink drainage manifold causing water backflow.', addr: 'Flat 302, Green Glen Layout, Bellandur', city: 'Bangalore', lat: 12.9304, lng: 77.6784, status: 'ON_THE_WAY', est: 350, final: null },
      { cIdx: 1, pIdx: 3, catId: 4, title: 'Bedroom dampness inspection & wall putty touchup', desc: 'Water seepage mark on bedroom east wall requiring scraping, primer sealing, and putty touchup.', addr: '14th Main, Sector 4, HSR Layout', city: 'Bangalore', lat: 12.9121, lng: 77.6446, status: 'ACCEPTED', est: 1200, final: null },
      { cIdx: 2, pIdx: 1, catId: 2, title: 'Ceiling fan motor winding & speed regulator replacement', desc: 'Master bedroom Havells fan running very slowly with burnt smell. Regulator also sparky.', addr: 'Palm Meadows Villa 42, Whitefield', city: 'Bangalore', lat: 12.9698, lng: 77.7500, status: 'REQUESTED', est: 400, final: null },
      { cIdx: 0, pIdx: 0, catId: 1, title: 'Overhead water tank float valve replacement', desc: 'Rooftop Sintex water tank overflow valve stuck open, causing water overflow.', addr: 'Flat 302, Green Glen Layout, Bellandur', city: 'Bangalore', lat: 12.9304, lng: 77.6784, status: 'REQUESTED', est: 500, final: null },
      { cIdx: 1, pIdx: 2, catId: 3, title: 'Balcony sliding mesh door adjustment', desc: 'Balcony mosquito mesh door jumped off aluminum bottom track.', addr: '14th Main, Sector 4, HSR Layout', city: 'Bangalore', lat: 12.9121, lng: 77.6446, status: 'CANCELLED', est: 500, final: null, cancelReason: 'Customer rescheduled due to travel' }
    ];

    let reqId = 0;
    for (const rd of reqData) {
      const c = customers[rd.cIdx];
      const p = providers[rd.pIdx];
      let sr = await ServiceRequest.findOne({ title: rd.title });
      if (!sr) {
        reqId++;
        sr = await ServiceRequest.create({
          id: reqId,
          customerId: c.id,
          providerId: p.id,
          categoryId: rd.catId,
          title: rd.title,
          description: rd.desc,
          serviceAddress: rd.addr,
          city: rd.city,
          latitude: rd.lat,
          longitude: rd.lng,
          status: rd.status,
          estimatedCost: rd.est,
          finalCost: rd.final,
          cancellationReason: rd.cancelReason || null,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      } else {
        reqId = Math.max(reqId, sr.id);
      }
    }
    await syncCounter('service_requests', reqId);
  }

  // 8. REVIEWS
  const sr1 = await ServiceRequest.findOne({ title: 'Bathroom tap leakage & angle valve replacement' });
  let reviewCount = 0;
  if (sr1) {
    const c = await CustomerProfile.findOne({ id: sr1.customerId });
    const p = await ProviderProfile.findOne({ id: sr1.providerId });
    if (c && p) {
      const revExists = await Review.findOne({ reviewerId: c.userId, serviceRequestId: sr1.id });
      if (!revExists) {
        reviewCount++;
        await Review.create({
          id: reviewCount,
          reviewerId: c.userId,
          revieweeId: p.userId,
          serviceRequestId: sr1.id,
          rating: 5,
          reviewText: 'Prompt arrival! Sunil detected the cracked angle valve immediately and replaced it in 30 minutes. Clean and tidy work.'
        });
      }
    }
  }

  const sr2 = await ServiceRequest.findOne({ title: 'Living room main circuit breaker tripping repair' });
  if (sr2) {
    const c = await CustomerProfile.findOne({ id: sr2.customerId });
    const p = await ProviderProfile.findOne({ id: sr2.providerId });
    if (c && p) {
      const revExists = await Review.findOne({ reviewerId: c.userId, serviceRequestId: sr2.id });
      if (!revExists) {
        reviewCount++;
        await Review.create({
          id: reviewCount,
          reviewerId: c.userId,
          revieweeId: p.userId,
          serviceRequestId: sr2.id,
          rating: 5,
          reviewText: 'Very knowledgeable electrician. Identified an overloaded circuit and balanced the phase lines perfectly. High quality work.'
        });
      }
    }
  }

  const j1 = await Job.findOne({ title: 'Senior Bricklayer & Mason Required for Commercial Renovation' });
  if (j1 && employers.length > 0 && workers.length > 0) {
    const emp = employers[0];
    const w = workers[0];
    const revExists = await Review.findOne({ reviewerId: emp.userId, jobId: j1.id });
    if (!revExists) {
      reviewCount++;
      await Review.create({
        id: reviewCount,
        reviewerId: emp.userId,
        revieweeId: w.userId,
        jobId: j1.id,
        rating: 5,
        reviewText: 'Suresh is an exceptional bricklayer. Punctual, honest, and delivered pristine plaster joint finish. Highly recommended.'
      });
    }
  }
  await syncCounter('reviews', reviewCount);

  // 9. COMPLAINTS
  if (customers.length >= 3 && providers.length >= 4) {
    const comp1 = await Complaint.findOne({ subject: 'Slight delay in scheduled carpentering visit' });
    let compId = 0;
    if (!comp1) {
      compId++;
      await Complaint.create({
        id: compId,
        complainantId: customers[1].userId,
        reportedUserId: providers[2].userId,
        subject: 'Slight delay in scheduled carpentering visit',
        description: 'Provider arrived 45 minutes later than confirmed appointment slot without advance notice.',
        status: 'RESOLVED',
        adminResolutionNotes: 'Provider apologized in writing and issued a 10% goodwill voucher for next booking. Dispute closed satisfactorily.',
        resolvedByAdminId: adminUser.id
      });
    }

    const comp2 = await Complaint.findOne({ subject: 'Dispute over unquoted wall prep charges' });
    if (!comp2) {
      compId++;
      await Complaint.create({
        id: compId,
        complainantId: customers[2].userId,
        reportedUserId: providers[3].userId,
        subject: 'Dispute over unquoted wall prep charges',
        description: 'Painter requested additional Rs 400 for wall primer that was verbally agreed as included in base quote.',
        status: 'INVESTIGATING'
      });
    }
    await syncCounter('complaints', compId);
  }

  // 10. AUDIT LOGS
  const logCount = await AuditLog.countDocuments();
  if (logCount === 0) {
    await AuditLog.create([
      { id: 1, userId: adminUser.id, action: 'VERIFY_PROVIDER', entityName: 'ProviderProfile', entityId: 1, details: 'Provider Sunil Master Plumbers approved after ID verification', ipAddress: '127.0.0.1' },
      { id: 2, userId: adminUser.id, action: 'RESOLVE_COMPLAINT', entityName: 'Complaint', entityId: 1, details: 'Complaint regarding appointment delay resolved amicably', ipAddress: '127.0.0.1' },
      { id: 3, userId: adminUser.id, action: 'CATALOG_UPDATE', entityName: 'ServiceCategory', entityId: 1, details: 'Verified category active status for plumbing services', ipAddress: '127.0.0.1' }
    ]);
    await syncCounter('audit_logs', 3);
  }

  console.log('[Seed] Seeding completed successfully.');
}

if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('./db');
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}

module.exports = seedDatabase;

