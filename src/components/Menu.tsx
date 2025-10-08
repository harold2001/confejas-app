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
import { logOutOutline, peopleOutline, homeOutline } from 'ionicons/icons';
import './Menu.css';
import { useAuthStore } from '../store/useAuthStore';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

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
    title: 'Participantes',
    url: ROUTES.USERS,
    icon: peopleOutline,
  },
];

const Menu: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <IonMenu contentId='main' type='overlay'>
      <IonContent>
        <IonList id='inbox-list'>
          <IonListHeader>
            Bienvenido, {user?.firstName} {user?.paternalLastName}!
          </IonListHeader>
          <IonNote>{user?.email}</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={
                    location.pathname === appPage.url ? 'selected' : ''
                  }
                  routerLink={appPage.url}
                  routerDirection='none'
                  lines='none'
                  detail={false}
                >
                  <IonIcon
                    aria-hidden='true'
                    slot='start'
                    icon={appPage.icon}
                  />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        <IonList>
          <IonMenuToggle autoHide={false}>
            <IonItem
              button
              onClick={logout}
              lines='none'
              detail={false}
              className='logout-item'
            >
              <IonIcon aria-hidden='true' slot='start' icon={logOutOutline} />
              <IonLabel>Logout</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
