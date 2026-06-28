import fs from 'fs/promises';
import path from 'path';
import { 
  Portal, 
  User, 
  WasteAlert, 
  FlatAlertNotification, 
  Complaint, 
  DonationItem, 
  ImpactMetrics, 
  PortalImpact 
} from '../src/types';

const DB_FILE = path.join(process.cwd(), 'data-store.json');

interface Schema {
  portals: Portal[];
  users: User[];
  alerts: WasteAlert[];
  notifications: FlatAlertNotification[];
  complaints: Complaint[];
  donations: DonationItem[];
}

const DEFAULT_PORTALS: Portal[] = [
  {
    id: 'portal-1',
    name: 'Greenwood Residency',
    type: 'apartment',
    floorsCount: 8,
    unitsPerFloor: 'Flat A, Flat B, Flat C, Flat D'
  },
  {
    id: 'portal-2',
    name: 'Turing Tech Park',
    type: 'office',
    floorsCount: 5,
    unitsPerFloor: 'East Wing, West Wing'
  },
  {
    id: 'portal-3',
    name: 'Apex Global University',
    type: 'university',
    floorsCount: 4,
    unitsPerFloor: 'Block A, Block B, Block C'
  }
];

const DEFAULT_USERS: User[] = [
  { id: 'user-1', username: 'sup_greenwood', name: 'Shyamal Sen (Caretaker)', role: 'supervisor', portalId: 'portal-1' },
  { id: 'user-2', username: 'col_ram', name: 'Ramlal Kumar', role: 'collector', portalId: 'portal-1', faceTrained: true },
  { id: 'user-3', username: 'res_flat101', name: 'Dr. Alok Verma (Floor 1)', role: 'resident', portalId: 'portal-1' },
  { id: 'user-4', username: 'res_flat302', name: 'Priya Sharma (Floor 3)', role: 'resident', portalId: 'portal-1' },
  { id: 'user-5', username: 'res_flat504', name: 'Kabir Mehta (Floor 5)', role: 'resident', portalId: 'portal-1' },

  { id: 'user-6', username: 'sup_turing', name: 'Aditya Roy (Facility Mgr)', role: 'supervisor', portalId: 'portal-2' },
  { id: 'user-7', username: 'col_shankar', name: 'Shankar Lal', role: 'collector', portalId: 'portal-2', faceTrained: true },

  { id: 'user-8', username: 'sup_apex', name: 'Prof. S. R. Chawla', role: 'supervisor', portalId: 'portal-3' },
  { id: 'user-9', username: 'col_babu', name: 'Babulal Prasad', role: 'collector', portalId: 'portal-3', faceTrained: false }
];

const DEFAULT_ALERTS: WasteAlert[] = [
  {
    id: 'alert-1',
    portalId: 'portal-1',
    floor: 3,
    status: 'completed',
    notes: 'Floor clean-up complete, wet waste sorted.',
    aiClassification: {
      category: 'Organic Waste',
      recyclability: '100% Compostable',
      instructions: 'Deposit in the basement community composting bin. Cover with dry leaves.',
      estimatedWeight: '4.5 Kg',
      carbonOffset: '1.2 Kg CO2e'
    },
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2.5 * 3600000).toISOString()
  },
  {
    id: 'alert-2',
    portalId: 'portal-1',
    floor: 5,
    status: 'collecting',
    notes: 'Collecting cardboard and glass bottles.',
    aiClassification: {
      category: 'Recyclable Dry Waste',
      recyclability: 'High',
      instructions: 'Separate cardboards from glass. Flatten boxes box-crates for dry-vault.',
      estimatedWeight: '7.2 Kg',
      carbonOffset: '3.4 Kg CO2e'
    },
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'alert-3',
    portalId: 'portal-2',
    floor: 2,
    status: 'pending',
    notes: 'Coffee cups heap observed outside cafeteria pantry.',
    aiClassification: {
      category: 'Paper/Plastic Mixed',
      recyclability: 'Partial (requires washing)',
      instructions: 'Rinse coffee cups first before dry segregation. Move plastic covers to recycler box.',
      estimatedWeight: '2.1 Kg',
      carbonOffset: '0.5 Kg CO2e'
    },
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString()
  }
];

const DEFAULT_NOTIFICATIONS: FlatAlertNotification[] = [
  {
    id: 'notif-1',
    portalId: 'portal-1',
    floor: 3,
    title: 'Waste Collector Active on Floor 3',
    body: 'Ramlal is currently visiting Floor 3. Please place your sorted segregations (wet/dry) outside your door immediately.',
    senderName: 'Ramlal Kumar (Collector)',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    severity: 'medium'
  },
  {
    id: 'notif-2',
    portalId: 'portal-1',
    floor: 5,
    title: 'Floor 5 Dry Cleanup Alert',
    body: 'Caretaker Notice: Dry waste bags collection is underway on Floor 5. Do not empty household wet organic trash currently.',
    senderName: 'Shyamal Sen (Caretaker)',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    severity: 'high'
  },
  {
    id: 'notif-3',
    portalId: 'portal-1',
    floor: 1,
    title: '[AI Classification: CRITICAL] Bin Image Analysis - Level 1 Main Bin is 100% Full',
    body: 'AI Vision Alert: Camera at Level 1 lobby has analyzed the main dry waste bin and classified its status as CRITICAL (100% Capacity exceeded). Hazardous overflow is imminent. Cleanup crew dispatched immediately.',
    senderName: 'AI Safety Monitor',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    severity: 'high'
  },
  {
    id: 'notif-4',
    portalId: 'portal-1',
    floor: 3,
    title: '[AI Classification: FULL] Bin Image Analysis - Level 3 Lobby Wet Bin is 90% Full',
    body: 'AI Vision Alert: Camera at Level 3 elevator lobby has analyzed the organic wet bin and classified its status as FULL (90% capacity). Emptying requested before odor leakage.',
    senderName: 'AI Safety Monitor',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    severity: 'medium'
  }
];

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-1',
    portalId: 'portal-1',
    userId: 'user-3',
    userName: 'Dr. Alok Verma',
    title: 'Spilt liquid on Floor 1 lobby',
    description: 'The collector bin had a pinhole leakage which left dirty smell and traces near Flat 101. Request immediate mopping.',
    category: 'spilt',
    status: 'investigating',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'comp-2',
    portalId: 'portal-1',
    userId: 'user-4',
    userName: 'Priya Sharma',
    title: 'Missed collection on Monday',
    description: 'Floor 3 collection was completed but Flat 302 trash bags were left over due to timing mismatch.',
    category: 'missed',
    status: 'resolved',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    adminNotes: 'Addressed. Ramlal re-visited Flat 302 and gathered the pending scrap.'
  }
];

const DEFAULT_DONATIONS: DonationItem[] = [
  {
    id: 'don-1',
    donorName: 'Dr. Alok Verma',
    donorContact: '9876543210',
    title: 'Engineering Textbooks Set (12 books)',
    category: 'books',
    quantity: '1 Box',
    description: 'Standard civil/electrical pre-requisite engineering college textbooks. Completely legible, minimal highlights.',
    status: 'available',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    aiAudit: 'Audit: Verified non-commercial textbooks. Intact bindings. 4/5 rating.'
  },
  {
    id: 'don-2',
    donorName: 'Kabir Mehta',
    donorContact: '9988776655',
    title: 'Medium Woolen Sweaters and Blankets',
    category: 'clothes',
    quantity: '8 Items',
    description: 'Cleaned, pre-washed winter clothes fit for adults and teens. Suitable for shelter distributed distribution.',
    status: 'claimed',
    claimedByNGO: 'Hope Foundation Shelter',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    aiAudit: 'Audit: Hygiene checklist checked. Safe for distribute.'
  },
  {
    id: 'don-3',
    donorName: 'Siddharth Jain',
    donorContact: '9898980011',
    title: 'Non-Perishable Grains and Pulses pak',
    category: 'food',
    quantity: '5 Kg',
    description: 'Sealed pulses, rice and wheat packets. Expiry date valid till Nov 2027.',
    status: 'available',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    aiAudit: 'Audit: Shelf-life verified active. Highly essential category.'
  }
];

export async function initDb() {
  try {
    await fs.access(DB_FILE);
  } catch {
    // Write defaults if not existing
    const initialData: Schema = {
      portals: DEFAULT_PORTALS,
      users: DEFAULT_USERS,
      alerts: DEFAULT_ALERTS,
      notifications: DEFAULT_NOTIFICATIONS,
      complaints: DEFAULT_COMPLAINTS,
      donations: DEFAULT_DONATIONS
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export async function readDb(): Promise<Schema> {
  await initDb();
  const raw = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

export async function writeDb(data: Schema): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Portals CRUD
export async function getPortals(): Promise<Portal[]> {
  const db = await readDb();
  return db.portals;
}

export async function savePortal(portal: Portal): Promise<Portal> {
  const db = await readDb();
  db.portals.push(portal);
  await writeDb(db);
  return portal;
}

// Users CRUD
export async function getUsers(): Promise<User[]> {
  const db = await readDb();
  return db.users;
}

export async function createUser(user: User): Promise<User> {
  const db = await readDb();
  db.users.push(user);
  await writeDb(db);
  return user;
}

// Alerts CRUD
export async function getAlerts(): Promise<WasteAlert[]> {
  const db = await readDb();
  return db.alerts;
}

export async function saveAlert(alert: WasteAlert): Promise<WasteAlert> {
  const db = await readDb();
  const index = db.alerts.findIndex(a => a.id === alert.id);
  if (index >= 0) {
    db.alerts[index] = alert;
  } else {
    db.alerts.push(alert);
  }
  await writeDb(db);
  return alert;
}

// Notifications CRUD
export async function getNotifications(): Promise<FlatAlertNotification[]> {
  const db = await readDb();
  return db.notifications;
}

export async function saveNotification(notif: FlatAlertNotification): Promise<FlatAlertNotification> {
  const db = await readDb();
  db.notifications.unshift(notif); // Newest first
  await writeDb(db);
  return notif;
}

// Complaints
export async function getComplaints(): Promise<Complaint[]> {
  const db = await readDb();
  return db.complaints;
}

export async function saveComplaint(complaint: Complaint): Promise<Complaint> {
  const db = await readDb();
  const index = db.complaints.findIndex(c => c.id === complaint.id);
  if (index >= 0) {
    db.complaints[index] = complaint;
  } else {
    db.complaints.push(complaint);
  }
  await writeDb(db);
  return complaint;
}

// Donations
export async function getDonations(): Promise<DonationItem[]> {
  const db = await readDb();
  return db.donations;
}

export async function saveDonation(don: DonationItem): Promise<DonationItem> {
  const db = await readDb();
  const index = db.donations.findIndex(d => d.id === don.id);
  if (index >= 0) {
    db.donations[index] = don;
  } else {
    db.donations.push(don);
  }
  await writeDb(db);
  return don;
}

// Detailed calculation of statistics for the portal dashboard
export async function getMetricDashboard(): Promise<ImpactMetrics> {
  const db = await readDb();
  
  // Calculate aggregate metrics dynamically from our mock & actual entries
  const completedAlerts = db.alerts.filter(a => a.status === 'completed');
  
  // Base constants + incremental additions based on actions
  const baseWasteCollected = 1845.5; 
  const addedWaste = completedAlerts.reduce((sum, current) => {
    if (current.aiClassification?.estimatedWeight) {
      const parsed = parseFloat(current.aiClassification.estimatedWeight.replace(/[^\d.]/g, ''));
      return sum + (isNaN(parsed) ? 1.5 : parsed);
    }
    return sum + 2.5; // default 2.5Kg per collection
  }, 0);

  const totalWasteCollectedKg = Number((baseWasteCollected + addedWaste).toFixed(1));
  const activePortalsCount = db.portals.length;
  const citizenParticipationCount = db.users.filter(u => u.role === 'resident' || u.role === 'donor').length + 85; 
  
  // Carbon savings: average 0.45 Kg CO2 saved per Kg of waste recycled/diverted properly
  const carbonSavedKg = Number((totalWasteCollectedKg * 0.43 + 350).toFixed(1));

  const totalDonations = db.donations.length;
  const DonationsMatched = db.donations.filter(d => d.status === 'claimed').length;
  
  return {
    totalWasteCollectedKg,
    recycledPercentage: 58, 
    compostedPercentage: 34,
    landfillDivertedKg: Number((totalWasteCollectedKg * 0.92).toFixed(1)),
    activePortalsCount,
    citizenParticipationCount,
    carbonSavedKg,
    donationsDistributed: 15 + DonationsMatched, 
    compostGeneratedKg: Number((totalWasteCollectedKg * 0.28).toFixed(1))
  };
}

export async function getEntitiesImpact(): Promise<PortalImpact[]> {
  const db = await readDb();
  
  return db.portals.map(p => {
    // Generate deterministic values or increment according to historical data
    let wet = 120;
    let dry = 145;
    let e = 30;
    let haz = 12;
    let rate = 82;

    if (p.id === 'portal-1') {
      wet = 425.5; dry = 380.2; e = 41.5; haz = 18.0; rate = 91;
    } else if (p.id === 'portal-2') {
      wet = 180.3; dry = 560.8; e = 240.5; haz = 85.2; rate = 86;
    } else if (p.id === 'portal-3') {
      wet = 310.4; dry = 412.3; e = 88.0; haz = 40.5; rate = 78;
    }

    // Include dynamically added alerts
    const alertsForPortal = db.alerts.filter(a => a.portalId === p.id && a.status === 'completed');
    alertsForPortal.forEach(al => {
      const wtStr = al.aiClassification?.estimatedWeight || '2.0';
      const wt = parseFloat(wtStr.replace(/[^\d.]/g, '')) || 2.0;

      if (al.aiClassification?.category.toLowerCase().includes('organic') || al.aiClassification?.category.toLowerCase().includes('wet')) {
        wet = Number((wet + wt).toFixed(1));
      } else if (al.aiClassification?.category.toLowerCase().includes('electronic') || al.aiClassification?.category.toLowerCase().includes('e-waste')) {
        e = Number((e + wt).toFixed(1));
      } else if (al.aiClassification?.category.toLowerCase().includes('hazard') || al.aiClassification?.category.toLowerCase().includes('chemical')) {
        haz = Number((haz + wt).toFixed(1));
      } else {
        dry = Number((dry + wt).toFixed(1));
      }
    });

    return {
      portalId: p.id,
      portalName: p.name,
      portalType: p.type,
      wetWasteKg: wet,
      dryWasteKg: dry,
      eWasteKg: e,
      hazardWasteKg: haz,
      participationRate: rate
    };
  });
}
