import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Camp, UserRole, DocType, Document } from '../types';
import { config } from '../config';
import { pbService } from '../services/pocketbaseService';

interface StoreContextType {
  currentUser: User | null;
  camps: Camp[];
  isLoading: boolean;
  isBackendAvailable: boolean;
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
    inn: '4826001234',
    oktmo: '42701000',
    address: 'Липецкая обл., Грязинский р-н, с. Ярлуково',
    directorName: 'Иванов И.И.',
    phone: '+7 (4742) 55-55-55',
    email: 'star@lipetsk.ru',
    capacity: 350,
    isVerified: true,
    documents: [
      { id: 'd1', type: DocType.FIRE_SAFETY, fileName: 'fire_cert_2024.pdf', uploadDate: '2024-04-10', status: 'verified' }
    ]
  },
  {
    id: 'c2',
    name: 'Лагерь "Березка" (Демо режим)',
    inn: '4802009988',
    oktmo: '42605000',
    address: 'Липецкая обл., Елецкий р-н',
    directorName: 'Сидоров В.В.',
    phone: '+7 (47467) 2-22-22',
    email: 'berezka@elets.ru',
    capacity: 120,
    isVerified: false,
    documents: []
  }
];

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  // Function to refresh data from PocketBase
  const refreshData = async () => {
    if (config.useMock) {
      setCamps(MOCK_CAMPS);
      setIsBackendAvailable(true);
      return;
    }

    try {
      const data = await pbService.getCamps();
      setCamps(data);
      setIsBackendAvailable(true);
    } catch (e) {
      console.warn("PocketBase connection failed, falling back to Mock data:", e);
      setIsBackendAvailable(false);
      setCamps(MOCK_CAMPS);
    }
  };

  // Initial Load
  useEffect(() => {
    refreshData();
  }, []);

  const login = async (role: UserRole) => {
    setIsLoading(true);
    
    // If backend is down or mock mode is on, use local login
    if (config.useMock || !isBackendAvailable) {
        // Mock Login
        await new Promise(r => setTimeout(r, 600)); // Fake delay
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

    } catch (e) {
        // Fallback to offline login if connection fails during login attempt
        console.error("Login failed:", e);
        alert("Ошибка подключения к серверу. Переход в автономный режим.");
        setIsBackendAvailable(false);
        setCamps(MOCK_CAMPS);
        
        // Retry login as mock
        if (role === UserRole.ADMIN) {
          setCurrentUser({ id: 'admin1', name: 'Министерство (Офлайн)', role });
        } else {
          setCurrentUser({ id: 'user1', name: 'Представитель Лагеря (Офлайн)', role, campId: 'c1' });
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
        // Local update
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
        // Mock logic
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
    <StoreContext.Provider value={{ currentUser, camps, isLoading, isBackendAvailable, login, logout, updateCamp, uploadDocument, deleteDocument, getCampStats }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};