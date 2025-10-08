import { BaseInterface } from './base.interface';
import { IRole } from './role.interface';
import { IStake } from './stake.interface';
import { IUserRoom } from './user-room.interface';

export interface IUser extends BaseInterface {
  firstName: string;
  middleName?: string;
  paternalLastName: string;
  maternalLastName?: string;
  dni?: string;
  birthDate?: Date;
  gender?: string;
  phone?: string;
  email?: string;
  password: string;
  address?: string;
  region?: string;
  department?: string;
  hasArrived: boolean;
  medicalCondition?: string;
  keyCode?: string;
  ward?: string;
  stake?: IStake;
  age?: string;
  isMemberOfTheChurch?: boolean;
  notes?: string;
  roles: IRole[];
  userRooms: IUserRoom[];
}
