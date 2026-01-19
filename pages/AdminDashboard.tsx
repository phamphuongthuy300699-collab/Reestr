import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ArchitectureModal } from '../components/ArchitectureModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Search, Server, AlertTriangle, Users, Wallet, Map, CheckCircle2, XCircle, ChevronRight, FileText } from 'lucide-react';
import { DocType } from '../types';

export const AdminDashboard = () => {
  const { camps, adminView } = useStore();
  const [showArch, setShowArch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProblematic, setFilterProblematic] = useState(false);

  // --- ANALYTICS CALCULATIONS ---
  const stats = useMemo(() => {
    const total = camps.length;
    const verified = camps.filter(c => c.isVerified).length;
    const totalCapacity = camps.reduce((sum, c) => sum + (c.capacity || 0), 0);
    
    const campsWithCost = camps.filter(c => c.ticketCost && c.ticketCost > 0);
    const avgCost = campsWithCost.length > 0 
      ? Math.round(campsWithCost.reduce((sum, c) => sum + c.ticketCost, 0) / campsWithCost.length) 
      : 0;

    // Group by Municipality
    const byMunicipality = camps.reduce((acc, c) => {
      const muni = c.municipality || 'Не указан';
      acc[muni] = (acc[muni] || 0) + (c.capacity || 0);
      return acc;
    }, {} as Record<string, number>);

    const municipalityData = Object.entries(byMunicipality)
      .map(([name, val]) => ({ name: name.replace(' район', '').replace(' муниципальный', ''), capacity: Number(val) }))
      .sort((a, b) => b.capacity - a.capacity)
      .slice(0, 10); // Top 10

    // Group by Type
    const byType = camps.reduce((acc, c) => {
      const type = c.campType || 'Не определен';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(byType).map(([name, val]) => ({ name, value: val }));

    // Critical Issues
    const criticalIssues = camps.filter(c => 
        !c.sanitaryNumber || !c.medicalLicense || 
        !c.documents.some(d => d.type === DocType.SAN_EPIDEM) ||
        !c.documents.some(d => d.type === DocType.FIRE_SAFETY)
    );

    return { total, verified, totalCapacity, avgCost, municipalityData, typeData, criticalIssues };
  }, [camps]);

  const filteredCamps = camps.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.inn.includes(searchTerm);
    if (filterProblematic) {
        // Show only if missing critical data
        const isProblem = !c.sanitaryNumber || !c.medicalLicense || c.documents.length < 3;
        return matchesSearch && isProblem;
    }
    return matchesSearch;
  });

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const downloadMasterReport = () => {
    const headers = [
      '№ п/п', 'Наименование', 'Орг.-правовая', 'Форма собств.', 'Муниципалитет',
      'Адрес факт.', 'Адрес юр.', 'Руководитель', 'Телефон', 'Email', 'Сайт',
      'СЭЗ', 'Мед. лиц.', 'Обр. лиц.', 'Проверки', 'Смены', 'Вместимость', 'Цена', 'Доступность', 'Дата вкл.'
    ];
    
    const rows = camps.map((c, index) => [
      index + 1, `"${c.name}"`, c.legalForm, c.ownershipType || '', c.municipality || '',
      `"${c.address}"`, `"${c.legalAddress || ''}"`, `"${c.directorName}"`, c.phone, c.email, c.website || '',
      `"${c.sanitaryNumber} от ${c.sanitaryDate}"`, `"${c.medicalLicense}"`, `"${c.educationLicense || ''}"`, `"${c.inspectionResults || ''}"`,
      `"${c.shiftDates}"`, c.capacity, c.ticketCost || 0, `"${c.accessibility}"`, c.inclusionDate || ''
    ]);
    
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `REESTR_FULL_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ReportsView = () => (
    <div className="space-y-8 animate-in fade-in">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Охват детей (Вместимость)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalCapacity.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1 font-medium">+5% к прошлому году</p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-6 h-6"/></div>
            </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Средняя стоимость</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgCost.toLocaleString()} ₽</p>
                    <p className="text-xs text-gray-400 mt-1">за смену (21 день)</p>
                </div>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Wallet className="w-6 h-6"/></div>
            </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Готовность к открытию</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900">{Math.round((stats.verified / stats.total) * 100) || 0}%</p>
                        <span className="text-sm text-gray-500">({stats.verified}/{stats.total})</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-gov-500 h-full rounded-full" style={{ width: `${(stats.verified / stats.total) * 100}%` }}></div>
                    </div>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><CheckCircle2 className="w-6 h-6"/></div>
            </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 ring-2 ring-red-50">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-bold text-red-600 mb-1">Требуют внимания</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.criticalIssues.length}</p>
                    <p className="text-xs text-red-500 mt-1 cursor-pointer hover:underline">
                        Проблемы с СЭЗ или Лицензией
                    </p>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle className="w-6 h-6"/></div>
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CHART 1: MUNICIPALITY */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Map className="w-5 h-5 text-gray-400" />
                    Распределение мест по районам (Топ-10)
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.municipalityData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                            <Tooltip />
                            <Bar dataKey="capacity" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CHART 2: TYPES */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Структура реестра</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={stats.typeData} 
                                cx="50%" cy="50%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {stats.typeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );

  const RegistryView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50">
            <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg text-gray-800">Реестр организаций</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setFilterProblematic(false)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${!filterProblematic ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        Все ({stats.total})
                    </button>
                    <button 
                        onClick={() => setFilterProblematic(true)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filterProblematic ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                    >
                        Проблемные ({stats.criticalIssues.length})
                    </button>
                </div>
            </div>
            
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
                  <th className="px-6 py-4">Организация</th>
                  <th className="px-6 py-4">Район</th>
                  <th className="px-6 py-4">СЭЗ / Лицензии</th>
                  <th className="px-6 py-4 text-center">Пакет документов</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCamps.map((camp) => {
                  const hasSanitary = !!camp.sanitaryNumber;
                  const hasMed = !!camp.medicalLicense;
                  const docCount = camp.documents.length;
                  const totalDocs = 6; // Standard required amount approximation
                  const docPercent = Math.min(100, (docCount / totalDocs) * 100);

                  return (
                    <tr key={camp.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{camp.name}</div>
                        <div className="text-xs text-gray-500">{camp.campType}</div>
                        <div className="text-xs text-gray-400 mt-0.5">ИНН: {camp.inn}</div>
                      </td>
                      <td className="px-6 py-4">
                        {camp.municipality || <span className="text-gray-400 italic">Не указан</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                            <div className={`flex items-center gap-1.5 text-xs ${hasSanitary ? 'text-green-700' : 'text-red-600 font-bold'}`}>
                                {hasSanitary ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                                {hasSanitary ? 'СЭЗ: Есть' : 'СЭЗ: Нет'}
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs ${hasMed ? 'text-green-700' : 'text-amber-600 font-bold'}`}>
                                {hasMed ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                                {hasMed ? 'Мед: Есть' : 'Мед: Нет'}
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col items-center w-24 mx-auto">
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-1">
                                <div className={`h-full rounded-full ${docPercent < 50 ? 'bg-red-500' : docPercent < 100 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${docPercent}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500">{docCount} из ~{totalDocs}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          camp.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {camp.isVerified ? 'В реестре' : 'Черновик'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5" />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredCamps.length === 0 && (
              <div className="p-12 text-center">
                 <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-8 h-8 text-gray-400" />
                 </div>
                 <h3 className="text-gray-900 font-medium">Организации не найдены</h3>
                 <p className="text-gray-500 text-sm mt-1">Попробуйте изменить параметры фильтрации</p>
              </div>
            )}
          </div>
      </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
             {adminView === 'reports' ? 'Ситуационный Центр' : 'Реестр Организаций'}
          </h2>
          <p className="text-gray-500 mt-1">
             {adminView === 'reports' ? 'Мониторинг летней оздоровительной кампании' : 'Управление реестром и проверка документов'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowArch(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Server className="w-4 h-4" />
            Архитектура
          </button>
          {adminView === 'registry' && (
            <button onClick={downloadMasterReport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gov-600 rounded-lg hover:bg-gov-700 shadow-sm animate-in fade-in">
                <Download className="w-4 h-4" />
                Выгрузить Реестр (CSV)
            </button>
          )}
        </div>
      </header>

      {adminView === 'reports' ? <ReportsView /> : <RegistryView />}

      <ArchitectureModal isOpen={showArch} onClose={() => setShowArch(false)} />
    </div>
  );
};