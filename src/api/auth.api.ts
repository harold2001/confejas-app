import API_BASE_ROUTES from '../constants/api-base-routes';
import { IUser } from '../interfaces/user.interface';
import axiosApi from './index.api';

export const route = API_BASE_ROUTES.AUTH;

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{
  message: string;
  user: IUser;
  accessToken: string;
  refreshToken: string;
}> => {
  const res = await axiosApi.post(`${route}/login`, {
    email,
    password,
  });

  return res.data;
};
