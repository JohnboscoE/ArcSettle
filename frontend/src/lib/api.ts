import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

export const fetchDashboard   = () => api.get('/dashboard').then(r => r.data);
export const fetchInvoices    = () => api.get('/invoices').then(r => r.data.invoices);
export const fetchPOs         = () => api.get('/pos').then(r => r.data.purchaseOrders);
export const fetchAgentLogs   = () => api.get('/agent/logs').then(r => r.data.logs);
export const fetchSettlements = () => api.get('/settlement').then(r => r.data.settlements);
export const fetchBalances    = () => api.get('/settlement/balances').then(r => r.data);
export const createInvoice    = (data: Record<string, unknown>) =>
  api.post('/invoices/manual', data).then(r => r.data);
export const processSettlement = (invoiceId: string) =>
  api.post(`/settlement/process/${invoiceId}`).then(r => r.data);
