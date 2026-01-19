import PocketBase from 'pocketbase';
import { config } from '../config';
import { Camp, DocType, UserRole } from '../types';

const pb = new PocketBase(config.pocketbaseUrl);

// Disable auto-cancellation for smoother demo experience
pb.autoCancellation(false);

export const pbService = {
  client: pb,

  async checkHealth() {
    return await pb.health.check();
  },

  async login(role: UserRole) {
    const email = role === UserRole.ADMIN ? 'admin@edu.lipetsk.ru' : 'camp@lipetsk.ru';
    const password = '12345678'; 
    
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return authData.record;
    } catch (err) {
      // Don't log error here, let the caller handle it (e.g. switch to offline mode)
      throw err;
    }
  },

  async logout() {
    pb.authStore.clear();
  },

  async getCamps(): Promise<Camp[]> {
    const records = await pb.collection('camps').getFullList({
      sort: '-created',
    });

    const docs = await pb.collection('documents').getFullList();

    return records.map((r: any) => {
      const campDocs = docs.filter((d: any) => d.camp === r.id).map((d: any) => ({
        id: d.id,
        type: d.type as DocType,
        fileName: d.file,
        uploadDate: d.created.split('T')[0],
        status: d.status,
        url: pb.files.getUrl(d, d.file)
      }));

      return {
        id: r.id,
        // Mapping Snake_case DB fields to CamelCase TS Interface
        name: r.name,
        legalForm: r.legal_form || '',
        ownershipType: r.ownership_type || '',
        municipality: r.municipality || '',
        
        address: r.address,
        legalAddress: r.legal_address || '',
        directorName: r.director_name,
        
        phone: r.phone,
        email: r.email,
        website: r.website || '',
        
        sanitaryNumber: r.sanitary_number || '',
        sanitaryDate: r.sanitary_date || '',
        medicalLicense: r.medical_license || '',
        educationLicense: r.education_license || '',
        inspectionResults: r.inspection_results || '',
        
        shiftDates: r.shift_dates || '',
        capacity: r.capacity || 0,
        ticketCost: r.ticket_cost || 0,
        accessibility: r.accessibility || 'Нет',
        inclusionDate: r.inclusion_date || '',

        // Existing helpers
        inn: r.inn,
        oktmo: r.oktmo,
        campType: r.camp_type || '',
        seasonality: r.seasonality || 'сезонный',
        hasSwimming: r.has_swimming || false,
        ageCategory: r.age_category || '',
        
        isVerified: r.is_verified,
        documents: campDocs
      } as Camp;
    });
  },

  async updateCamp(campId: string, data: Partial<Camp>) {
    // Map Frontend CamelCase to Backend snake_case
    const pbData: any = {};
    
    if (data.name !== undefined) pbData.name = data.name;
    if (data.legalForm !== undefined) pbData.legal_form = data.legalForm;
    if (data.ownershipType !== undefined) pbData.ownership_type = data.ownershipType;
    if (data.municipality !== undefined) pbData.municipality = data.municipality;
    
    if (data.address !== undefined) pbData.address = data.address;
    if (data.legalAddress !== undefined) pbData.legal_address = data.legalAddress;
    if (data.directorName !== undefined) pbData.director_name = data.directorName;
    
    if (data.phone !== undefined) pbData.phone = data.phone;
    if (data.email !== undefined) pbData.email = data.email;
    if (data.website !== undefined) pbData.website = data.website;
    
    if (data.sanitaryNumber !== undefined) pbData.sanitary_number = data.sanitaryNumber;
    if (data.sanitaryDate !== undefined) pbData.sanitary_date = data.sanitaryDate;
    if (data.medicalLicense !== undefined) pbData.medical_license = data.medicalLicense;
    if (data.educationLicense !== undefined) pbData.education_license = data.educationLicense;
    if (data.inspectionResults !== undefined) pbData.inspection_results = data.inspectionResults;
    
    if (data.shiftDates !== undefined) pbData.shift_dates = data.shiftDates;
    if (data.capacity !== undefined) pbData.capacity = data.capacity;
    if (data.ticketCost !== undefined) pbData.ticket_cost = data.ticketCost;
    if (data.accessibility !== undefined) pbData.accessibility = data.accessibility;

    // Helpers
    if (data.inn !== undefined) pbData.inn = data.inn;
    if (data.oktmo !== undefined) pbData.oktmo = data.oktmo;
    if (data.campType !== undefined) pbData.camp_type = data.campType;
    if (data.seasonality !== undefined) pbData.seasonality = data.seasonality;
    if (data.hasSwimming !== undefined) pbData.has_swimming = data.hasSwimming;
    if (data.ageCategory !== undefined) pbData.age_category = data.ageCategory;

    return await pb.collection('camps').update(campId, pbData);
  },

  async uploadDocument(campId: string, file: File, type: DocType) {
    const formData = new FormData();
    formData.append('camp', campId);
    formData.append('type', type);
    formData.append('status', 'pending');
    formData.append('file', file);

    return await pb.collection('documents').create(formData);
  },

  async deleteDocument(docId: string) {
    return await pb.collection('documents').delete(docId);
  }
};