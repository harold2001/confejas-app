import { BaseInterface } from './base.interface';

export interface IRole extends BaseInterface {
  id: string;
  name: string;
  description?: string;
}
