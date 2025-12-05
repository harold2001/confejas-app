import { BaseInterface } from './base.interface';

export interface ICompany extends BaseInterface {
  name: string;
  description?: string;
}
