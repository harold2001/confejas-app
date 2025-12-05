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
  IonChip,
  IonToggle,
  IonText,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useHistory } from 'react-router-dom';
import { arrowBackOutline, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { getUserById } from '../../../api/users.api';
import QUERY_KEYS from '../../../constants/query-keys';
import Header from '../../../components/Header/Header';
import usePlatform from '../../../hooks/usePlatform';
import { ROUTES } from '../../../constants/routes';
import { useUser } from '../../../hooks/useUser';
import styles from './AttendanceDetails.module.scss';

const AttendanceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { isMobile } = usePlatform();
  const isMobileView = isMobile();
  const { markAsArrived } = useUser();

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

  const InfoRow = ({
    label,
    value,
    highlight = false,
  }: {
    label: string;
    value: string | undefined | null;
    highlight?: boolean;
  }) => (
    <IonRow className='info-row ion-margin-bottom'>
      <IonCol size='12' sizeMd='8' className='info-value'>
        <span style={{ color: 'var(--ion-color-medium)' }}>{label}:</span>
        <IonText>
          <p
            style={{
              fontSize: highlight ? '1.1rem' : '1rem',
              fontWeight: highlight ? '600' : '400',
              margin: 0,
              color: highlight ? 'var(--ion-color-light)' : 'inherit',
            }}
          >
            {value || 'N/A'}
          </p>
        </IonText>
      </IonCol>
    </IonRow>
  );

  const BooleanRow = ({
    label,
    value,
    highlight = false,
  }: {
    label: string;
    value: boolean | undefined;
    highlight?: boolean;
  }) => (
    <IonRow className={styles['info-row']}>
      <IonCol size='12' sizeMd='4' className={styles['info-label']}>
        <span>{label}:</span>
      </IonCol>
      <IonCol size='12' sizeMd='8' className={styles['info-value']}>
        {value ? (
          <IonChip color='success' className={highlight ? styles['chip-large'] : styles['chip-normal']}>
            <IonIcon icon={checkmarkCircle} />
            <IonLabel>Sí</IonLabel>
          </IonChip>
        ) : (
          <IonChip color='danger' className={highlight ? styles['chip-large'] : styles['chip-normal']}>
            <IonIcon icon={closeCircle} />
            <IonLabel>No</IonLabel>
          </IonChip>
        )}
      </IonCol>
    </IonRow>
  );

  if (isLoading) {
    return (
      <IonPage>
        {isMobileView && <Header title='Detalles del Participante' />}
        <IonContent className='ion-padding'>
          <div className={styles['loading-container']}>
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
      {isMobileView && <Header title='Detalles del Participante' />}
      <IonContent className='ion-padding'>
        <div className={styles['attendance-details-container']}>
          <IonButton fill='clear' onClick={() => history.push(ROUTES.ATTENDANCE)} className={styles['back-button']}>
            <IonIcon slot='start' icon={arrowBackOutline} />
            Volver a Asistencia
          </IonButton>

          {/* Header Card */}
          <IonCard className={styles['header-card']}>
            <IonCardHeader>
              <IonCardTitle>{fullName}</IonCardTitle>
              <div className={styles['roles-container']}>
                {user.roles?.map((role) => (
                  <IonBadge key={role.id} color='primary'>
                    {role.name}
                  </IonBadge>
                ))}
              </div>
            </IonCardHeader>
            <IonCardContent>
              <div className={styles['attendance-toggle-container']}>
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
                <span className={user.hasArrived ? styles.present : styles.absent}>
                  {user.hasArrived ? 'Presente' : 'Ausente'}
                </span>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Información Principal - Lectura Rápida */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Información Principal</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <InfoRow label='Nombre' value={user.firstName} highlight />
              <InfoRow label='Segundo Nombre' value={user.middleName} highlight />
              <InfoRow label='Apellido Paterno' value={user.paternalLastName} highlight />
              <InfoRow label='Apellido Materno' value={user.maternalLastName} highlight />
              <InfoRow label='Compañía' value={user.company?.name} highlight />
              <InfoRow
                label='Habitación'
                value={
                  user.userRooms?.[0]?.room
                    ? `Cuarto ${user.userRooms[0].room.roomNumber} - ${user.userRooms[0].room.roomType.name}`
                    : 'No asignado'
                }
                highlight
              />
              <InfoRow label='Condición Médica' value={user.medicalCondition || 'Ninguna'} highlight />
              <InfoRow label='Condición Alimenticia' value={user.dietaryRestriction || 'Ninguna'} highlight />
              <BooleanRow label='Es Miembro de la Iglesia' value={user.isMemberOfTheChurch} highlight />
              <InfoRow label='Barrio' value={user.ward} highlight />
              <InfoRow label='Estaca' value={user.stake?.name} highlight />
            </IonCardContent>
          </IonCard>

          {/* Información Personal Adicional */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Información Adicional</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <InfoRow label='DNI' value={user.dni} />
              <InfoRow label='Edad' value={user.age} />
              <InfoRow label='Género' value={user.gender} />
              <InfoRow label='Teléfono' value={user.phone} />
              <InfoRow label='Email' value={user.email} />
              <InfoRow label='Departamento' value={user.department} />
            </IonCardContent>
          </IonCard>

          {/* Estado de Asistencia */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Estado de Asistencia</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <BooleanRow label='Ha Llegado (Check-in)' value={user.hasArrived} />
              <InfoRow label='Código de Llave' value={user.keyCode} />
            </IonCardContent>
          </IonCard>

          {/* Información Completa de Habitación */}
          {user.userRooms && user.userRooms.length > 0 && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Detalles de Habitación</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {user.userRooms.map((userRoom, index) => (
                  <div key={userRoom.id} className={styles['room-item']}>
                    <InfoRow label='Edificio' value={userRoom.room?.floor?.building?.name} />
                    <InfoRow label='Piso' value={userRoom.room?.floor?.number?.toString()} />
                    <InfoRow label='Número de Habitación' value={userRoom.room?.roomNumber} />
                    <InfoRow label='Tipo de Habitación' value={userRoom.room?.roomType?.name} />
                    <InfoRow label='Capacidad' value={`${userRoom.room?.totalBeds} camas`} />
                    {index < user.userRooms.length - 1 && <hr className={styles['room-details-separator']} />}
                  </div>
                ))}
              </IonCardContent>
            </IonCard>
          )}

          {/* Notas */}
          {user.notes && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Notas</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p className={styles['notes-content']}>{user.notes}</p>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AttendanceDetails;
