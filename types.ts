export enum UserRole {
  ADMIN = 'ADMIN', // Ministry of Education
  CAMP_USER = 'CAMP_USER' // Camp Representative
}

export enum DocType {
  FIRE_SAFETY = 'Пожарная безопасность',
  SAN_EPIDEM = 'Заключение СЭС',
  STAFF_LIST = 'Штатное расписание',
  MENU = 'Меню питания',
  EXCEL_REPORT = 'Отчетный период (Excel)'
}

export interface Document {
  id: string;
  type: DocType;
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected';
  url?: string;
}

export interface Camp {
  id: string;
  name: string;
  inn: string;
  oktmo: string;
  address: string;
  directorName: string;
  phone: string;
  email: string;
  capacity: number;
  documents: Document[];
  isVerified: boolean;
  lastAudit?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  campId?: string; // If user is a camp rep
}

export interface SystemStats {
  totalCamps: number;
  verifiedCamps: number;
  documentsUploaded: number;
  pendingReports: number;
}