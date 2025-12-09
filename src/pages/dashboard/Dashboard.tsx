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
  IonSpinner,
  IonBadge,
} from '@ionic/react';
import {
  personAddOutline,
  searchOutline,
  refreshOutline,
  peopleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  maleFemaleOutline,
  medkitOutline,
  shirtOutline,
  businessOutline,
  personOutline,
} from 'ionicons/icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import styles from './Dashboard.module.scss';
import { ROUTES } from '../../constants/routes';
import usePlatform from '../../hooks/usePlatform';
import Header from '../../components/Header/Header';
import { getStatistics } from '../../api/users.api';
import QUERY_KEYS from '../../constants/query-keys';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { getPercentageFromTotal } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const { isMobile } = usePlatform();

  const {
    data: statistics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.GET_STATISTICS],
    queryFn: getStatistics,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
  });

  // Socket.IO connection for real-time statistics updates
  useSocket(() => {
    refetch();
  });

  const handleRefresh = async () => {
    toast.loading('Cargando...');
    await refetch();
    toast.dismiss();
    toast.success('Datos actualizados');
  };

  // Chart data configurations
  const arrivalData = {
    labels: ['Han Llegado', 'No Han Llegado'],
    datasets: [
      {
        data: [statistics?.usersArrived || 0, statistics?.usersNotArrived || 0],
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const genderData = {
    labels: ['Hombres', 'Mujeres'],
    datasets: [
      {
        data: [statistics?.maleCount || 0, statistics?.femaleCount || 0],
        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const churchData = {
    labels: ['Miembros', 'No Miembros'],
    datasets: [
      {
        data: [statistics?.churchMembersCount || 0, statistics?.nonChurchMembersCount || 0],
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 206, 86, 0.8)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const ageRangeData = {
    labels: statistics?.ageRangeStatistics?.map((item) => item.range) || [],
    datasets: [
      {
        label: 'Cantidad de Usuarios',
        data: statistics?.ageRangeStatistics?.map((item) => item.count) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const shirtSizeData = {
    labels: statistics?.shirtSizeStatistics?.map((item) => item.size) || [],
    datasets: [
      {
        label: 'Cantidad',
        data: statistics?.shirtSizeStatistics?.map((item) => item.count) || [],
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const chartContainerStyle = {
    maxWidth: '500px',
    maxHeight: '500px',
    margin: '0 auto',
  };

  return (
    <IonPage>
      {isMobile() && <Header title='Dashboard' />}
      <IonContent className='ion-padding'>
        {/* Quick Actions */}
        <IonRow>
          <IonCol>
            <IonCard color='primary'>
              <IonCardHeader>
                <IonRow className='ion-align-items-center ion-justify-content-between'>
                  <IonCol>
                    <IonCardTitle>Acciones Rápidas</IonCardTitle>
                  </IonCol>
                  <IonCol size='auto'>
                    <IonButton size='small' color='light' onClick={handleRefresh} disabled={isLoading}>
                      <IonIcon icon={refreshOutline} slot='icon-only' />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonCardHeader>
              <IonCardContent>
                <IonRow>
                  <IonCol size='12' sizeMd='6'>
                    <IonButton
                      expand='block'
                      fill='solid'
                      color='success'
                      routerLink={ROUTES.CREATE_USER}
                      className={styles.actionButton}
                    >
                      <IonIcon slot='start' icon={personAddOutline} />
                      Registrar Participante
                    </IonButton>
                  </IonCol>
                  <IonCol size='12' sizeMd='6'>
                    <IonButton
                      expand='block'
                      fill='solid'
                      color='tertiary'
                      routerLink={ROUTES.USERS}
                      className={styles.actionButton}
                    >
                      <IonIcon slot='start' icon={searchOutline} />
                      Consultar Participantes
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>

        {isLoading ? (
          <IonCard>
            <IonCardContent className='ion-text-center ion-padding'>
              <IonSpinner name='crescent' />
              <p>Cargando estadísticas...</p>
            </IonCardContent>
          </IonCard>
        ) : (
          <>
            {/* General Statistics Cards */}
            <IonRow>
              <IonCol size='12' sizeMd='3'>
                <IonCard color='primary'>
                  <IonCardContent>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Total Usuarios</p>
                        <h1 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>{statistics?.totalUsers || 0}</h1>
                      </div>
                      <IonIcon icon={peopleOutline} style={{ fontSize: '3rem', opacity: 0.3 }} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size='12' sizeMd='3'>
                <IonCard color='success'>
                  <IonCardContent>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Han Llegado</p>
                        <h1 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>
                          {statistics?.usersArrived || 0}{' '}
                          <span className={styles.percentageSpan}>
                            / {getPercentageFromTotal(statistics?.usersArrived || 0, statistics?.totalUsers || 1)}%
                          </span>
                        </h1>
                      </div>
                      <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '3rem', opacity: 0.3 }} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size='12' sizeMd='3'>
                <IonCard color='danger'>
                  <IonCardContent>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>No Han Llegado</p>
                        <h1 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>{statistics?.usersNotArrived || 0}</h1>
                      </div>
                      <IonIcon icon={closeCircleOutline} style={{ fontSize: '3rem', opacity: 0.3 }} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size='12' sizeMd='3'>
                <IonCard color='warning'>
                  <IonCardContent>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Edad Promedio</p>
                        <h1 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>
                          {statistics?.averageAge?.toFixed(1) || 0}
                        </h1>
                      </div>
                      <IonIcon icon={maleFemaleOutline} style={{ fontSize: '3rem', opacity: 0.3 }} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            {/* Statistics Header */}
            <IonRow className={`ion-margin-top ${styles.sectionHeader}`}>
              <IonCol>
                <h3 className='ion-no-margin'>
                  <IonIcon icon={personOutline} style={{ marginRight: '0.5rem' }} />
                  Participantes
                </h3>
              </IonCol>
            </IonRow>

            {/* Charts Row 1 */}
            <IonRow>
              <IonCol size='12' sizeMd='4'>
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Estado de Llegada</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div style={chartContainerStyle}>
                      <Pie data={arrivalData} options={chartOptions} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size='12' sizeMd='4'>
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Distribución por Género</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div style={chartContainerStyle}>
                      <Pie data={genderData} options={chartOptions} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size='12' sizeMd='4'>
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Miembros de la Iglesia</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div style={chartContainerStyle}>
                      <Pie data={churchData} options={chartOptions} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            {/* Charts Row 2 */}
            <IonRow>
              <IonCol size='12' sizeMd='6'>
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Distribución por Edad</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div style={chartContainerStyle}>
                      <Bar data={ageRangeData} options={barChartOptions} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size='12' sizeMd='6'>
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={shirtOutline} style={{ marginRight: '0.5rem' }} />
                      Tallas de Polo
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div style={chartContainerStyle}>
                      <Bar data={shirtSizeData} options={barChartOptions} />
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            {/* Medical and Company Statistics */}
            <IonRow>
              <IonCol size='12' sizeMd='6'>
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={medkitOutline} style={{ marginRight: '0.5rem' }} />
                      Estadísticas Médicas
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size='6'>
                        <div className='ion-text-center'>
                          <p style={{ margin: 0, fontSize: '0.9rem' }}>Con Condición Médica</p>
                          <h2 style={{ margin: '0.5rem 0', color: 'var(--ion-color-warning)' }}>
                            {statistics?.usersWithMedicalCondition || 0}
                          </h2>
                        </div>
                      </IonCol>
                      <IonCol size='6'>
                        <div className='ion-text-center'>
                          <p style={{ margin: 0, fontSize: '0.9rem' }}>Con Tratamiento Médico</p>
                          <h2 style={{ margin: '0.5rem 0', color: 'var(--ion-color-danger)' }}>
                            {statistics?.usersWithMedicalTreatment || 0}
                          </h2>
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow className={`ion-margin-top ${styles.sectionHeader}`}>
              <IonCol>
                <h3 className='ion-no-margin'>
                  <IonIcon icon={businessOutline} style={{ marginRight: '0.5rem' }} />
                  Estacas
                </h3>
              </IonCol>
            </IonRow>
            {/* Stake Statistics */}
            <IonRow>
              <IonCol size='12'>
                <IonCard color='primary'>
                  <IonCardContent>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--ion-color-primary-contrast)' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Estaca</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Total</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Miembros</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Hombres</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Mujeres</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Llegaron</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statistics?.stakeStatistics?.map((stake) => (
                            <tr key={stake.stakeId} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                              <td style={{ padding: '0.75rem' }}>{stake.stakeName}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <IonBadge color='primary'>{stake.userCount}</IonBadge>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <IonBadge color='success'>{stake.churchMembersCount}</IonBadge>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <IonBadge color='tertiary'>{stake.maleCount}</IonBadge>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <IonBadge color='secondary'>{stake.femaleCount}</IonBadge>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <IonBadge color='warning'>{stake.arrivedCount}</IonBadge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
