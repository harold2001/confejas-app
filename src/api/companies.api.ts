import API_BASE_ROUTES from '../constants/api-base-routes';
import { ICompany } from '../interfaces/company.interface';
import axiosApi from './index.api';

export const route = API_BASE_ROUTES.COMPANIES;

export const getCompaniesWithCount = async (): Promise<Array<ICompany & { userCount: number }>> => {
  const res = await axiosApi.get(`${route}/with-count/users`);
  return res.data;
};
