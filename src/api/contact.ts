import client from './client';

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: string;
}

export async function submitContact(data: ContactRequest) {
  const res = await client.post('/contact', data);
  return res.data;
}
