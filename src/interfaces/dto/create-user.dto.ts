export interface CreateUserDto {
  firstName: string;
  middleName?: string;
  paternalLastName: string;
  maternalLastName?: string;
  dni: string;
  birthDate?: Date;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  region?: string;
  department?: string;
  hasArrived?: boolean;
  medicalCondition?: string;
  keyCode?: string;
  password: string;
  roleIds: string[];
}
