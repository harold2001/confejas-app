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

export interface IRoomWithCount extends BaseInterface {
  roomNumber: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  floor: {
    id: string;
    number: number;
    building: {
      id: string;
      name: string;
    } | null;
  } | null;
  roomType: {
    id: string;
    name: string;
  } | null;
}
