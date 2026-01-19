export enum UserRole {
  ADMIN = 'ADMIN', // Ministry of Education
  CAMP_USER = 'CAMP_USER' // Camp Representative
}

export enum DocType {
  FIRE_SAFETY = 'Пожарная безопасность',
  SAN_EPIDEM = 'Заключение СЭС',
  STAFF_LIST = 'Штатное расписание',
  MENU = 'Меню питания',
  EXCEL_REPORT = 'Отчетный период (Excel)',
  MED_LICENSE = 'Медицинская лицензия/Договор',
  EDU_LICENSE = 'Образовательная лицензия'
}

export type AdminView = 'reports' | 'registry';

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
  // 1. Основные сведения
  name: string; // Col 2: Наименование
  legalForm: string; // Col 3: Орг.-правовая форма
  ownershipType: string; // Col 4: Форма собственности (NEW)
  municipality: string; // Col 5: Муниципальное образование (NEW)
  
  // 2. Адреса и Руководство
  address: string; // Col 6: Фактический адрес
  legalAddress: string; // Col 7: Юридический адрес (NEW)
  directorName: string; // Col 8: ФИО руководителя
  
  // 3. Контакты
  phone: string; // Col 9: Телефон
  email: string; // Col 10: Email
  website?: string; // Col 11: Сайт
  
  // 4. Регуляторика
  sanitaryNumber: string; // Col 12 (part 1)
  sanitaryDate: string; // Col 12 (part 2)
  medicalLicense: string; // Col 13
  educationLicense: string; // Col 14 (NEW)
  inspectionResults: string; // Col 15 (NEW)
  
  // 5. Параметры деятельности
  shiftDates: string; // Col 16: Сроки смен
  capacity: number; // Col 17: Вместимость
  ticketCost: number; // Col 18: Стоимость путевки (NEW, replacing costPerDay concept for report)
  accessibility: string; // Col 19: Доступная среда
  
  // 6. Служебные
  inclusionDate?: string; // Col 20: Дата включения в реестр (NEW)
  
  // Legacy/Helper fields
  inn: string;
  oktmo: string;
  campType: string; 
  seasonality: string;
  hasSwimming: boolean; 
  ageCategory: string;
  
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