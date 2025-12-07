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
  IonRow,
  IonCol,
  IonText,
  IonBadge,
} from '@ionic/react';
import { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { checkmarkCircleOutline, closeCircleOutline, homeOutline } from 'ionicons/icons';
import { verifyAttendance } from '../../../api/users.api';
import { ROUTES } from '../../../constants/routes';
import Header from '../../../components/Header/Header';
import usePlatform from '../../../hooks/usePlatform';

interface VerifyAttendanceResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    firstName: string;
    middleName?: string;
    paternalLastName: string;
    maternalLastName?: string;
    company?: {
      id: string;
      name: string;
    };
    userRooms?: Array<{
      room: {
        roomNumber: string;
      };
    }>;
    hasArrived: boolean;
  };
}

const ConfirmAttendance = () => {
  const { token } = useParams<{ token: string }>();
  const history = useHistory();
  const { isMobile } = usePlatform();
  const isMobileView = isMobile();

  const verifyMutation = useMutation<VerifyAttendanceResponse, Error, string>({
    mutationFn: verifyAttendance,
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleGoToAttendance = () => {
    history.push(ROUTES.ATTENDANCE);
  };

  const getFullName = () => {
    if (!verifyMutation.data?.user) return '';
    const { firstName, middleName, paternalLastName, maternalLastName } = verifyMutation.data.user;
    return [firstName, middleName, paternalLastName, maternalLastName].filter(Boolean).join(' ');
  };

  const getRoomNumber = () => {
    if (!verifyMutation.data?.user?.userRooms?.[0]?.room) return 'No asignada';
    return verifyMutation.data.user.userRooms[0].room.roomNumber;
  };

  return (
    <IonPage>
      {isMobileView && <Header title='Confirmar Asistencia' />}
      <IonContent className='ion-padding'>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {verifyMutation.isPending ? (
            <IonCard color='primary'>
              <IonCardContent>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <IonSpinner name='crescent' />
                  <p style={{ marginTop: '1rem' }}>Verificando código QR...</p>
                </div>
              </IonCardContent>
            </IonCard>
          ) : verifyMutation.isError ? (
            <>
              <IonCard color='danger'>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={closeCircleOutline} style={{ marginRight: '0.5rem', fontSize: '2rem' }} />
                    Error de Verificación
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                    {(verifyMutation.error as { response?: { data?: { message?: string } } })?.response?.data
                      ?.message || 'Error al verificar la asistencia'}
                  </p>
                </IonCardContent>
              </IonCard>

              <IonButton expand='block' color='primary' onClick={handleGoToAttendance} style={{ marginTop: '1rem' }}>
                <IonIcon slot='start' icon={homeOutline} />
                Ir al Inicio
              </IonButton>
            </>
          ) : verifyMutation.data?.success ? (
            <>
              <IonCard color='success'>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '0.5rem', fontSize: '2rem' }} />
                    ¡Asistencia Confirmada!
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{verifyMutation?.data?.message}</p>
                </IonCardContent>
              </IonCard>

              <IonCard color='primary'>
                <IonCardHeader>
                  <IonCardTitle>Información del Participante</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonRow className='ion-margin-bottom'>
                    <IonCol size='12'>
                      <IonText color='medium'>
                        <p style={{ margin: '0.5rem 0' }}>Nombre Completo:</p>
                      </IonText>
                      <IonText>
                        <h2 style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>{getFullName()}</h2>
                      </IonText>
                    </IonCol>
                  </IonRow>

                  <IonRow className='ion-margin-bottom'>
                    <IonCol size='12' sizeMd='6'>
                      <IonText color='medium'>
                        <p style={{ margin: '0.5rem 0' }}>Primer Nombre:</p>
                      </IonText>
                      <IonText>
                        <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
                          {verifyMutation?.data?.user?.firstName}
                        </p>
                      </IonText>
                    </IonCol>

                    {verifyMutation?.data?.user?.middleName && (
                      <IonCol size='12' sizeMd='6'>
                        <IonText color='medium'>
                          <p style={{ margin: '0.5rem 0' }}>Segundo Nombre:</p>
                        </IonText>
                        <IonText>
                          <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
                            {verifyMutation?.data?.user?.middleName}
                          </p>
                        </IonText>
                      </IonCol>
                    )}
                  </IonRow>

                  <IonRow className='ion-margin-bottom'>
                    <IonCol size='12' sizeMd='6'>
                      <IonText color='medium'>
                        <p style={{ margin: '0.5rem 0' }}>Apellido Paterno:</p>
                      </IonText>
                      <IonText>
                        <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
                          {verifyMutation?.data?.user?.paternalLastName}
                        </p>
                      </IonText>
                    </IonCol>

                    {verifyMutation?.data?.user?.maternalLastName && (
                      <IonCol size='12' sizeMd='6'>
                        <IonText color='medium'>
                          <p style={{ margin: '0.5rem 0' }}>Apellido Materno:</p>
                        </IonText>
                        <IonText>
                          <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
                            {verifyMutation?.data?.user?.maternalLastName}
                          </p>
                        </IonText>
                      </IonCol>
                    )}
                  </IonRow>

                  <IonRow className='ion-margin-bottom'>
                    <IonCol size='12' sizeMd='6'>
                      <IonText color='medium'>
                        <p style={{ margin: '0.5rem 0' }}>Compañía:</p>
                      </IonText>
                      <IonBadge color='tertiary' style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        {verifyMutation?.data?.user?.company?.name || 'No asignada'}
                      </IonBadge>
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonText color='medium'>
                        <p style={{ margin: '0.5rem 0' }}>Habitación:</p>
                      </IonText>
                      <IonBadge color='secondary' style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        {getRoomNumber()}
                      </IonBadge>
                    </IonCol>
                  </IonRow>
                </IonCardContent>
              </IonCard>

              <IonButton expand='block' color='primary' onClick={handleGoToAttendance} style={{ marginTop: '1rem' }}>
                <IonIcon slot='start' icon={homeOutline} />
                Ir al Inicio
              </IonButton>
            </>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmAttendance;
