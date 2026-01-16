import PocketBase from 'pocketbase';
import { config } from '../config';
import { Camp, DocType, Document, UserRole } from '../types';

const pb = new PocketBase(config.pocketbaseUrl);

// Disable auto-cancellation for smoother demo experience
pb.autoCancellation(false);

export const pbService = {
  client: pb,

  async login(role: UserRole) {
    // For DEMO purposes, we hardcode credentials to simplify the UI flow.
    // In production, you would take email/password from the Login form.
    const email = role === UserRole.ADMIN ? 'admin@edu.lipetsk.ru' : 'camp@lipetsk.ru';
    const password = '12345678'; 
    
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return authData.record;
    } catch (err) {
      console.error("PB Login Failed. Make sure users exist in PocketBase.", err);
      throw err;
    }
  },

  async logout() {
    pb.authStore.clear();
  },

  async getCamps(): Promise<Camp[]> {
    // Fetch camps and expand their documents (if we modeled it relationally)
    // However, since documents point TO camps, we fetch camps first, then documents.
    
    const records = await pb.collection('camps').getFullList({
      sort: '-created',
    });

    // Fetch all documents (for small demo datasets this is fine; for prod, optimize)
    const docs = await pb.collection('documents').getFullList();

    return records.map((r: any) => {
      // Find docs for this camp
      const campDocs = docs.filter((d: any) => d.camp === r.id).map((d: any) => ({
        id: d.id,
        type: d.type as DocType,
        fileName: d.file, // PocketBase stores filename in the file field
        uploadDate: d.created.split('T')[0],
        status: d.status,
        url: pb.files.getUrl(d, d.file)
      }));

      return {
        id: r.id,
        name: r.name,
        inn: r.inn,
        oktmo: r.oktmo,
        address: r.address,
        directorName: r.director_name,
        phone: r.phone,
        email: r.email,
        capacity: r.capacity,
        isVerified: r.is_verified,
        documents: campDocs
      } as Camp;
    });
  },

  async updateCamp(campId: string, data: Partial<Camp>) {
    // Map Frontend CamelCase to Backend snake_case
    const pbData: any = {};
    if (data.name) pbData.name = data.name;
    if (data.inn) pbData.inn = data.inn;
    if (data.oktmo) pbData.oktmo = data.oktmo;
    if (data.address) pbData.address = data.address;
    if (data.directorName) pbData.director_name = data.directorName;
    if (data.capacity) pbData.capacity = data.capacity;
    
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