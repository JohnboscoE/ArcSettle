import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000/api' });

export const dashboardApi = {
  getSummary: () => api.get('/dashboard'),
};

export const invoicesApi = {
  list: () => api.get('/invoices'),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: Record<string, unknown>) => api.post('/invoices/manual', data),
  upload: (formData: FormData) => api.post('/invoices/upload', formData),
};

export const posApi = {
  list: () => api.get('/pos'),
  get: (id: string) => api.get(`/pos/${id}`),
};

export const agentApi = {
  process: (invoiceId: string) => api.post(`/agent/process/${invoiceId}`),
  getLogs: () => api.get('/agent/logs'),
  getLogsByInvoice: (invoiceId: string) => api.get(`/agent/logs/${invoiceId}`),
};

export const settlementApi = {
  process: (invoiceId: string) => api.post(`/settlement/process/${invoiceId}`),
  list: () => api.get('/settlement'),
  getBalances: () => api.get('/settlement/balances'),
};
