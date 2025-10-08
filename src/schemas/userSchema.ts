import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema for creating a new user - only required fields from entity
export const createUserSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  middleName: z.string().optional(),
  paternalLastName: z.string().min(1, 'El apellido paterno es requerido'),
  maternalLastName: z.string().optional(),
  dni: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['Varón', 'Mujer']).optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  region: z.string().optional(),
  department: z.string().optional(),
  medicalCondition: z.string().optional(),
  keyCode: z.string().optional(),
  ward: z.string().optional(),
  stakeId: z.string().optional(),
  age: z.string().optional(),
  isMemberOfTheChurch: z.boolean().optional(),
  notes: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Schema for updating an existing user - only required fields from entity
export const updateUserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, 'El nombre es requerido'),
  middleName: z.string().optional(),
  paternalLastName: z.string().min(1, 'El apellido paterno es requerido'),
  maternalLastName: z.string().optional(),
  dni: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['Varón', 'Mujer']).optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  region: z.string().optional(),
  department: z.string().optional(),
  medicalCondition: z.string().optional(),
  keyCode: z.string().optional(),
  ward: z.string().optional(),
  stakeId: z.string().optional(),
  age: z.string().optional(),
  isMemberOfTheChurch: z.boolean().optional(),
  notes: z.string().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
