export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CREATE_USER: '/users/create',
  USERS: '/users',
  SCAN_USER: '/users/scan',
  DETAILS_USER: '/users/details/:id',
  EDIT_USER: '/users/edit/:id',
  ATTENDANCE: '/attendance',
  ATTENDANCE_DETAILS: '/attendance/:id',
  // TODO: La ruta será /attendance/verify/:token y se debe enviar ese token a la API para verificar la asistencia
  CONFIRM_ATTENDANCE: '/attendance/verify/:token',
};
