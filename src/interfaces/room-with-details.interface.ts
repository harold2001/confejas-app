export interface IRoomOccupant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IRoomDetail {
  id: string;
  roomNumber: string;
  totalBeds: number;
  occupiedBeds: number;
  roomType: {
    id: string;
    name: string;
  } | null;
  occupants: IRoomOccupant[];
}

export interface IFloorDetail {
  id: string;
  floorNumber: number;
  rooms: IRoomDetail[];
}

export interface IBuildingDetail {
  id: string;
  name: string;
  floors: IFloorDetail[];
}

export interface IUserForRoomAssignment {
  id: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string | null;
  fullName: string;
  email: string;
  hasRoom: boolean;
  currentRoom: {
    id: string;
    roomNumber: string;
    floorNumber: number;
    buildingName: string;
  } | null;
  isParticipant: boolean;
  isStaff: boolean;
}
