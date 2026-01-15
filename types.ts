
export enum UserRole {
  ADMIN = 'ADMIN',
  ACS = 'ACS'
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
  status: 'Ativo' | 'Pendente' | 'Inativo';
  role: UserRole;
}

export interface NewsItem {
  title: string;
  summary: string;
  content: string;
  date: string;
  url: string;
}

export interface APSIndicator {
  code: string;
  title: string;
  description: string;
  cityValue: string;
  percentage?: number;
  status: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
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
}

export interface MonthlyBalance {
  id: string; // Formato YYYY-MM
  year: number;
  month: number;
  income: number;
  expense: number;
  description?: string;
  updatedAt: string;
}

export interface AuthState {
  user: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
}
export const PSF_LIST: string[] = [
  'PSF Centro',
  'PSF Zona Norte',
  'PSF Zona Sul',
  'PSF Rural'
];
