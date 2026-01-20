import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Camp, UserRole, DocType, AdminView } from '../types';
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

// Initial Mock Data (Fallback)
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
  }
];

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [adminView, setAdminView] = useState<AdminView>('reports');

  const refreshData = async () => {
    if (config.useMock || !isBackendAvailable) {
      if (camps.length === 0) setCamps(MOCK_CAMPS);
      return;
    }

    try {
      const data = await pbService.getCamps();
      setCamps(data);
    } catch (e: any) {
      // If error is 404, it means collections don't exist yet, but server is ON.
      if (e.status === 404) {
          console.warn("Server connected, but tables missing. Using empty list.");
          setCamps([]); 
      } else {
          console.warn("Could not fetch camps:", e);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      if (config.useMock) {
        setCamps(MOCK_CAMPS);
        return;
      }

      // Optimistic: Assume backend is available if we are serving from it
      setIsBackendAvailable(true);

      try {
        await pbService.checkHealth();
        console.log("PocketBase is online");

        if (pbService.client.authStore.isValid) {
            const model = pbService.client.authStore.model;
            const role = model?.email.includes('admin') ? UserRole.ADMIN : UserRole.CAMP_USER;
            
            await refreshData();
            
            // Re-calc current user camp based on updated data
            // We need to fetch camps first to find which one belongs to this user
            const currentCamps = await pbService.getCamps();
            const userCamp = currentCamps.find(c => c.email === model?.email);

            setCurrentUser({
                id: model?.id || 'unknown',
                name: role === UserRole.ADMIN ? 'Администратор Министерства' : 'Директор Лагеря',
                role: role,
                campId: userCamp?.id
            });
        }
      } catch (e: any) {
        console.warn("Health check failed (likely network or first load):", e);
        // Do NOT switch to offline mode immediately to allow retries
      }
    };

    init();
  }, []);

  const login = async (role: UserRole) => {
    setIsLoading(true);
    
    if (config.useMock) {
       // Mock login logic
       await new Promise(r => setTimeout(r, 500));
       if (role === UserRole.ADMIN) {
         setCurrentUser({ id: 'admin1', name: 'Министерство (Тест)', role });
       } else {
         setCurrentUser({ id: 'user1', name: 'Лагерь (Тест)', role, campId: 'c1' });
       }
       setIsLoading(false);
       return;
    }

    try {
        const userModel = await pbService.login(role);
        await refreshData();
        
        let campId = undefined;
        if (role === UserRole.CAMP_USER) {
            // Updated logic: Find camp by matching email
            // Since we just refreshed data, 'camps' state might not be updated yet in this closure, 
            // so we fetch fresh list or rely on the return of refreshData (if we modified it).
            // Safest: fetch fresh from service.
            const allCamps = await pbService.getCamps();
            const myCamp = allCamps.find(c => c.email === userModel.email);
            
            if (myCamp) {
                campId = myCamp.id;
            } else {
               // Fallback if email doesn't match perfectly (e.g. manual creation) -> take first
               if (allCamps.length > 0) campId = allCamps[0].id; 
            }
        }

        setCurrentUser({
            id: userModel.id || 'unknown',
            name: role === UserRole.ADMIN ? 'Администратор Министерства' : 'Директор Лагеря',
            role: role,
            campId: campId
        });
        setIsBackendAvailable(true);

    } catch (e: any) {
        console.error("Login failed:", e);
        
        if (e.status === 0 || e.message?.includes('fetch')) {
             alert("Ошибка соединения с сервером (Status 0). Проверьте, что PocketBase запущен на порту 8090.");
             setIsBackendAvailable(false);
             setCamps(MOCK_CAMPS);
        } else {
            // Show the actual message from pbService or PocketBase
            alert(`Ошибка входа: ${e.message}`);
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
    try {
        await pbService.updateCamp(campId, data);
        await refreshData(); 
    } catch (e) {
        console.error("PB Update failed", e);
        alert("Ошибка сохранения! Возможно, не создана таблица 'camps' в базе.");
    }
  };

  const uploadDocument = async (campId: string, file: File, type: DocType) => {
    try {
        await pbService.uploadDocument(campId, file, type);
        await refreshData(); 
    } catch (e) {
        console.error("PB Upload failed", e);
        alert("Ошибка загрузки! Проверьте таблицу 'documents'.");
    }
  };

  const deleteDocument = async (_campId: string, docId: string) => {
    try {
        await pbService.deleteDocument(docId);
        await refreshData();
    } catch(e) { console.error(e); }
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