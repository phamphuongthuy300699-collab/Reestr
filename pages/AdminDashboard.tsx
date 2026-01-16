import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArchitectureModal } from '../components/ArchitectureModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Search, Server, FileCheck, AlertTriangle } from 'lucide-react';
import { DocType } from '../types';

export const AdminDashboard = () => {
  const { camps, getCampStats } = useStore();
  const stats = getCampStats();
  const [showArch, setShowArch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCamps = camps.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.inn.includes(searchTerm)
  );

  const chartData = [
    { name: 'Всего лагерей', count: stats.total },
    { name: 'В реестре', count: stats.verified },
    { name: 'Сдали отчеты', count: stats.withReports },
  ];

  const downloadMasterReport = () => {
    // Simulation of backend aggregation
    const headers = ['Название', 'ИНН', 'ОКТМО', 'Адрес', 'Директор', 'Вместимость', 'Статус'];
    const rows = camps.map(c => [
      c.name, c.inn, c.oktmo, c.address, c.directorName, c.capacity, c.isVerified ? 'Активен' : 'Ожидает'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'master_report_lipetsk_camps.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Панель Министерства</h2>
          <p className="text-gray-500 mt-1">Мониторинг реестра организаций отдыха и оздоровления</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowArch(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Server className="w-4 h-4" />
            Архитектура Системы
          </button>
          <button 
            onClick={downloadMasterReport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gov-600 rounded-lg hover:bg-gov-700 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Выгрузить Сводный Отчет (CSV)
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Всего организаций</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Server className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Принято отчетов (Excel)</p>
              <p className="text-3xl font-bold text-gray-900">{stats.withReports}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Требуют проверки</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total - stats.verified}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
            <h3 className="font-bold text-lg text-gray-800">Реестр Лагерей</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Поиск по названию или ИНН..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-gov-500 focus:border-gov-500"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-4">Название</th>
                  <th className="px-6 py-4">ИНН</th>
                  <th className="px-6 py-4">Документы</th>
                  <th className="px-6 py-4">Отчет</th>
                  <th className="px-6 py-4">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCamps.map((camp) => {
                  const hasReport = camp.documents.some(d => d.type === DocType.EXCEL_REPORT);
                  return (
                    <tr key={camp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{camp.name}</td>
                      <td className="px-6 py-4">{camp.inn}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {camp.documents.length} загр.
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {hasReport ? (
                          <span className="text-green-600 flex items-center gap-1 font-medium"><CheckCircle className="w-3 h-3" /> Сдан</span>
                        ) : (
                          <span className="text-gray-400">Нет</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          camp.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {camp.isVerified ? 'В реестре' : 'На проверке'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredCamps.length === 0 && (
              <div className="p-8 text-center text-gray-400">Организации не найдены</div>
            )}
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h3 className="font-bold text-lg text-gray-800 mb-6">Статистика Наполнения</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Данные обновляются в реальном времени по мере загрузки отчетов лагерями.
          </div>
        </div>

      </div>

      <ArchitectureModal isOpen={showArch} onClose={() => setShowArch(false)} />
    </div>
  );
};

// Simple Icon component for the table
const CheckCircle = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);