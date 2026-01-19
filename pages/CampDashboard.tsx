import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { DocType } from '../types';
import { CheckCircle, AlertCircle, Save, Building, Stethoscope, MapPin, FileText, Upload, Trash2 } from 'lucide-react';

export const CampDashboard = () => {
  const { currentUser, camps, updateCamp, uploadDocument, deleteDocument } = useStore();
  const camp = camps.find(c => c.id === currentUser?.campId);

  // Form State
  const [formData, setFormData] = useState<any>({});

  // Init form data when camp loads
  useEffect(() => {
    if (camp) {
      setFormData({
        name: camp.name,
        legalForm: camp.legalForm || '',
        ownershipType: camp.ownershipType || '',
        municipality: camp.municipality || '',
        inn: camp.inn,
        oktmo: camp.oktmo,
        directorName: camp.directorName,
        
        address: camp.address,
        legalAddress: camp.legalAddress || '',
        phone: camp.phone,
        email: camp.email,
        website: camp.website || '',
        
        campType: camp.campType || '',
        seasonality: camp.seasonality || 'сезонный',
        capacity: camp.capacity,
        shiftDates: camp.shiftDates || '',
        ticketCost: camp.ticketCost || 0,
        ageCategory: camp.ageCategory || '',
        
        hasSwimming: camp.hasSwimming || false,
        accessibility: camp.accessibility || '',
        inspectionResults: camp.inspectionResults || '',
        
        sanitaryNumber: camp.sanitaryNumber || '',
        sanitaryDate: camp.sanitaryDate || '',
        medicalLicense: camp.medicalLicense || '',
        educationLicense: camp.educationLicense || ''
      });
    }
  }, [camp]);

  if (!camp) return <div>Ошибка: Лагерь не найден</div>;

  const handleSave = () => {
    updateCamp(camp.id, formData);
    alert('Данные успешно сохранены в черновик реестра');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: DocType) => {
    if (e.target.files && e.target.files[0]) {
      uploadDocument(camp.id, e.target.files[0], type);
    }
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
  );

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const inputClass = "block w-full rounded-lg border-gray-300 border bg-white p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm";

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Заявление в Реестр</h2>
          <p className="text-gray-500 mt-1">Формирование сведений согласно Приказу № 509</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 self-start ${camp.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {camp.isVerified ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold">{camp.isVerified ? 'Включен в Реестр' : 'На проверке'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: THE BIG FORM */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* 1. General Info */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <SectionTitle icon={Building} title="1. Основные сведения об организации" />
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-6">
                <label className={labelClass}>Полное наименование (по Уставу)</label>
                <input type="text" className={inputClass} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="md:col-span-2">
                <label className={labelClass}>Орг.-правовая форма</label>
                <input type="text" className={inputClass} placeholder="ООО, МАОУ" value={formData.legalForm || ''} onChange={e => setFormData({...formData, legalForm: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Форма собственности</label>
                <select className={inputClass} value={formData.ownershipType || ''} onChange={e => setFormData({...formData, ownershipType: e.target.value})}>
                  <option value="">Выберите...</option>
                  <option value="Государственная">Государственная</option>
                  <option value="Муниципальная">Муниципальная</option>
                  <option value="Частная">Частная</option>
                  <option value="Иная">Иная</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Муниципальное образование</label>
                <input type="text" className={inputClass} placeholder="Район/Город" value={formData.municipality || ''} onChange={e => setFormData({...formData, municipality: e.target.value})} />
              </div>

              <div className="md:col-span-6">
                <label className={labelClass}>ФИО Руководителя</label>
                <input type="text" className={inputClass} value={formData.directorName || ''} onChange={e => setFormData({...formData, directorName: e.target.value})} />
              </div>

              <div className="md:col-span-3">
                <label className={labelClass}>ИНН</label>
                <input type="text" className={inputClass} value={formData.inn || ''} onChange={e => setFormData({...formData, inn: e.target.value})} />
              </div>
              <div className="md:col-span-3">
                <label className={labelClass}>ОКТМО</label>
                <input type="text" className={inputClass} value={formData.oktmo || ''} onChange={e => setFormData({...formData, oktmo: e.target.value})} />
              </div>
            </div>
          </section>

          {/* 2. Location & Contacts */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <SectionTitle icon={MapPin} title="2. Адрес и Контакты" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Фактический адрес лагеря (место деятельности)</label>
                <input type="text" className={inputClass} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Юридический адрес</label>
                <input type="text" className={inputClass} value={formData.legalAddress || ''} onChange={e => setFormData({...formData, legalAddress: e.target.value})} />
              </div>
              
              <div>
                <label className={labelClass}>Телефон</label>
                <input type="text" className={inputClass} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="text" className={inputClass} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Официальный сайт</label>
                <input type="text" className={inputClass} placeholder="https://..." value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
            </div>
          </section>

          {/* 3. Camp Parameters */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <SectionTitle icon={FileText} title="3. Параметры деятельности" />
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-3">
                <label className={labelClass}>Тип организации</label>
                <select className={inputClass} value={formData.campType || ''} onChange={e => setFormData({...formData, campType: e.target.value})}>
                   <option value="">Выберите тип...</option>
                   <option value="Загородный стационарный">Загородный стационарный</option>
                   <option value="Палаточный">Палаточный</option>
                   <option value="Дневного пребывания">С дневным пребыванием</option>
                   <option value="Труда и отдыха">Труда и отдыха</option>
                   <option value="Санаторий">Санаторно-оздоровительный</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className={labelClass}>Режим работы</label>
                <select className={inputClass} value={formData.seasonality || 'сезонный'} onChange={e => setFormData({...formData, seasonality: e.target.value})}>
                   <option value="сезонный">Сезонный (лето)</option>
                   <option value="круглогодичный">Круглогодичный</option>
                </select>
              </div>
              <div className="md:col-span-6">
                <label className={labelClass}>Сроки смен (через запятую)</label>
                <input type="text" className={inputClass} placeholder="01.06-21.06, 24.06-14.07..." value={formData.shiftDates || ''} onChange={e => setFormData({...formData, shiftDates: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Вместимость (чел/смена)</label>
                <input type="number" className={inputClass} value={formData.capacity || 0} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Возраст детей (лет)</label>
                <input type="text" className={inputClass} placeholder="6-17" value={formData.ageCategory || ''} onChange={e => setFormData({...formData, ageCategory: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Стоимость путевки (руб)</label>
                <input type="number" className={inputClass} value={formData.ticketCost || 0} onChange={e => setFormData({...formData, ticketCost: parseInt(e.target.value) || 0})} />
              </div>
              
              <div className="md:col-span-6 bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center gap-3">
                <input 
                    type="checkbox" 
                    id="hasSwimming"
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                    checked={formData.hasSwimming || false} 
                    onChange={e => setFormData({...formData, hasSwimming: e.target.checked})} 
                />
                <label htmlFor="hasSwimming" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Имеется оборудованное место для купания
                </label>
              </div>

              <div className="md:col-span-6">
                 <label className={labelClass}>Доступная среда (условия для детей с ОВЗ)</label>
                 <textarea className={inputClass} rows={2} placeholder="Опишите доступную среду (пандусы, проемы) или напишите 'Нет'" value={formData.accessibility || ''} onChange={e => setFormData({...formData, accessibility: e.target.value})} />
              </div>
            </div>
          </section>

          {/* 4. Regulatory Data - CRITICAL */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 ring-1 ring-red-50">
            <SectionTitle icon={Stethoscope} title="4. Сведения о заключениях и лицензиях" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Номер СЭЗ (Санитарное заключение)</label>
                <input type="text" className={inputClass} placeholder="48.ОЦ.01..." value={formData.sanitaryNumber || ''} onChange={e => setFormData({...formData, sanitaryNumber: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Дата СЭЗ</label>
                <input type="text" className={inputClass} placeholder="ДД.ММ.ГГГГ" value={formData.sanitaryDate || ''} onChange={e => setFormData({...formData, sanitaryDate: e.target.value})} />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Мед. лицензия (или реквизиты договора)</label>
                <input type="text" className={inputClass} placeholder="№ ЛО-48... от ... или Договор №... с ГУЗ..." value={formData.medicalLicense || ''} onChange={e => setFormData({...formData, medicalLicense: e.target.value})} />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Образовательная лицензия (при наличии)</label>
                <input type="text" className={inputClass} placeholder="№ ... от ... или 'Нет'" value={formData.educationLicense || ''} onChange={e => setFormData({...formData, educationLicense: e.target.value})} />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Результаты проверок (надзор)</label>
                <textarea className={inputClass} rows={2} placeholder="Кем и когда проводились, наличие нарушений..." value={formData.inspectionResults || ''} onChange={e => setFormData({...formData, inspectionResults: e.target.value})} />
              </div>
            </div>
          </section>

          <div className="flex justify-end sticky bottom-4 z-10">
             <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                <Save className="w-5 h-5" />
                Сохранить Заявление
             </button>
          </div>

        </div>

        {/* RIGHT COLUMN: DOCUMENTS */}
        <div className="space-y-6">
          {/* Docs Upload */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2">Пакет документов</h3>
            <p className="text-xs text-gray-500 mb-6">Загрузите скан-копии согласно Приложению 1.</p>
            
            <div className="space-y-4">
               {[
                 { type: DocType.SAN_EPIDEM, label: 'Заключение СЭС', required: true },
                 { type: DocType.FIRE_SAFETY, label: 'Пожарная безопасность', required: true },
                 { type: DocType.MED_LICENSE, label: 'Мед. лицензия / Договор', required: true },
                 { type: DocType.STAFF_LIST, label: 'Штатное расписание', required: false },
                 { type: DocType.MENU, label: 'Меню питания', required: false },
                 { type: DocType.EDU_LICENSE, label: 'Образовательная лицензия', required: false }
                ].map((item) => {
                 const doc = camp.documents.find(d => d.type === item.type);
                 return (
                   <div key={item.type} className={`border rounded-xl p-4 transition-colors ${doc ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}>
                     <div className="flex justify-between items-start mb-3">
                       <div>
                           <span className="text-sm font-bold text-gray-700 block">{item.label}</span>
                           {item.required && <span className="text-[10px] uppercase text-red-500 font-bold tracking-wider">Обязательно</span>}
                       </div>
                       {doc && <CheckCircle className="w-5 h-5 text-green-600" />}
                     </div>
                     
                     {doc ? (
                        <div className="flex items-center justify-between bg-white rounded p-2 border border-green-100 shadow-sm">
                           <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-xs text-gray-600 truncate">{doc.fileName}</span>
                           </div>
                           <button onClick={() => deleteDocument(camp.id, doc.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     ) : (
                       <label className="flex items-center justify-center w-full py-2.5 bg-white border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:text-blue-600 text-gray-500 transition-all group">
                          <Upload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-semibold">Загрузить файл</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, item.type)} accept=".pdf,.jpg,.jpeg,.png" />
                       </label>
                     )}
                   </div>
                 )
               })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};