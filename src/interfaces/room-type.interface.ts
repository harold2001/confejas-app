import { BaseInterface } from './base.interface';
import { IRoom } from './room.interface';

export interface IRoomType extends BaseInterface {
  name: string;
  rooms: IRoom[];
}
