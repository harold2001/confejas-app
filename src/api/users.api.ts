import API_BASE_ROUTES from '../constants/api-base-routes';
import { CreateUserDto } from '../interfaces/dto/create-user.dto';
import { FilterUserDto } from '../interfaces/dto/filter-user.dto';
import { MarkAsArrivedDto } from '../interfaces/dto/mark-as-arrived.dto';
import { PaginationDto } from '../interfaces/dto/pagination.dto';
import { UpdateUserDto } from '../interfaces/dto/update-user.dto';
import { IUser } from '../interfaces/user.interface';
import axiosApi from './index.api';

export const route = API_BASE_ROUTES.USERS;

export const getUsers = async (): Promise<IUser[]> => {
  const res = await axiosApi.get(route);
  return res.data;
};

export const getUsersPaginated = async ({
  pagination,
  filters,
}: {
  pagination: PaginationDto;
  filters: FilterUserDto;
}): Promise<{ count: number; data: IUser[] }> => {
  const res = await axiosApi.post(`${route}/filter`, { pagination, filters });
  return res.data;
};

export const getUserById = async (id: string): Promise<IUser> => {
  const res = await axiosApi.get(`${route}/${id}`);
  return res.data;
};

export const createUser = async (body: CreateUserDto): Promise<IUser> => {
  const res = await axiosApi.post(route, body);
  return res.data;
};

export const updateUser = async (body: UpdateUserDto): Promise<IUser> => {
  const res = await axiosApi.patch(`${route}/${body.id}`, body);
  return res.data;
};

export const markAsArrived = async (id: string, body: MarkAsArrivedDto): Promise<IUser> => {
  const res = await axiosApi.put(`${route}/arrived/${id}`, body);
  return res.data;
};

export const permutaUser = async (
  body:
    | (CreateUserDto & { originalUserId: string })
    | { permutaUserId: string; originalUserId: string; isExisting: boolean },
): Promise<IUser> => {
  const res = await axiosApi.post(`${route}/permuta`, body);
  return res.data;
};

export const getStatistics = async () => {
  const res = await axiosApi.get(`${route}/statistics`);
  return res.data;
};

export const verifyAttendance = async (token: string) => {
  const res = await axiosApi.post(`${route}/verify-attendance`, { token });
  return res.data;
};

export const sendQrToUsers = async (userIds: string[]) => {
  const res = await axiosApi.post(`${route}/send-qr`, { userIds });
  return res.data;
};
