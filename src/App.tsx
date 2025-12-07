import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/Profile';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

import '@ionic/react/css/palettes/dark.always.css';
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Users from './pages/users/Users';
import { ROUTES } from './constants/routes';
import { ROLES } from './constants/roles';
import ConfirmAttendance from './pages/attendance/confirm/ConfirmAttendance';
import UserForm from './pages/users/form/UserForm';
import Attendance from './pages/attendance/Attendance';
import AttendanceDetails from './pages/attendance/details/AttendanceDetails';
import UserDetails from './pages/users/details/UserDetails';
import Rooms from './pages/rooms/Rooms';
import QR from './pages/qr/QR';

setupIonicReact();

const App = () => {
  return (
    <IonApp>
      <Toaster
        position='top-center'
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <IonReactRouter>
        <MainLayout contentId='main'>
          <IonRouterOutlet id='main'>
            <Route path='/' exact={true}>
              <Redirect to={ROUTES.DASHBOARD} />
            </Route>

            <Route path={ROUTES.LOGIN} exact={true}>
              <Login />
            </Route>

            {/* Protected Routes */}
            <ProtectedRoute path={ROUTES.CONFIRM_ATTENDANCE} exact={true} component={ConfirmAttendance} />
            <ProtectedRoute path={ROUTES.DASHBOARD} exact={true} component={Dashboard} />
            <ProtectedRoute path={ROUTES.USERS} exact={true} component={Users} />
            <ProtectedRoute path={ROUTES.CREATE_USER} exact={true} component={UserForm} />
            <ProtectedRoute path={ROUTES.EDIT_USER} exact={true} component={UserForm} />
            <ProtectedRoute path={ROUTES.SCAN_USER} exact={true} component={Users} />
            <ProtectedRoute path={ROUTES.DETAILS_USER} exact={true} component={UserDetails} />
            <ProtectedRoute path={ROUTES.PROFILE} exact={true} component={Profile} />
            <ProtectedRoute path={ROUTES.ATTENDANCE_DETAILS} exact={true} component={AttendanceDetails} />
            <ProtectedRoute path={ROUTES.ATTENDANCE} exact={true} component={Attendance} />
            <ProtectedRoute path={ROUTES.QR} exact={true} component={QR} allowedRoles={[ROLES.ADMIN]} />
            <ProtectedRoute
              path={ROUTES.ROOMS}
              exact={true}
              component={Rooms}
              allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}
            />
            {/* Add more protected routes here:
            <ProtectedRoute path='/settings' exact={true} component={Settings} />
            <ProtectedRoute path='/users' exact={true} component={Users} />
            <ProtectedRoute path='/rooms' exact={true} component={Rooms} />
            */}
          </IonRouterOutlet>
        </MainLayout>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
