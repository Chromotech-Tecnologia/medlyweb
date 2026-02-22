import { z } from 'zod';

// CPF validation helper
const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;

  return true;
};

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido. Ex: (11) 99999-9999'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine(isValidCPF, 'CPF inválido'),
  cep: z
    .string()
    .min(1, 'CEP é obrigatório')
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório').length(2, 'Use a sigla do estado'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// User Schema (for CRUD)
export const userSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório').refine(isValidCPF, 'CPF inválido'),
  role: z.enum(['admin', 'gestor', 'escalista', 'medico', 'developer']),
  status: z.enum(['ativo', 'inativo', 'pendente']),
  crm: z.string().optional(),
  crmState: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  managerId: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

// Location Schema
export const locationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  type: z.enum(['upa', 'ubs', 'hospital', 'clinica', 'pronto_socorro', 'outro']),
  cep: z.string().min(1, 'CEP é obrigatório'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Use a sigla do estado'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

// Specialty Schema
export const specialtySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().optional(),
  scaleTypeIds: z.array(z.string()).optional(),
});

export type SpecialtyFormData = z.infer<typeof specialtySchema>;

// Scale Type Schema
export const scaleTypeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().optional(),
  defaultDurationHours: z.number().min(1, 'Duração mínima é 1 hora').max(48, 'Duração máxima é 48 horas'),
  defaultShift: z.enum(['manha', 'tarde', 'noite', 'plantao_12h', 'plantao_24h']),
});

export type ScaleTypeFormData = z.infer<typeof scaleTypeSchema>;

// Scale Schema
export const scaleSchema = z.object({
  locationId: z.string().min(1, 'Local é obrigatório'),
  scaleTypeId: z.string().min(1, 'Tipo de escala é obrigatório'),
  specialtyId: z.string().min(1, 'Especialidade é obrigatória'),
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de término é obrigatório'),
  shift: z.enum(['manha', 'tarde', 'noite', 'plantao_12h', 'plantao_24h']),
  cancellationDeadlineDays: z.number().min(0).max(30),
  transferDeadlineDays: z.number().min(0).max(30),
  paymentValue: z.number().min(0, 'Valor deve ser positivo'),
  paymentDate: z.string().optional(),
  minPatients: z.number().min(0).optional(),
  maxPatients: z.number().min(0).optional(),
  mealBreakMinutes: z.number().min(0).max(180).optional(),
  requiredDocuments: z.array(z.string()).optional(),
});

export type ScaleFormData = z.infer<typeof scaleSchema>;

// Document Schema
export const documentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  category: z.enum(['identidade', 'crm', 'diploma', 'comprovante', 'contrato', 'outro']),
  userId: z.string().min(1, 'Usuário é obrigatório'),
  expirationDate: z.string().optional(),
  reviewNotes: z.string().max(500).optional(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

// Payment Schema
export const paymentSchema = z.object({
  scaleId: z.string().min(1, 'Escala é obrigatória'),
  doctorId: z.string().min(1, 'Médico é obrigatório'),
  amount: z.number().min(0, 'Valor deve ser positivo'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  notes: z.string().max(500).optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Rating Schema
export const ratingSchema = z.object({
  overallScore: z.number().min(1).max(5),
  punctualityScore: z.number().min(1).max(5).optional(),
  qualityScore: z.number().min(1).max(5).optional(),
  professionalismScore: z.number().min(1).max(5).optional(),
  comment: z.string().max(500).optional(),
});

export type RatingFormData = z.infer<typeof ratingSchema>;

// Checkout Schema
export const checkoutSchema = z.object({
  patientsAttended: z.number().min(0, 'Número de pacientes deve ser positivo'),
  overallScore: z.number().min(1).max(5),
  observations: z.string().max(1000).optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
