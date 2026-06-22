export type PortalType = 'apartment' | 'university' | 'office';

export interface Portal {
  id: string;
  name: string;
  type: PortalType;
  floorsCount: number;
  unitsPerFloor: string; // e.g. "Flat A, Flat B" or "Room 101, Room 102"
}

export type UserRole = 'supervisor' | 'collector' | 'resident' | 'donor';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  portalId: string;
  faceTrained?: boolean;
}

export interface WasteAlert {
  id: string;
  portalId: string;
  floor: number;
  status: 'pending' | 'collecting' | 'completed' | 'alerted';
  image?: string;
  imageUrl?: string;
  aiClassification?: {
    category: string;
    recyclability: string;
    instructions: string;
    estimatedWeight: string;
    carbonOffset: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlatAlertNotification {
  id: string;
  portalId: string;
  floor: number;
  title: string;
  body: string;
  senderName: string;
  createdAt: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Complaint {
  id: string;
  portalId: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: 'delay' | 'missed' | 'spilt' | 'sorting_issue' | 'others';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  adminNotes?: string;
}

export interface DonationItem {
  id: string;
  donorName: string;
  donorContact?: string;
  title: string;
  category: 'clothes' | 'food' | 'books' | 'others';
  quantity: string;
  description: string;
  imageUrl?: string;
  status: 'available' | 'claimed';
  claimedByNGO?: string;
  createdAt: string;
  aiAudit?: string; // AI generated quality report or tags
}

export interface ImpactMetrics {
  totalWasteCollectedKg: number;
  recycledPercentage: number;
  compostedPercentage: number;
  landfillDivertedKg: number;
  activePortalsCount: number;
  citizenParticipationCount: number;
  carbonSavedKg: number;
  donationsDistributed: number;
  compostGeneratedKg: number;
}

export interface PortalImpact {
  portalId: string;
  portalName: string;
  portalType: PortalType;
  wetWasteKg: number;
  dryWasteKg: number;
  eWasteKg: number;
  hazardWasteKg: number;
  participationRate: number; // 0 to 100
}
