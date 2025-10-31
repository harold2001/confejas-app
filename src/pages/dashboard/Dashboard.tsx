import {
  IonButton,
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonRow,
  IonCol,
  IonText,
} from '@ionic/react';
import { personAddOutline, scanOutline, searchOutline } from 'ionicons/icons';
import styles from './Dashboard.module.scss';
import { ROUTES } from '../../constants/routes';
import usePlatform from '../../hooks/usePlatform';
import Header from '../../components/Header/Header';

const Dashboard = () => {
  const { isMobile } = usePlatform();

  return (
    <IonPage>
      {isMobile() && <Header title='Companies' />}
      <IonContent className='ion-padding'>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className='ion-text-center ion-margin-bottom'>Menu Principal</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonRow>
              <IonCol>
                <IonButton
                  fill='clear'
                  type='button'
                  color='primary'
                  routerLink={ROUTES.CREATE_USER}
                  className={styles.actionButton}
                >
                  <IonIcon aria-hidden='true' slot='start' icon={personAddOutline} className={styles.icon} />
                  <IonText>
                    <span>Registrar Nuevo Participante</span>
                  </IonText>
                </IonButton>
              </IonCol>

              <IonCol>
                <IonButton
                  fill='clear'
                  type='button'
                  color='primary'
                  routerLink={ROUTES.SCAN_USER}
                  className={styles.actionButton}
                >
                  <IonIcon aria-hidden='true' slot='start' icon={scanOutline} className={styles.icon} />
                  <IonText>
                    <span>Escanear QR</span>
                  </IonText>
                </IonButton>
              </IonCol>

              <IonCol>
                <IonButton
                  fill='clear'
                  type='button'
                  color='primary'
                  routerLink={ROUTES.USERS}
                  className={styles.actionButton}
                >
                  <IonIcon aria-hidden='true' slot='start' icon={searchOutline} className={styles.icon} />
                  <IonText>
                    <span>Consultar participantes</span>
                  </IonText>
                </IonButton>
              </IonCol>
            </IonRow>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
