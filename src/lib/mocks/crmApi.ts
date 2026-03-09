import { simulateLatency } from './storage';

// CRM Validation Result
export interface CrmValidationResult {
  valid: boolean;
  crm: string;
  uf: string;
  name?: string;
  status?: 'ativo' | 'inativo' | 'cancelado' | 'suspenso';
  registrationDate?: string;
  specialties?: string[];
  situation?: string;
  error?: string;
}

// API Config stored in localStorage
export interface ApiConfig {
  infosimples: {
    apiKey: string;
    baseUrl: string;
    useMock: boolean;
  };
}

const API_CONFIG_KEY = 'medly_api_config';

export function getApiConfig(): ApiConfig {
  const stored = localStorage.getItem(API_CONFIG_KEY);
  if (stored) return JSON.parse(stored);
  return {
    infosimples: {
      apiKey: '',
      baseUrl: 'https://api.infosimples.com/api/v2/consultas/cfm/crm',
      useMock: true,
    },
  };
}

export function setApiConfig(config: ApiConfig): void {
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
}

// Mock CRM database
const MOCK_CRM_DATABASE: Record<string, CrmValidationResult> = {
  '123456-SP': {
    valid: true,
    crm: '123456',
    uf: 'SP',
    name: 'Ana Costa',
    status: 'ativo',
    registrationDate: '2015-03-15',
    specialties: ['Clínica Geral', 'Pediatria'],
    situation: 'Regular',
  },
  '654321-SP': {
    valid: true,
    crm: '654321',
    uf: 'SP',
    name: 'Pedro Mendes',
    status: 'ativo',
    registrationDate: '2018-07-22',
    specialties: ['Pediatria', 'Ortopedia'],
    situation: 'Regular',
  },
  '111111-RJ': {
    valid: true,
    crm: '111111',
    uf: 'RJ',
    name: 'Marcos Almeida',
    status: 'inativo',
    registrationDate: '2010-01-10',
    specialties: ['Cardiologia'],
    situation: 'Suspenso por inadimplência',
  },
  '222222-MG': {
    valid: true,
    crm: '222222',
    uf: 'MG',
    name: 'Fernanda Lima',
    status: 'cancelado',
    registrationDate: '2008-05-20',
    specialties: ['Dermatologia'],
    situation: 'Registro cancelado',
  },
};

// Mock CRM validation
async function mockValidateCrm(crm: string, uf: string): Promise<CrmValidationResult> {
  await simulateLatency(300, 800);

  const key = `${crm}-${uf.toUpperCase()}`;
  const result = MOCK_CRM_DATABASE[key];

  if (result) return result;

  // Generate random valid result for unknown CRMs (simulate real API)
  const statuses: Array<'ativo' | 'inativo' | 'cancelado' | 'suspenso'> = ['ativo', 'ativo', 'ativo', 'inativo', 'suspenso'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    valid: true,
    crm,
    uf: uf.toUpperCase(),
    name: `Médico CRM ${crm}`,
    status: randomStatus,
    registrationDate: '2020-01-01',
    specialties: ['Clínica Geral'],
    situation: randomStatus === 'ativo' ? 'Regular' : `CRM ${randomStatus}`,
  };
}

// Real API call to InfoSimples
async function realValidateCrm(crm: string, uf: string): Promise<CrmValidationResult> {
  const config = getApiConfig();
  try {
    const params = new URLSearchParams({
      crm,
      uf: uf.toUpperCase(),
      token: config.infosimples.apiKey,
    });

    const response = await fetch(`${config.infosimples.baseUrl}?${params}`);
    const data = await response.json();

    if (data.code === 200 && data.data?.length > 0) {
      const record = data.data[0];
      return {
        valid: true,
        crm,
        uf: uf.toUpperCase(),
        name: record.nome || '',
        status: (record.situacao || '').toLowerCase().includes('ativo') ? 'ativo' : 'inativo',
        registrationDate: record.data_inscricao || '',
        specialties: record.especialidades?.map((e: { nome: string }) => e.nome) || [],
        situation: record.situacao || '',
      };
    }

    return {
      valid: false,
      crm,
      uf: uf.toUpperCase(),
      error: data.message || 'CRM não encontrado',
    };
  } catch (err) {
    return {
      valid: false,
      crm,
      uf: uf.toUpperCase(),
      error: `Erro ao consultar API: ${err instanceof Error ? err.message : 'erro desconhecido'}`,
    };
  }
}

// Unified CRM validation function
export async function validateCrm(crm: string, uf: string): Promise<CrmValidationResult> {
  if (!crm || !uf) {
    return { valid: false, crm, uf, error: 'CRM e UF são obrigatórios' };
  }

  const config = getApiConfig();
  if (config.infosimples.useMock) {
    return mockValidateCrm(crm, uf);
  }
  return realValidateCrm(crm, uf);
}
