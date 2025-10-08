import { BaseInterface } from './base.interface';
import { IFloor } from './floor.interface';

export interface IBuilding extends BaseInterface {
  name: string;
  floors: IFloor[];
}
