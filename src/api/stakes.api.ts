import API_BASE_ROUTES from '../constants/api-base-routes';
import { IStake } from '../interfaces/stake.interface';
import axiosApi from './index.api';

export const route = API_BASE_ROUTES.STAKES;

export const getStakeById = async (id: string): Promise<IStake> => {
  const res = await axiosApi.get(`${route}/${id}`);
  return res.data;
};

export const getStakes = async (): Promise<IStake[]> => {
  const res = await axiosApi.get(route);
  return res.data;
};
