import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema for creating a new user - only required fields from entity
export const createUserSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede tener más de 100 caracteres'),
  middleName: z
    .string()
    .max(100, 'El segundo nombre no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),
  paternalLastName: z
    .string()
    .min(1, 'El apellido paterno es requerido')
    .max(100, 'El apellido paterno no puede tener más de 100 caracteres'),
  maternalLastName: z
    .string()
    .max(100, 'El apellido materno no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),
  dni: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números')
    .optional()
    .or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  gender: z.enum(['Varón', 'Mujer']).optional(),
  phone: z.string().max(20, 'El teléfono no puede tener más de 20 caracteres').optional().or(z.literal('')),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'El email no puede tener más de 255 caracteres')
    .optional()
    .or(z.literal('')),
  address: z.string().max(255, 'La dirección no puede tener más de 255 caracteres').optional().or(z.literal('')),
  department: z.string().max(100, 'El departamento no puede tener más de 100 caracteres').optional().or(z.literal('')),
  hasArrived: z.boolean().optional(),
  medicalCondition: z.string().optional().or(z.literal('')),
  medicalTreatment: z.string().optional().or(z.literal('')),
  keyCode: z.string().max(50, 'El código de llave no puede tener más de 50 caracteres').optional().or(z.literal('')),
  ward: z.string().max(100, 'El barrio no puede tener más de 100 caracteres').optional().or(z.literal('')),
  stakeId: z.string().uuid('ID de estaca inválido').optional().or(z.literal('')),
  age: z.string().optional().or(z.literal('')),
  isMemberOfTheChurch: z.boolean().optional(),
  notes: z.string().optional().or(z.literal('')),
  shirtSize: z.string().max(10, 'La talla no puede tener más de 10 caracteres').optional().or(z.literal('')),
  bloodType: z.string().max(10, 'El tipo de sangre no puede tener más de 10 caracteres').optional().or(z.literal('')),
  healthInsurance: z
    .string()
    .max(100, 'El seguro de salud no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),
  emergencyContactName: z
    .string()
    .max(200, 'El nombre del contacto no puede tener más de 200 caracteres')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z
    .string()
    .max(20, 'El teléfono del contacto no puede tener más de 20 caracteres')
    .optional()
    .or(z.literal('')),
  companyId: z.string().uuid('ID de compañía inválido').optional().or(z.literal('')),
  roomId: z.string().uuid('ID de habitación inválido').optional().or(z.literal('')),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Schema for updating an existing user - only required fields from entity
export const updateUserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, 'El nombre es requerido'),
  middleName: z.string().optional(),
  paternalLastName: z.string().min(1, 'El apellido paterno es requerido'),
  maternalLastName: z.string().optional(),
  dni: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números')
    .optional()
    .or(z.literal('')),
  birthDate: z.string().optional(),
  gender: z.enum(['Varón', 'Mujer']).optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  department: z.string().optional(),
  hasArrived: z.boolean().optional(),
  medicalCondition: z.string().optional(),
  medicalTreatment: z.string().optional(),
  keyCode: z.string().optional(),
  ward: z.string().optional(),
  stakeId: z.string().optional(),
  age: z.string().optional(),
  isMemberOfTheChurch: z.boolean().optional(),
  notes: z.string().optional(),
  shirtSize: z.string().optional(),
  bloodType: z.string().optional(),
  healthInsurance: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  companyId: z.string().optional(),
  roomId: z.string().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
