import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

export const Login = () => {
  const { login, isLoading } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-gov-50 p-4 rounded-full">
             <ShieldCheck className="w-12 h-12 text-gov-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Реестр Лагерей 2026</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Единая информационная система<br/>
          Министерства образования Липецкой области
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => login(UserRole.ADMIN)}
            disabled={isLoading}
            className="w-full bg-gov-900 hover:bg-gov-800 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            {isLoading ? 'Вход...' : 'Войти как Министерство (Админ)'}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">или</span>
            </div>
          </div>

          <button 
            onClick={() => login(UserRole.CAMP_USER)}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 disabled:opacity-50 text-gov-700 font-medium py-3 px-4 rounded-xl border-2 border-gov-100 transition-colors"
          >
             {isLoading ? 'Вход...' : 'Войти как Представитель Лагеря'}
          </button>
        </div>
        
        <div className="mt-8 bg-blue-50 p-3 rounded-lg text-left">
           <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                 <p className="font-bold mb-1">Демо-доступ (Пароль: 12345678):</p>
                 <p>Министерство: <span className="font-mono bg-blue-100 px-1 rounded">admin@edu.lipetsk.ru</span></p>
                 <p className="mt-1">Лагерь: <span className="font-mono bg-blue-100 px-1 rounded">camp@lipetsk.ru</span></p>
                 <p className="mt-2 text-blue-600 opacity-75 italic">Убедитесь, что эти пользователи созданы в базе.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};