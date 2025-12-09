import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonIcon,
  IonPage,
  IonRow,
  IonSpinner,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { createOutline, eyeOutline } from 'ionicons/icons';
import QUERY_KEYS from '../../constants/query-keys';
import { getCompaniesStatistics } from '../../api/companies.api';
import { ROUTES } from '../../constants/routes';
import Header from '../../components/Header/Header';
import usePlatform from '../../hooks/usePlatform';
import { CompanyStatisticsDto } from '../../interfaces/company.interface';
import MobileView from './MobileView';
import styles from './Companies.module.scss';
import { useSocket } from '../../hooks/useSocket';

const Companies = () => {
  const { isMobile } = usePlatform();
  const isMobileView = isMobile();

  const {
    data: statistics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.GET_COMPANIES_STATISTICS],
    queryFn: getCompaniesStatistics,
  });

  useSocket(() => {
    refetch();
  });

  const actionBodyTemplate = (rowData: CompanyStatisticsDto) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <IonButton
          size='default'
          fill='clear'
          title='Ver'
          routerLink={ROUTES.DETAILS_COMPANY?.replace(':id', rowData.companyId)}
        >
          <IonIcon slot='icon-only' icon={eyeOutline} />
        </IonButton>
        <IonButton
          size='default'
          fill='clear'
          color='tertiary'
          title='Editar compañía'
          routerLink={ROUTES.EDIT_COMPANY?.replace(':id', rowData.companyId)}
        >
          <IonIcon slot='icon-only' icon={createOutline} />
        </IonButton>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <IonRow className='ion-justify-content-center'>
        <IonCol size='12' sizeMd='4' className='ion-text-center'>
          <h2>Compañías</h2>
        </IonCol>
      </IonRow>
    );
  };

  return (
    <IonPage>
      {isMobileView && <Header title='Compañías' />}
      <IonContent className='ion-padding'>
        {!!isLoading && (
          <IonCard>
            <IonCardContent className='ion-text-center ion-padding'>
              <IonSpinner name='crescent' />
              <p>Cargando estadísticas...</p>
            </IonCardContent>
          </IonCard>
        )}

        {!isLoading && isMobileView && <MobileView companies={statistics} />}

        {!isLoading && !isMobileView && (
          <IonRow>
            <IonCol>
              <div className='table-container'>
                <DataTable
                  className='custom-datatable'
                  value={statistics || []}
                  stripedRows
                  loading={isLoading}
                  dataKey='companyId'
                  header={renderHeader()}
                  emptyMessage='No hay compañías disponibles'
                >
                  <Column field='companyName' header='Compañía' sortable />
                  <Column
                    field='userCount'
                    header='Inscritos'
                    body={(rowData: CompanyStatisticsDto) => (
                      <IonBadge className={styles.badge} color='primary'>
                        {rowData.userCount}
                      </IonBadge>
                    )}
                    bodyStyle={{ textAlign: 'center' }}
                    headerStyle={{ textAlign: 'center' }}
                    sortable
                  />
                  <Column
                    field='usersArrived'
                    header='Llegaron'
                    body={(rowData: CompanyStatisticsDto) => (
                      <IonBadge className={styles.badge} color='success'>
                        {rowData.usersArrived}
                      </IonBadge>
                    )}
                    bodyStyle={{ textAlign: 'center' }}
                    headerStyle={{ textAlign: 'center' }}
                    sortable
                  />
                  <Column
                    field='usersNotArrived'
                    header='No Llegaron'
                    body={(rowData: CompanyStatisticsDto) => (
                      <IonBadge className={styles.badge} color='danger'>
                        {rowData.usersNotArrived}
                      </IonBadge>
                    )}
                    bodyStyle={{ textAlign: 'center' }}
                    headerStyle={{ textAlign: 'center' }}
                    sortable
                  />
                  <Column
                    header='Acciones'
                    body={actionBodyTemplate}
                    style={{ width: '10rem' }}
                    bodyStyle={{ textAlign: 'center' }}
                    headerStyle={{ textAlign: 'center' }}
                  />
                </DataTable>
              </div>
            </IonCol>
          </IonRow>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Companies;
