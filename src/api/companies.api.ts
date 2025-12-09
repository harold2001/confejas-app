import API_BASE_ROUTES from '../constants/api-base-routes';
import { CompanyStatisticsDto, ICompany } from '../interfaces/company.interface';
import axiosApi from './index.api';

export const route = API_BASE_ROUTES.COMPANIES;

export const getCompanyById = async (id: string): Promise<ICompany> => {
  const res = await axiosApi.get(`${route}/${id}`);
  return res.data;
};

export const getCompaniesWithCount = async (): Promise<Array<ICompany & { userCount: number }>> => {
  const res = await axiosApi.get(`${route}/with-count/users`);
  return res.data;
};

export const getCompaniesStatistics = async (): Promise<CompanyStatisticsDto[]> => {
  const res = await axiosApi.get(`${route}/statistics`);
  return res.data;
};
