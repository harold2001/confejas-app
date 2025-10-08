import API_BASE_ROUTES from '../constants/api-base-routes';
import { IRole } from '../interfaces/role.interface';
import axiosApi from './index.api';

export const route = API_BASE_ROUTES.ROLES;

export const getRoles = async (): Promise<IRole[]> => {
  const res = await axiosApi.get(route);
  return res.data;
};
