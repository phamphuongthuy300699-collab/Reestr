import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { ShieldCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useStore();

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
            className="w-full bg-gov-900 hover:bg-gov-800 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Войти как Министерство (Админ)
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
            className="w-full bg-white hover:bg-gray-50 text-gov-700 font-medium py-3 px-4 rounded-xl border-2 border-gov-100 transition-colors"
          >
            Войти как Представитель Лагеря
          </button>
        </div>
        
        <div className="mt-8 text-xs text-gray-400">
          <p>© 2026 Министерство образования Липецкой области</p>
          <p>Техническая поддержка: 8 (800) 000-00-00</p>
        </div>
      </div>
    </div>
  );
};