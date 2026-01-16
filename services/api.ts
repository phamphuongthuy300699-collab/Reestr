import { config } from '../config';
import { Camp, DocType } from '../types';

// This service handles communication with your local Node.js + Postgres + MinIO backend
// It is only used if config.useMock is false

export const api = {
  async getCamps(): Promise<Camp[]> {
    const res = await fetch(`${config.apiUrl}/camps`);
    if (!res.ok) throw new Error('Failed to fetch camps');
    return res.json();
  },

  async updateCamp(campId: string, data: Partial<Camp>): Promise<Camp> {
    const res = await fetch(`${config.apiUrl}/camps/${campId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async uploadDocument(campId: string, file: File, type: DocType): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('campId', campId);

    const res = await fetch(`${config.apiUrl}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  }
};