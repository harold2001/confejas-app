import { BaseInterface } from './base.interface';
import { IUser } from './user.interface';

export interface ICompany extends BaseInterface {
  name: string;
  number: number;
  users: IUser[];
  description?: string;
}

export interface CompanyStatisticsDto {
  companyId: string;
  companyName: string;
  companyNumber: number;
  userCount: number;
  usersArrived: number;
  usersNotArrived: number;
}
