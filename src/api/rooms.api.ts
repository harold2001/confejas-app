import { IBuildingDetail, IUserForRoomAssignment } from '../interfaces/room-with-details.interface';
import axiosApi from './index.api';

export const getRoomsWithDetails = async (): Promise<IBuildingDetail[]> => {
  const response = await axiosApi.get('/rooms/with-details');
  return response.data;
};

export const getUsersForRoomAssignment = async (): Promise<IUserForRoomAssignment[]> => {
  const response = await axiosApi.get('/users/for-room-assignment');
  return response.data;
};

export const assignUserToRoom = async (userId: string, roomId: string): Promise<{ message: string }> => {
  const response = await axiosApi.patch(`/users/${userId}/room`, { roomId });
  return response.data;
};
