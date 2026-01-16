import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DocType } from '../types';
import { Upload, FileText, CheckCircle, AlertCircle, Save, Sparkles } from 'lucide-react';
import { auditCampData } from '../services/geminiService';

export const CampDashboard = () => {
  const { currentUser, camps, updateCamp, uploadDocument, deleteDocument } = useStore();
  const camp = camps.find(c => c.id === currentUser?.campId);

  // Local state for AI result
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Local state for form edits
  const [formData, setFormData] = useState({
    name: camp?.name || '',
    inn: camp?.inn || '',
    oktmo: camp?.oktmo || '',
    directorName: camp?.directorName || '',
    address: camp?.address || '',
    capacity: camp?.capacity || 0,
  });

  if (!camp) return <div>Ошибка: Лагерь не найден</div>;

  const handleSave = () => {
    updateCamp(camp.id, formData);
    alert('Данные успешно сохранены');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: DocType) => {
    if (e.target.files && e.target.files[0]) {
      uploadDocument(camp.id, e.target.files[0], type);
    }
  };

  const runAiAudit = async () => {
    setIsAnalyzing(true);
    setAiReport(null);
    const report = await auditCampData(camp);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Личный Кабинет</h2>
          <p className="text-gray-500 mt-1">Управление данными организации отдыха и оздоровления</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${camp.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {camp.isVerified ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold">{camp.isVerified ? 'Реестр: Активен' : 'Реестр: Ожидает проверки'}</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Info Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gov-600" />
              Основные Сведения
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Полное наименование</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-gov-500 focus:border-gov-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ИНН</label>
                <input 
                  type="text" 
                  value={formData.inn}
                  onChange={(e) => setFormData({...formData, inn: e.target.value})}
                  className="w-full rounded-lg border-gray-300 border p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ОКТМО</label>
                <input 
                  type="text" 
                  value={formData.oktmo}
                  onChange={(e) => setFormData({...formData, oktmo: e.target.value})}
                  className="w-full rounded-lg border-gray-300 border p-2.5"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Юридический адрес</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full rounded-lg border-gray-300 border p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО Директора</label>
                <input 
                  type="text" 
                  value={formData.directorName}
                  onChange={(e) => setFormData({...formData, directorName: e.target.value})}
                  className="w-full rounded-lg border-gray-300 border p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Плановая мощность (чел)</label>
                <input 
                  type="number" 
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className="w-full rounded-lg border-gray-300 border p-2.5"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-gov-600 hover:bg-gov-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Сохранить изменения
              </button>
            </div>
          </section>

           {/* Documents Section */}
           <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-gov-600" />
              Загрузка Документов
            </h3>

            <div className="space-y-6">
              {/* Mandatory Docs */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-3">Обязательные документы</h4>
                <div className="grid gap-4">
                  {[DocType.FIRE_SAFETY, DocType.SAN_EPIDEM, DocType.STAFF_LIST, DocType.MENU].map((type) => {
                    const existingDoc = camp.documents.find(d => d.type === type);
                    return (
                      <div key={type} className="flex items-center justify-between p-3 bg-white rounded border border-gray-100 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">{type}</span>
                        {existingDoc ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-green-600 truncate max-w-[150px]">{existingDoc.fileName}</span>
                            <button 
                              onClick={() => deleteDocument(camp.id, existingDoc.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Удалить
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer text-sm text-gov-600 hover:text-gov-800 font-medium">
                            Загрузить (PDF/Scan)
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png,.doc,.docx" onChange={(e) => handleFileUpload(e, type)} />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reporting Period */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Отчетный период: Лето 2024</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Необходимо загрузить типизированный Excel-отчет до 15 сентября.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Шаблон отчета.xlsx (скачать)</span>
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                    Загрузить Excel Отчет
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx,.xls" 
                      onChange={(e) => handleFileUpload(e, DocType.EXCEL_REPORT)}
                    />
                  </label>
                </div>
                {camp.documents.filter(d => d.type === DocType.EXCEL_REPORT).map(d => (
                  <div key={d.id} className="mt-3 text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Загружен: {d.fileName} ({d.uploadDate})
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Col: AI & Status */}
        <div className="space-y-6">
          <section className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-900">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold">ИИ-Аудитор Gemini</h3>
            </div>
            <p className="text-sm text-indigo-700 mb-4">
              Проверьте полноту заполнения карточки и наличие документов перед отправкой в Министерство.
            </p>
            
            <button 
              onClick={runAiAudit}
              disabled={isAnalyzing}
              className={`w-full py-3 rounded-lg font-semibold shadow-sm transition-all ${
                isAnalyzing 
                ? 'bg-gray-200 text-gray-500 cursor-wait' 
                : 'bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-200'
              }`}
            >
              {isAnalyzing ? 'Анализ данных...' : 'Запустить проверку'}
            </button>

            {aiReport && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-100 text-sm text-gray-800 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <h4 className="font-bold text-indigo-900 mb-2">Результат проверки:</h4>
                <p className="whitespace-pre-line leading-relaxed">{aiReport}</p>
              </div>
            )}
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Контактная информация</h3>
            <div className="text-sm space-y-3">
              <div>
                <span className="block text-gray-500 text-xs">Министерство образования</span>
                <span className="font-medium text-gray-800">+7 (4742) 00-00-00</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Техническая поддержка</span>
                <span className="font-medium text-gray-800">support@edu.lipetsk.ru</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};