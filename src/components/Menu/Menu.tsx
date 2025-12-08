import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  logOutOutline,
  peopleOutline,
  homeOutline,
  checkmarkDoneOutline,
  bedOutline,
  qrCodeOutline,
  bonfireOutline,
} from 'ionicons/icons';
import './Menu.css';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';

interface AppPage {
  url: string;
  icon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Inicio',
    url: ROUTES.DASHBOARD,
    icon: homeOutline,
  },
  {
    title: 'QR',
    url: ROUTES.QR,
    icon: qrCodeOutline,
  },
  {
    title: 'Asistencia',
    url: ROUTES.ATTENDANCE,
    icon: checkmarkDoneOutline,
  },
  {
    title: 'Participantes',
    url: ROUTES.USERS,
    icon: peopleOutline,
  },
  {
    title: 'Compañías',
    url: ROUTES.COMPANIES,
    icon: bonfireOutline,
  },
  {
    title: 'Habitaciones',
    url: ROUTES.ROOMS,
    icon: bedOutline,
  },
];

const Menu = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <IonMenu contentId='main' type='overlay'>
      <IonContent>
        <IonList id='inbox-list'>
          <IonListHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Bienvenido, {user?.firstName}!
          </IonListHeader>
          <IonNote>{user?.email}</IonNote>
          {appPages
            .filter((page) => {
              const isAdmin = user?.roles?.some((role) => role.name === ROLES.ADMIN);
              const isStaff = user?.roles?.some((role) => role.name === ROLES.STAFF);

              // Only show QR page for Admin users
              if (page.url === ROUTES.QR) {
                return isAdmin;
              }

              // Show Dashboard to everyone, rest only to Admin or Staff
              if (page.url === ROUTES.DASHBOARD) {
                return true;
              }

              return isAdmin || isStaff;
            })
            .map((appPage, index) => {
              return (
                <IonMenuToggle key={index} autoHide={false}>
                  <IonItem
                    className={location.pathname === appPage.url ? 'selected' : ''}
                    routerLink={appPage.url}
                    routerDirection='none'
                    lines='none'
                    detail={false}
                  >
                    <IonIcon aria-hidden='true' slot='start' icon={appPage.icon} />
                    <IonLabel>{appPage.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              );
            })}
        </IonList>

        <IonList>
          <IonMenuToggle autoHide={false}>
            <IonItem button onClick={logout} lines='none' detail={false} className='logout-item'>
              <IonIcon aria-hidden='true' slot='start' icon={logOutOutline} color='danger' />
              <IonLabel color='danger'>Cerrar Sesión</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
