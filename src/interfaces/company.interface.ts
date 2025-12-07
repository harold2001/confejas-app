import { BaseInterface } from './base.interface';

export interface ICompany extends BaseInterface {
  name: string;
  number: number;
  description?: string;
}
