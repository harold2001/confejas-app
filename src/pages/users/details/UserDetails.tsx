import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonSpinner,
  IonButton,
  IonIcon,
  IonRow,
  IonCol,
  IonBadge,
  IonToggle,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useHistory } from 'react-router-dom';
import { useState } from 'react';
import { arrowBackOutline, swapHorizontalOutline } from 'ionicons/icons';
import { getUserById } from '../../../api/users.api';
import QUERY_KEYS from '../../../constants/query-keys';
import Header from '../../../components/Header/Header';
import usePlatform from '../../../hooks/usePlatform';
import { ROUTES } from '../../../constants/routes';
import { useUser } from '../../../hooks/useUser';
import UserFormModal from '../../../components/UserFormModal/UserFormModal';
import styles from './UserDetails.module.scss';
import { transformDBDateToDDMMYYYY } from '../../../utils/helpers';

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { isMobile } = usePlatform();
  const isMobileView = isMobile();
  const { markAsArrived } = useUser();

  // Modal state for permuta
  const [isPermutaModalOpen, setIsPermutaModalOpen] = useState(false);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <IonRow className={styles.infoRow}>
      <IonCol size='12' sizeMd='5' className={styles.infoLabel}>
        {label}
      </IonCol>
      <IonCol size='12' sizeMd='7' className={styles.infoValue}>
        <strong>{value || 'N/A'}</strong>
      </IonCol>
    </IonRow>
  );

  const BooleanRow = ({ label, value }: { label: string; value: boolean | undefined }) => (
    <IonRow className={styles.infoRow}>
      <IonCol size='12' sizeMd='5' className={styles.infoLabel}>
        {label}
      </IonCol>
      <IonCol size='12' sizeMd='7' className={styles.infoValue}>
        <IonBadge color={value ? 'success' : 'danger'}>
          <strong>{value ? 'Sí' : 'No'}</strong>
        </IonBadge>
      </IonCol>
    </IonRow>
  );

  const handlePermutaClick = () => {
    setIsPermutaModalOpen(true);
  };

  const handleModalClose = () => {
    setIsPermutaModalOpen(false);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <IonPage>
        {isMobileView && <Header title='Detalles del Participante' />}
        <IonContent className='ion-padding'>
          <div className={styles.loadingContainer}>
            <IonSpinner name='crescent' />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !user) {
    return (
      <IonPage>
        {isMobileView && <Header title='Detalles del Participante' />}
        <IonContent className='ion-padding'>
          <IonCard color='danger'>
            <IonCardContent>Error al cargar la información del usuario. Por favor, intente nuevamente.</IonCardContent>
          </IonCard>
          <IonButton expand='block' onClick={() => history.push(ROUTES.ATTENDANCE)}>
            Volver a Asistencia
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const fullName = [user.firstName, user.middleName, user.paternalLastName, user.maternalLastName]
    .filter(Boolean)
    .join(' ');

  return (
    <IonPage>
      {isMobileView && <Header title='Detalles del Participante' showBack />}
      <IonContent className='ion-padding'>
        <UserFormModal
          isOpen={isPermutaModalOpen}
          onClose={handleModalClose}
          mode='permuta'
          originalUser={user}
          onSuccess={handleModalSuccess}
        />
        <div className={styles.detailsContainer}>
          {!isMobileView && (
            <IonButton
              fill='clear'
              onClick={() => {
                if (history.length > 1) {
                  history.goBack();
                } else {
                  history.push(ROUTES.USERS);
                }
              }}
              className={styles.backButton}
            >
              <IonIcon slot='start' icon={arrowBackOutline} />
              Volver
            </IonButton>
          )}

          {/* Header Card with Actions */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle className={styles.userName}>{fullName}</IonCardTitle>
              <div className={styles.rolesContainer}>
                {user.roles?.map((role) => (
                  <IonBadge key={role.id} color='secondary'>
                    {role?.name}
                  </IonBadge>
                ))}
              </div>
            </IonCardHeader>
            <IonCardContent>
              <IonRow className='ion-align-items-center ion-justify-content-between'>
                <IonCol size='12' sizeMd='6'>
                  <div className={styles.actionItem}>
                    <IonLabel>
                      <strong>Marcar Asistencia:</strong>
                    </IonLabel>
                    <IonToggle
                      checked={user.hasArrived}
                      color='success'
                      onIonChange={async (e) => {
                        await markAsArrived({ id: user.id, body: { hasArrived: e.detail.checked } });
                        await refetch();
                      }}
                    />
                    <IonBadge color={user.hasArrived ? 'success' : 'medium'}>
                      {user.hasArrived ? 'Presente' : 'Ausente'}
                    </IonBadge>
                  </div>
                </IonCol>
                <IonCol size='12' sizeMd='6' className='ion-text-end'>
                  {user?.replacedBy ? (
                    <div className={styles.replacedByInfo}>
                      <IonLabel>
                        <strong>Participante al que le cedió el cupo:</strong>
                      </IonLabel>
                      <p>
                        {[
                          user?.replacedBy?.firstName,
                          user?.replacedBy?.middleName,
                          user?.replacedBy?.paternalLastName,
                          user?.replacedBy?.maternalLastName,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      </p>
                    </div>
                  ) : (
                    <IonButton color='warning' onClick={handlePermutaClick}>
                      <IonIcon slot='start' icon={swapHorizontalOutline} />
                      Realizar Permuta
                    </IonButton>
                  )}
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>

          {/* Información Personal */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle>Información Personal</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <InfoRow label='ID' value={user?.id} />
              <InfoRow label='Nombre' value={user?.firstName} />
              <InfoRow label='Segundo Nombre' value={user?.middleName} />
              <InfoRow label='Apellido Paterno' value={user?.paternalLastName} />
              <InfoRow label='Apellido Materno' value={user?.maternalLastName} />
              <InfoRow
                label='Fecha de Nacimiento'
                value={user?.birthDate ? transformDBDateToDDMMYYYY(user.birthDate) : 'N/A'}
              />
              <InfoRow label='Edad' value={user?.age} />
              <InfoRow label='Género' value='Male' />
            </IonCardContent>
          </IonCard>

          {/* Información de Alojamiento */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle>Información de Alojamiento</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <InfoRow label='Compañía' value={user?.company?.name} />
              <InfoRow label='Habitación' value={user?.userRooms?.[0]?.room?.roomNumber} />
              <InfoRow label='Código de Llave' value={user?.keyCode} />
              <BooleanRow label='Ha Llegado' value={user?.hasArrived} />
            </IonCardContent>
          </IonCard>

          {/* Información de Contacto */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle>Información de Contacto</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <InfoRow label='Teléfono' value={user?.phone} />
              <InfoRow label='Email' value={user?.email} />
              <InfoRow label='Dirección' value={user?.address} />
            </IonCardContent>
          </IonCard>

          {/* Información Eclesiástica */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle>Información Eclesiástica</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <BooleanRow label='Miembro de la Iglesia' value={user?.isMemberOfTheChurch} />
              <InfoRow label='Estaca' value={user?.stake?.name} />
              <InfoRow label='Barrio' value={user?.ward} />
            </IonCardContent>
          </IonCard>

          {/* Información Médica y de Salud */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle>Información Médica y de Salud</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <InfoRow label='Condición Médica' value={user?.medicalCondition} />
              <InfoRow label='Tratamiento Médico' value={user?.medicalTreatment} />
              <InfoRow label='Restricción Dietética' value={user?.dietaryRestriction} />
              <InfoRow label='Tipo de Sangre' value={user?.bloodType} />
              <InfoRow label='Seguro de Salud' value={user?.healthInsurance} />
            </IonCardContent>
          </IonCard>

          {/* Contacto de Emergencia */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle>Contacto de Emergencia</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <InfoRow label='Nombre del Contacto' value={user?.emergencyContactName} />
              <InfoRow label='Teléfono del Contacto' value={user?.emergencyContactPhone} />
            </IonCardContent>
          </IonCard>

          {/* Información Adicional */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle>Información Adicional</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <InfoRow label='Talla de Polo' value={user?.shirtSize} />
              <InfoRow label='Estado' value={user?.status} />
              <InfoRow label='Creado' value={user?.createdAt ? new Date(user?.createdAt).toLocaleString() : 'N/A'} />
              <InfoRow
                label='Actualizado'
                value={user?.updatedAt ? new Date(user?.updatedAt).toLocaleString() : 'N/A'}
              />
            </IonCardContent>
          </IonCard>

          {/* Notas */}
          <IonCard color='primary'>
            <IonCardHeader>
              <IonCardTitle>Notas</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p className={styles.notesContent}>{user?.notes || 'Sin notas'}</p>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UserDetails;
