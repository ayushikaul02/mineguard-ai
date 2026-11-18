import axios from 'axios';
import {
  Mine,
  ComplianceRecord,
  Inspection,
  Violation,
  CorrectiveAction,
  Contractor,
  Grievance,
  AuditLog,
  AuditIntegrity,
  DocumentItem,
  RiskCalculationResult,
  User
} from '../types';

const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mineguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired
      localStorage.removeItem('mineguard_token');
      localStorage.removeItem('mineguard_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginApi = async (credentials: { username: string; password: string }) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const getMeApi = async (): Promise<User> => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const getUsersApi = async (): Promise<User[]> => {
  const res = await api.get('/auth/users');
  return res.data;
};

export const createUserApi = async (userData: any): Promise<User> => {
  const res = await api.post('/auth/users', userData);
  return res.data;
};

// Dashboard
export const getDashboardKpis = async () => {
  const res = await api.get('/dashboard/kpis');
  return res.data;
};

export const getDashboardCharts = async () => {
  const res = await api.get('/dashboard/charts');
  return res.data;
};

export const getRecentActivity = async () => {
  const res = await api.get('/dashboard/recent-activity');
  return res.data;
};

export const getDashboardAlerts = async () => {
  const res = await api.get('/dashboard/alerts');
  return res.data;
};

// Mines
export const getMinesApi = async (): Promise<Mine[]> => {
  const res = await api.get('/mines');
  return res.data;
};

export const getMineByIdApi = async (id: number): Promise<Mine> => {
  const res = await api.get(`/mines/${id}`);
  return res.data;
};

export const createMineApi = async (mineData: Partial<Mine>): Promise<Mine> => {
  const res = await api.post('/mines', mineData);
  return res.data;
};

// Compliance
export const getComplianceRecordsApi = async (params?: Record<string, any>): Promise<ComplianceRecord[]> => {
  const res = await api.get('/compliance', { params });
  return res.data;
};

export const createComplianceRecordApi = async (data: Partial<ComplianceRecord>): Promise<ComplianceRecord> => {
  const res = await api.post('/compliance', data);
  return res.data;
};

export const updateComplianceRecordApi = async (id: number, data: Partial<ComplianceRecord>): Promise<ComplianceRecord> => {
  const res = await api.put(`/compliance/${id}`, data);
  return res.data;
};

// Inspections
export const getInspectionsApi = async (params?: Record<string, any>): Promise<Inspection[]> => {
  const res = await api.get('/inspections', { params });
  return res.data;
};

export const getInspectionByIdApi = async (id: number): Promise<Inspection> => {
  const res = await api.get(`/inspections/${id}`);
  return res.data;
};

export const submitInspectionApi = async (data: any): Promise<Inspection> => {
  const res = await api.post('/inspections', data);
  return res.data;
};

// Violations
export const getViolationsApi = async (params?: Record<string, any>): Promise<Violation[]> => {
  const res = await api.get('/violations', { params });
  return res.data;
};

export const getViolationByIdApi = async (id: number): Promise<Violation> => {
  const res = await api.get(`/violations/${id}`);
  return res.data;
};

export const createViolationApi = async (data: Partial<Violation>): Promise<Violation> => {
  const res = await api.post('/violations', data);
  return res.data;
};

export const updateViolationApi = async (id: number, data: Partial<Violation>): Promise<Violation> => {
  const res = await api.put(`/violations/${id}`, data);
  return res.data;
};

// Corrective Actions
export const getCorrectiveActionsApi = async (params?: Record<string, any>): Promise<CorrectiveAction[]> => {
  const res = await api.get('/corrective-actions', { params });
  return res.data;
};

export const createCorrectiveActionApi = async (data: Partial<CorrectiveAction>): Promise<CorrectiveAction> => {
  const res = await api.post('/corrective-actions', data);
  return res.data;
};

export const transitionCorrectiveActionApi = async (id: number, transitionData: any): Promise<CorrectiveAction> => {
  const res = await api.post(`/corrective-actions/${id}/transition`, transitionData);
  return res.data;
};

// AI & ML
export const calculateRiskApi = async (params: any): Promise<RiskCalculationResult> => {
  const res = await api.post('/ai/calculate-risk', params);
  return res.data;
};

export const getAiInsightsApi = async () => {
  const res = await api.get('/ai/insights');
  return res.data;
};

export const getHotspotsApi = async () => {
  const res = await api.get('/ai/hotspots');
  return res.data;
};

// Contractors
export const getContractorsApi = async (params?: Record<string, any>): Promise<Contractor[]> => {
  const res = await api.get('/contractors', { params });
  return res.data;
};

export const createContractorApi = async (data: Partial<Contractor>): Promise<Contractor> => {
  const res = await api.post('/contractors', data);
  return res.data;
};

export const updateContractorApi = async (id: number, data: Partial<Contractor>): Promise<Contractor> => {
  const res = await api.put(`/contractors/${id}`, data);
  return res.data;
};

// Grievances
export const getGrievancesApi = async (params?: Record<string, any>): Promise<Grievance[]> => {
  const res = await api.get('/grievances', { params });
  return res.data;
};

export const submitGrievanceApi = async (data: Partial<Grievance>): Promise<Grievance> => {
  const res = await api.post('/grievances', data);
  return res.data;
};

export const updateGrievanceApi = async (id: number, data: Partial<Grievance>): Promise<Grievance> => {
  const res = await api.put(`/grievances/${id}`, data);
  return res.data;
};

// Documents & OCR
export const getDocumentsApi = async (params?: Record<string, any>): Promise<DocumentItem[]> => {
  const res = await api.get('/documents', { params });
  return res.data;
};

export const uploadDocumentApi = async (formData: FormData): Promise<DocumentItem> => {
  const res = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const convertDocumentApi = async (docId: number, targetType: 'Compliance' | 'Violation') => {
  const res = await api.post(`/documents/${docId}/convert?target_type=${targetType}`);
  return res.data;
};

// Audit Trail
export const getAuditLogsApi = async (): Promise<AuditLog[]> => {
  const res = await api.get('/audit');
  return res.data;
};

export const verifyAuditChainApi = async (): Promise<AuditIntegrity> => {
  const res = await api.get('/audit/verify');
  return res.data;
};

// Reports Export
export const getReportExportUrl = (format: 'csv' | 'pdf', reportType: string, mineId?: number, domain?: string) => {
  const query = new URLSearchParams();
  query.append('report_type', reportType);
  if (mineId) query.append('mine_id', mineId.toString());
  if (domain) query.append('domain', domain);
  return `${API_BASE_URL}/reports/export/${format}?${query.toString()}`;
};
