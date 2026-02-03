
export enum UserRole {
  ADMIN = 'ADMIN',
  ACS = 'ACS'
}

export const PSF_LIST = [
  "PSF CANUDOS",
  "PSF CAROLINA",
  "PSF VARZEA",
  "PSF ARNOLD",
  "PSF NOEME TELES"
];

export interface Member {
  id: string;
  fullName: string;
  cpf: string;
  cns: string;
  birthDate: string;
  password?: string;
  gender?: 'Masculino' | 'Feminino' | 'Outro';
  workplace?: string;
  microArea: string;
  team: string;
  areaType: 'Rural' | 'Urbana';
  profileImage?: string;
  registrationDate: string;
  status: 'Ativo' | 'Pendente';
  role: UserRole;
  accessCount?: number; 
  isOnline?: boolean; 
  lastSeen?: string; // ISO String da última atividade (Heartbeat)
  dailyAccessCount?: number; 
  lastDailyReset?: string; 
}

export interface APSIndicator {
  code: string;
  title: string;
  description: string;
  cityValue: string;
  percentage?: number;
  status: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
}

export interface PSFRankingData {
  psfName: string;
  indicators: APSIndicator[];
  totalScore: number;
  lastUpdate: string;
}

export interface DentalIndicator {
  code: string;
  title: string;
  cityValue?: string;
  percentage?: number;
  status: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
}

export interface TreasuryData {
  id: string;
  totalIn: number;
  totalOut: number;
  monthlyFee: number;
  lastUpdate: string;
  updatedBy: string;
  consolidatedPeriod?: string;
  consolidatedWithdrawal?: number;
  consolidatedSpent?: number;
  consolidatedInHand?: number;
  consolidatedBankBalance?: number;
}

export interface MonthlyBalance {
  id: string;
  year: number;
  month: number;
  income: number;
  expense: number;
  bankFee?: number;
  tax?: number;
  description?: string;
  updatedAt: string;
}

export interface NewsItem {
  title: string;
  summary: string;
  content: string;
  date: string;
  url: string;
}

export interface AuthState {
  user: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
}
