export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CREATE_USER: '/users/create',
  USERS: '/users',
  SCAN_USER: '/users/scan',
  EDIT_USER: '/users/edit/:id',
  // TODO: La ruta será /attendance/verify/:token y se debe enviar ese token a la API para verificar la asistencia
  CONFIRM_ATTENDANCE: '/attendance/verify/:token',
};
