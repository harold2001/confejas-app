import { BaseInterface } from './base.interface';
import { IRoom } from './room.interface';
import { IUser } from './user.interface';

export interface IUserRoom extends BaseInterface {
  user: IUser;
  room: IRoom;
  isActive: boolean;
}
