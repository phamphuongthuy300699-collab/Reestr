import React from 'react';
import { X, Database, Network, Box, Terminal, Wifi } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Архитектура Системы (Демо)</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Box className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Backend: PocketBase</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Серверная часть работает локально на этом компьютере.
            </p>
            
            <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto space-y-4">
              <div>
                <p className="text-gray-400 mb-1"># 1. Создание Главного Админа (Superuser):</p>
                <p>.\pocketbase.exe superuser create admin@edu.lipetsk.ru 12345678</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1"># 2. Запуск сервера:</p>
                <p>.\pocketbase.exe serve --http=0.0.0.0:8090</p>
              </div>
              <div>
                 <p className="text-gray-400 mb-1"># 3. Админ-панель (Импорт схемы):</p>
                 <a href="http://localhost:8090/_/" target="_blank" className="text-blue-300 underline">http://localhost:8090/_/</a>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded border border-amber-200">
               <strong>Важно:</strong> Не забудьте импортировать файл <code>pb_schema.json</code> в настройках админки (Settings - Import Collections).
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Network className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Внешний доступ</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Способы показать демо заказчику удаленно:
            </p>

            <div className="grid gap-4">
              {/* Option 1: Localtunnel */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Вариант 1: Localtunnel (Рекомендуемый)
                </h4>
                <div className="bg-slate-900 text-slate-50 p-3 rounded font-mono text-xs overflow-x-auto mt-2">
                  <p>npx localtunnel --port 8090</p>
                </div>
              </div>

              {/* Option 2: SSH */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Вариант 2: Serveo.net
                </h4>
                <div className="bg-slate-900 text-slate-50 p-3 rounded font-mono text-xs overflow-x-auto mt-2">
                  <p>ssh -o ServerAliveInterval=60 -R 80:localhost:8090 serveo.net</p>
                </div>
              </div>

              {/* Option 3: Local LAN */}
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-100">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  <Wifi className="w-4 h-4" /> Вариант 3: Локальная сеть
                </h4>
                <p className="text-sm text-blue-800 mt-1">
                   Доступ по IP (например: <code>http://192.168.1.55:8090</code>), если устройства в одной Wi-Fi сети.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};