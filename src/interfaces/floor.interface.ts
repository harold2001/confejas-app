import { BaseInterface } from './base.interface';
import { IBuilding } from './building.interface';
import { IRoom } from './room.interface';

export interface IFloor extends BaseInterface {
  number: number;
  building: IBuilding;
  rooms: IRoom[];
}
