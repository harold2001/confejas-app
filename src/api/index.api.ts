import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Preferences } from '@capacitor/preferences';
import { exchangeRefreshToken } from './refresh-token.api';
import { ROUTES } from '../constants/routes';

const axiosApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosApi.interceptors.request.use(async (config: InternalAxiosRequestConfig<unknown>) => {
  const { value: token } = await Preferences.get({ key: 'accessToken' });
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh logic for login and auth endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest.retryAttempt && !isAuthEndpoint) {
      originalRequest.retryAttempt = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const { value: refreshToken } = await Preferences.get({
          key: 'refreshToken',
        });
        if (!refreshToken) {
          return await Promise.reject(error);
        }
        const response = await exchangeRefreshToken(refreshToken);
        const newAccessToken = response.accessToken;
        await Preferences.set({ key: 'accessToken', value: newAccessToken });
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return await axiosApi(originalRequest);
      } catch (err) {
        await Preferences.remove({ key: 'accessToken' });
        await Preferences.remove({ key: 'refreshToken' });
        window.location.replace(ROUTES.LOGIN);
        return await Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default axiosApi;
