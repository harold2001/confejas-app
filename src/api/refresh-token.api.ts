import axios from 'axios';
import API_BASE_ROUTES from '../constants/api-base-routes';

interface RefreshTokenResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const authApi = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + API_BASE_ROUTES.AUTH,
});

export const exchangeRefreshToken = async (
  refreshToken: string
): Promise<RefreshTokenResponse> => {
  const res = await authApi.post<RefreshTokenResponse>('/refresh', {
    refreshToken,
  });
  return res.data;
};

export default { exchangeRefreshToken };
