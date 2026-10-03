export type ScreenType = 
  | 'garden' 
  | 'scanner' 
  | 'identify' 
  | 'placement' 
  | 'aurascore' 
  | 'care-detail' 
  | 'missions' 
  | 'timeline' 
  | 'profile'
  | 'login'
  | 'farm-setup';

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  nickname: string;
  daysPlanted: number;
  auraScore: number;
  plantMatchScore: number;
  source?: 'ai' | 'manual';
  location: string;
  sunlight: string;
  image: string;
  pixelSprite: string;
  potType: 'terracotta' | 'porcelain' | 'wood' | 'clay';
  features: string[];
  careStatus: 'good' | 'needs-water' | 'needs-wipe' | 'happy';
  lastWatered: string;
  lastCheckedMoisture?: string;
  identification?: PlantIdentification;
  imagePath?: string;
  createdAt?: string;
  lastWateredAt?: string | null;
  lastCheckedAt?: string | null;
  careHistory?: {id:string;date:string;label:string}[];
}

export interface Task {
  kind?: 'moisture' | 'wipe' | 'photo';
  id: string;
  title: string;
  reward: string;
  rewardPoints: number;
  plantId: string;
  plantName: string;
  plantSpecies: string;
  icon: string;
  iconBg: string;
  instruction: string;
  tip: string;
  isCompleted: boolean;
  actionText: string;
  statusText?: string;
}

export interface Badge {
  id: string;
  name: string;
  status: 'unlocked' | 'locked';
  statusLabel: string;
  description: string;
  icon: string;
  progressText: string;
}

export interface TimelinePhoto {
  id: string;
  plantId: string;
  date: string;
  badgeLabel: string;
  badgeIcon: string;
  badgeColor: string;
  photoUrl: string;
  caption: string;
  isLatest?: boolean;
  stepNumber?: number;
  plantMatchScore?: number;
  careActivity?: string;
  notes?: string;
}

export interface UserProfile {
  farmName: string | null;
  name: string;
  level: number;
  auraScore: number;
  title: string;
  exp: number;
  maxExp: number;
  coins: number;
  daysStreak: number;
  avatarUrl: string;
  plantCount: number;
  completedTasksCount: number;
}

export interface PlacementConfig {
  location: 'indoor' | 'window' | 'balcony' | 'porch';
  light: 'low' | 'medium' | 'high';
}

export type { PlantCandidate, PlantIdentification } from '../supabase/functions/_shared/identification';
import type { PlantIdentification } from '../supabase/functions/_shared/identification';
export interface ScanResult {
  scanId: string;
  imagePath: string;
  image: string;
  identification: PlantIdentification;
}
