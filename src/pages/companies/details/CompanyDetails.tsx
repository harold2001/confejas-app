import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonButton,
  IonIcon,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useHistory } from 'react-router';
import { arrowBackOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import QUERY_KEYS from '../../../constants/query-keys';
import { getCompanyById } from '../../../api/companies.api';
import Header from '../../../components/Header/Header';
import usePlatform from '../../../hooks/usePlatform';
import { ROUTES } from '../../../constants/routes';
import { IUser } from '../../../interfaces/user.interface';
import styles from './CompanyDetails.module.scss';

const CompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { isMobile } = usePlatform();
  const isMobileView = isMobile();

  const [showArrived, setShowArrived] = useState(false);
  const [showNotArrived, setShowNotArrived] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const {
    data: company,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.GET_COMPANY_BY_ID, id],
    queryFn: () => getCompanyById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <IonPage>
        {isMobileView && <Header title='Detalles de Compañía' />}
        <IonContent className='ion-padding'>
          <div className={styles.loadingContainer}>
            <IonSpinner name='crescent' />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !company) {
    return (
      <IonPage>
        {isMobileView && <Header title='Detalles de Compañía' />}
        <IonContent className='ion-padding'>
          <IonCard color='danger'>
            <IonCardContent>
              Error al cargar la información de la compañía. Por favor, intente nuevamente.
            </IonCardContent>
          </IonCard>
          <IonButton expand='block' onClick={() => history.push(ROUTES.COMPANIES)}>
            Volver a Compañías
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const arrivedUsers = company.users?.filter((user: IUser) => user.hasArrived) || [];
  const notArrivedUsers = company.users?.filter((user: IUser) => !user.hasArrived) || [];
  const allUsers = company.users || [];

  const renderUserList = (users: IUser[]) => {
    if (users.length === 0) {
      return <IonItem>No hay usuarios en esta categoría</IonItem>;
    }

    return users.map((user) => {
      const fullName = [user.firstName, user.middleName, user.paternalLastName, user.maternalLastName]
        .filter(Boolean)
        .join(' ');

      return (
        <IonItem
          key={user.id}
          button
          detail
          onClick={() => history.push(ROUTES.DETAILS_USER.replace(':id', user.id))}
          className={styles.userItem}
        >
          <IonLabel>
            <h3>{fullName}</h3>
            <p>
              {user.stake?.name?.replace('Estaca ', '').replace('Distrito ', '') || 'N/A'} / {user.ward || 'N/A'}
            </p>
          </IonLabel>
          <IonBadge slot='end' color={user.hasArrived ? 'success' : 'danger'}>
            {user.hasArrived ? 'Presente' : 'Ausente'}
          </IonBadge>
        </IonItem>
      );
    });
  };

  return (
    <IonPage>
      {isMobileView && <Header title='Detalles de Compañía' />}
      <IonContent className='ion-padding'>
        <div className={styles.detailsContainer}>
          <IonButton fill='clear' onClick={() => history.push(ROUTES.COMPANIES)} className={styles.backButton}>
            <IonIcon slot='start' icon={arrowBackOutline} />
            Volver
          </IonButton>

          {/* Header Card */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle className={styles.companyName}>{company.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                  <IonLabel>Total Inscritos</IonLabel>
                  <IonBadge color='primary' className={styles.statBadge}>
                    {allUsers.length}
                  </IonBadge>
                </div>
                <div className={styles.statItem}>
                  <IonLabel>Llegaron</IonLabel>
                  <IonBadge color='success' className={styles.statBadge}>
                    {arrivedUsers.length}
                  </IonBadge>
                </div>
                <div className={styles.statItem}>
                  <IonLabel>No Llegaron</IonLabel>
                  <IonBadge color='danger' className={styles.statBadge}>
                    {notArrivedUsers.length}
                  </IonBadge>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Lista de Participantes que Llegaron */}
          <IonCard color='primary'>
            <IonCardHeader onClick={() => setShowArrived(!showArrived)} className={styles.clickableHeader}>
              <div className={styles.headerContent}>
                <IonCardTitle className={styles.cardTitle}>
                  Participantes que Llegaron
                  <IonBadge color='success' className={styles.countBadge}>
                    {arrivedUsers.length}
                  </IonBadge>
                </IonCardTitle>
                <IonIcon icon={showArrived ? chevronUpOutline : chevronDownOutline} className={styles.chevronIcon} />
              </div>
            </IonCardHeader>
            {showArrived && (
              <IonCardContent className={styles.listContent}>
                <IonList>{renderUserList(arrivedUsers)}</IonList>
              </IonCardContent>
            )}
          </IonCard>

          {/* Lista de Participantes que No Llegaron */}
          <IonCard color='primary'>
            <IonCardHeader onClick={() => setShowNotArrived(!showNotArrived)} className={styles.clickableHeader}>
              <div className={styles.headerContent}>
                <IonCardTitle className={styles.cardTitle}>
                  Participantes que No Llegaron
                  <IonBadge color='danger' className={styles.countBadge}>
                    {notArrivedUsers.length}
                  </IonBadge>
                </IonCardTitle>
                <IonIcon icon={showNotArrived ? chevronUpOutline : chevronDownOutline} className={styles.chevronIcon} />
              </div>
            </IonCardHeader>
            {showNotArrived && (
              <IonCardContent className={styles.listContent}>
                <IonList>{renderUserList(notArrivedUsers)}</IonList>
              </IonCardContent>
            )}
          </IonCard>

          {/* Lista Completa de Participantes */}
          <IonCard color='primary'>
            <IonCardHeader onClick={() => setShowAll(!showAll)} className={styles.clickableHeader}>
              <div className={styles.headerContent}>
                <IonCardTitle className={styles.cardTitle}>
                  Todos los Participantes
                  <IonBadge color='medium' className={styles.countBadge}>
                    {allUsers.length}
                  </IonBadge>
                </IonCardTitle>
                <IonIcon icon={showAll ? chevronUpOutline : chevronDownOutline} className={styles.chevronIcon} />
              </div>
            </IonCardHeader>
            {showAll && (
              <IonCardContent className={styles.listContent}>
                <IonList>{renderUserList(allUsers)}</IonList>
              </IonCardContent>
            )}
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CompanyDetails;
