import React from 'react';
import { X, Server, Shield, Database, Network, Box, AlertTriangle, Terminal, Wifi } from 'lucide-react';

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
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Запуск:</strong> Файл <code>pocketbase.exe</code></li>
              <li><strong>Адрес:</strong> <code>http://127.0.0.1:8090</code></li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Network className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Внешний доступ (Альтернативы Ngrok)</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Так как Ngrok заблокирован в РФ, используйте один из следующих способов для демонстрации заказчику:
            </p>

            <div className="grid gap-4">
              {/* Option 1: Localtunnel */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Вариант 1: Localtunnel (Рекомендуемый)
                </h4>
                <p className="text-sm text-gray-600 mt-1 mb-2">Не требует регистрации. Работает через Node.js.</p>
                <div className="bg-slate-900 text-slate-50 p-3 rounded font-mono text-xs overflow-x-auto">
                  <p>npx localtunnel --port 8090</p>
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  * При первом открытии ссылки localtunnel может попросить ввести публичный IP для подтверждения.
                </p>
              </div>

              {/* Option 2: SSH */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Вариант 2: SSH Tunell (Serveo)
                </h4>
                <p className="text-sm text-gray-600 mt-1 mb-2">Работает без установки доп. программ в командной строке Windows.</p>
                <div className="bg-slate-900 text-slate-50 p-3 rounded font-mono text-xs overflow-x-auto">
                  <p>ssh -o ServerAliveInterval=60 -R 80:localhost:8090 serveo.net</p>
                </div>
              </div>

              {/* Option 3: Local LAN */}
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-100">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  <Wifi className="w-4 h-4" /> Вариант 3: Локальная сеть (Офлайн)
                </h4>
                <p className="text-sm text-blue-800 mt-1">
                  Если вы и заказчик подключены к одному Wi-Fi:
                </p>
                <ol className="list-decimal pl-5 mt-2 text-sm text-blue-800 space-y-1">
                  <li>Узнайте свой IP (команда <code>ipconfig</code>), например <code>192.168.1.55</code></li>
                  <li>Запустите PocketBase так: <code>.\pocketbase.exe serve --http=0.0.0.0:8090</code></li>
                  <li>Заказчик открывает: <code>http://192.168.1.55:8090</code></li>
                </ol>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Безопасность данных</h3>
            </div>
            <p className="text-gray-600">
              При использовании туннелей (варианты 1 и 2) трафик шифруется (HTTPS). Данные физически остаются на вашем ПК в папке <code>pb_data</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};