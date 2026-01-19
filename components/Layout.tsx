import React from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { LogOut, Building, FileText, UserCircle, ShieldCheck, WifiOff } from 'lucide-react';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser, logout, isBackendAvailable, adminView, setAdminView } = useStore();

  if (!currentUser) return <>{children}</>;

  const menuClass = (isActive: boolean) => 
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
      isActive 
      ? 'bg-gov-600 text-white shadow-sm' 
      : 'text-gov-100 hover:bg-gov-800'
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gov-900 text-white flex flex-col fixed h-full shadow-xl z-20">
        <div className="p-6 border-b border-gov-700">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-gov-500" />
            <div>
              <h1 className="font-bold text-lg leading-tight">Реестр Лагерей</h1>
              <p className="text-xs text-gov-100 opacity-70">Липецкая область</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs uppercase text-gov-500 font-semibold tracking-wider mb-2 px-2">Меню</div>
          
          <div className="flex items-center gap-3 px-3 py-2 bg-gov-800 rounded-lg text-white mb-6 opacity-90">
            <UserCircle className="w-5 h-5" />
            <span className="font-medium truncate">{currentUser.name}</span>
          </div>

          {currentUser.role === UserRole.ADMIN && (
            <div className="space-y-1">
              <div 
                className={menuClass(adminView === 'reports')}
                onClick={() => setAdminView('reports')}
              >
                <FileText className="w-5 h-5" />
                <span>Сводные отчеты</span>
              </div>
              <div 
                className={menuClass(adminView === 'registry')}
                onClick={() => setAdminView('registry')}
              >
                <Building className="w-5 h-5" />
                <span>Реестр организаций</span>
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gov-700">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full text-red-200 hover:bg-red-900/20 hover:text-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Выход</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Offline Banner */}
        {!isBackendAvailable && (
          <div className="bg-amber-100 text-amber-800 px-8 py-2 text-sm font-medium flex items-center justify-center gap-2 border-b border-amber-200">
            <WifiOff className="w-4 h-4" />
            Сервер недоступен. Режим демонстрации (данные не сохраняются в БД).
          </div>
        )}
        
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};