import { BaseInterface } from './base.interface';
import { IFloor } from './floor.interface';
import { IRoomType } from './room-type.interface';
import { IUserRoom } from './user-room.interface';

export interface IRoom extends BaseInterface {
  roomNumber: string;
  roomType: IRoomType;
  floor: IFloor;
  totalBeds: number;
  userRooms: IUserRoom[];
}
