
export enum UserRole {
  ADMIN = 'ADMIN',
  ACS = 'ACS'
}

export const PSF_LIST = [
  "USF ANTONIO ARNAULD DA SILVA",
  "USF CAROLINA ROSA DE ASSIS",
  "USF DE CANUDOS",
  "USF DE VARZEA DO CERCO",
  "USF NOEME TELES BOAVENTURA"
];

export interface SystemConfig {
  q1Label: string;
  q2Label: string;
  q3Label: string;
}

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
  lastSeen?: string; 
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
  indicators?: APSIndicator[]; 
  eSusCount: number;          
  siapsCount: number;         
  // Saúde da Família (eSF)
  esfQ1Score: number;
  esfQ1Class: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
  esfQ2Score: number;
  esfQ2Class: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
  esfQ3Score: number;
  esfQ3Class: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
  // Saúde Bucal (eSB)
  dentalQ1Score: number;
  dentalQ1Class: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
  dentalQ2Score: number;
  dentalQ2Class: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
  dentalQ3Score: number;
  dentalQ3Class: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
  // Vínculo e Acompanhamento Territorial
  territorialQ1Score: number;
  territorialQ1Class: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
  territorialQ2Score: number;
  territorialQ2Class: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
  territorialQ3Score: number;
  territorialQ3Class: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
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