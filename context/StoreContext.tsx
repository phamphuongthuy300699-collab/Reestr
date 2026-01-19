import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Camp, UserRole, DocType, Document, AdminView } from '../types';
import { config } from '../config';
import { pbService } from '../services/pocketbaseService';

interface StoreContextType {
  currentUser: User | null;
  camps: Camp[];
  isLoading: boolean;
  isBackendAvailable: boolean;
  adminView: AdminView;
  setAdminView: (view: AdminView) => void;
  login: (role: UserRole) => void;
  logout: () => void;
  updateCamp: (campId: string, data: Partial<Camp>) => Promise<void>;
  uploadDocument: (campId: string, file: File, type: DocType) => Promise<void>;
  deleteDocument: (campId: string, docId: string) => void;
  getCampStats: () => any;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Mock Data (Fallback if PB is down)
const MOCK_CAMPS: Camp[] = [
  {
    id: 'c1',
    name: 'ДОЛ "Звездный" (Демо режим)',
    legalForm: 'МАОУ ДО',
    ownershipType: 'Муниципальная',
    municipality: 'Грязинский район',
    inn: '4826001234',
    oktmo: '42701000',
    
    address: 'Липецкая обл., Грязинский р-н, с. Ярлуково, ул. Лесная 1',
    legalAddress: '399050, Липецкая обл., г. Грязи, ул. Правды, д. 5',
    directorName: 'Иванов Иван Иванович',
    
    phone: '+7 (4742) 55-55-55',
    email: 'star@lipetsk.ru',
    website: 'https://star.lipetsk.ru',
    
    campType: 'Загородный стационарный',
    seasonality: 'сезонный',
    shiftDates: '01.06-21.06, 24.06-14.07, 17.07-06.08',
    capacity: 350,
    ticketCost: 32500,
    ageCategory: '7-17 лет',
    
    accessibility: 'Пандусы, поручни, адаптированные санузлы',
    
    sanitaryNumber: '48.ОЦ.01.000.М.000123.05.23',
    sanitaryDate: '25.05.2023',
    medicalLicense: 'ЛО-48-01-001234 от 10.02.2020',
    educationLicense: '№ 1234 от 01.09.2019',
    inspectionResults: 'Плановая проверка Роспотребнадзора (май 2024) - нарушений не выявлено',
    
    hasSwimming: true,
    isVerified: true,
    inclusionDate: '2024-05-15',
    documents: [
      { id: 'd1', type: DocType.FIRE_SAFETY, fileName: 'fire_cert_2024.pdf', uploadDate: '2024-04-10', status: 'verified' }
    ]
  },
  {
    id: 'c2',
    name: 'Лагерь "Березка" (Демо режим)',
    legalForm: 'ООО',
    ownershipType: 'Частная',
    municipality: 'Елецкий район',
    inn: '4802009988',
    oktmo: '42605000',
    
    address: 'Липецкая обл., Елецкий р-н, с. Казаки',
    legalAddress: 'Липецкая обл., г. Елец, ул. Мира, 10',
    directorName: 'Сидоров Василий Васильевич',
    
    phone: '+7 (47467) 2-22-22',
    email: 'berezka@elets.ru',
    
    campType: 'Палаточный',
    seasonality: 'сезонный',
    shiftDates: '01.07-14.07',
    capacity: 120,
    ticketCost: 15000,
    ageCategory: '10-16 лет',
    
    accessibility: 'Нет',
    
    sanitaryNumber: '',
    sanitaryDate: '',
    medicalLicense: '',
    educationLicense: '',
    inspectionResults: '',
    
    hasSwimming: false,
    isVerified: false,
    documents: []
  }
];

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [adminView, setAdminView] = useState<AdminView>('reports');

  // Function to refresh data from PocketBase
  const refreshData = async () => {
    if (config.useMock || !isBackendAvailable) {
      if (camps.length === 0) setCamps(MOCK_CAMPS);
      return;
    }

    try {
      const data = await pbService.getCamps();
      setCamps(data);
    } catch (e) {
      console.warn("Could not fetch camps (might be permission issue or network):", e);
    }
  };

  // Initial Load - Check Connection First!
  useEffect(() => {
    const init = async () => {
      if (config.useMock) {
        setIsBackendAvailable(true);
        setCamps(MOCK_CAMPS);
        return;
      }

      try {
        await pbService.checkHealth();
        setIsBackendAvailable(true);
        console.log("PocketBase is online");

        if (pbService.client.authStore.isValid) {
            const role = pbService.client.authStore.model?.email.includes('admin') ? UserRole.ADMIN : UserRole.CAMP_USER;
            setCurrentUser({
                id: pbService.client.authStore.model?.id || 'unknown',
                name: role === UserRole.ADMIN ? 'Администратор Министерства' : 'Директор Лагеря',
                role: role,
                campId: undefined
            });
            await refreshData();
        }
      } catch (e: any) {
        console.warn("PocketBase is unreachable (using Mock Data):", e.message);
        setIsBackendAvailable(false);
        setCamps(MOCK_CAMPS);
      }
    };

    init();
  }, []);

  const login = async (role: UserRole) => {
    setIsLoading(true);
    
    if (config.useMock || !isBackendAvailable) {
        await new Promise(r => setTimeout(r, 600)); 
        if (role === UserRole.ADMIN) {
          setCurrentUser({ id: 'admin1', name: 'Министерство (Администратор)', role });
        } else {
          setCurrentUser({ id: 'user1', name: 'Представитель Лагеря', role, campId: 'c1' });
        }
        setIsLoading(false);
        return;
    }

    try {
        await pbService.login(role);
        await refreshData();
        
        let campId = undefined;
        if (role === UserRole.CAMP_USER) {
            const allCamps = await pbService.getCamps();
            if (allCamps.length > 0) campId = allCamps[0].id;
        }

        setCurrentUser({
            id: pbService.client.authStore.model?.id || 'unknown',
            name: role === UserRole.ADMIN ? 'Администратор Министерства' : 'Директор Лагеря',
            role: role,
            campId: campId
        });

    } catch (e: any) {
        // Handle connection errors gracefully without alarming console errors
        const isConnectionError = e.status === 0 || 
                                 e.message?.includes('autocancelled') || 
                                 e.message?.includes('Something went wrong') ||
                                 e.isAbort;

        if (isConnectionError) {
             console.warn("Server connection failed during login. Switching to offline mode.");
             setIsBackendAvailable(false);
             setCamps(MOCK_CAMPS);
             
             if (role === UserRole.ADMIN) {
               setCurrentUser({ id: 'admin1', name: 'Министерство (Офлайн)', role });
             } else {
               setCurrentUser({ id: 'user1', name: 'Представитель Лагеря (Офлайн)', role, campId: 'c1' });
             }
        } else {
            console.error("Login authentication failed:", e);
            alert("Ошибка входа! Проверьте учетные данные.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
      pbService.logout();
      setCurrentUser(null);
  };

  const updateCamp = async (campId: string, data: Partial<Camp>) => {
    if (isBackendAvailable && !config.useMock) {
      try {
        await pbService.updateCamp(campId, data);
        await refreshData(); 
      } catch (e) {
        console.error("PB Update failed", e);
        alert("Ошибка сохранения на сервере");
      }
    } else {
        setCamps(prev => prev.map(c => c.id === campId ? { ...c, ...data } : c));
    }
  };

  const uploadDocument = async (campId: string, file: File, type: DocType) => {
    if (isBackendAvailable && !config.useMock) {
      try {
        await pbService.uploadDocument(campId, file, type);
        await refreshData(); 
      } catch (e) {
        console.error("PB Upload failed", e);
        alert("Ошибка загрузки файла на сервер");
      }
    } else {
        const newDoc: Document = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            fileName: file.name,
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        };
        setCamps(prev => prev.map(c => {
            if (c.id === campId) return { ...c, documents: [...c.documents, newDoc] };
            return c;
        }));
    }
  };

  const deleteDocument = async (campId: string, docId: string) => {
    if (isBackendAvailable && !config.useMock) {
        try {
            await pbService.deleteDocument(docId);
            await refreshData();
        } catch(e) { console.error(e); }
    } else {
        setCamps(prev => prev.map(c => {
            if (c.id === campId) return { ...c, documents: c.documents.filter(d => d.id !== docId) };
            return c;
        }));
    }
  };

  const getCampStats = () => {
    return {
      total: camps.length,
      verified: camps.filter(c => c.isVerified).length,
      withReports: camps.filter(c => c.documents.some(d => d.type === DocType.EXCEL_REPORT)).length
    };
  };

  return (
    <StoreContext.Provider value={{ currentUser, camps, isLoading, isBackendAvailable, adminView, setAdminView, login, logout, updateCamp, uploadDocument, deleteDocument, getCampStats }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};