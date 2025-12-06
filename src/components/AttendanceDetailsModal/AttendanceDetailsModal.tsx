import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonSpinner,
  IonRow,
  IonCol,
  IonBadge,
  IonChip,
  IonToggle,
  IonText,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { closeOutline, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { getUserById } from '../../api/users.api';
import QUERY_KEYS from '../../constants/query-keys';
import { useUser } from '../../hooks/useUser';
import styles from './AttendanceDetailsModal.module.scss';

interface AttendanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const AttendanceDetailsModal = ({ isOpen, onClose, userId }: AttendanceDetailsModalProps) => {
  const { markAsArrived } = useUser();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId!),
    enabled: isOpen && !!userId,
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

  const handleClose = () => {
    onClose();
  };

  const fullName =
    user && [user.firstName, user.middleName, user.paternalLastName, user.maternalLastName].filter(Boolean).join(' ');

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleClose}
      style={{
        '--width': '90%',
        '--max-width': '1200px',
        '--height': '90vh',
        '--border-radius': '16px',
      }}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detalles del Participante</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={handleClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner name='crescent' />
          </div>
        ) : error || !user ? (
          <IonCard color='danger'>
            <IonCardContent>Error al cargar la información del usuario. Por favor, intente nuevamente.</IonCardContent>
          </IonCard>
        ) : (
          <div className={styles['attendance-details-container']}>
            {/* Header Card */}
            <IonCard className={styles['header-card']} color='primary'>
              <IonCardHeader>
                <IonCardTitle>{fullName}</IonCardTitle>
                <div className={styles['roles-container']}>
                  {user.roles?.map((role) => (
                    <IonBadge key={role.id} color='primary'>
                      {role?.name}
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
            <IonCard color='primary'>
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
                  value={user.userRooms?.[0]?.room ? user.userRooms[0].room.roomNumber : 'No asignado'}
                  highlight
                />
                <InfoRow label='Condición Médica' value={user.medicalCondition || 'Ninguna'} highlight />
                <InfoRow label='Tratamiento Médico' value={user.medicalTreatment || 'Ninguno'} highlight />
                <BooleanRow label='Es Miembro de la Iglesia' value={user.isMemberOfTheChurch} highlight />
                <InfoRow label='Barrio' value={user.ward} highlight />
                <InfoRow label='Estaca' value={user.stake?.name} highlight />
              </IonCardContent>
            </IonCard>

            {/* Información Personal Adicional */}
            <IonCard color='primary'>
              <IonCardHeader>
                <IonCardTitle>Información Adicional</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <InfoRow label='DNI' value={user.dni} highlight />
                <InfoRow label='Edad' value={user.age} highlight />
                <InfoRow label='Género' value={user.gender} highlight />
                <InfoRow label='Teléfono' value={user.phone} highlight />
                <InfoRow label='Email' value={user.email} highlight />
              </IonCardContent>
            </IonCard>

            {/* Estado de Asistencia */}
            <IonCard color='primary'>
              <IonCardHeader>
                <IonCardTitle>Estado de Asistencia</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <BooleanRow label='Ha Llegado (Check-in)' value={user.hasArrived} />
                <InfoRow label='Código de Llave' value={user.keyCode} highlight />
              </IonCardContent>
            </IonCard>

            {/* Notas */}
            {user.notes && (
              <IonCard color='primary'>
                <IonCardHeader>
                  <IonCardTitle>Notas</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className={styles['notes-content']}>{user.notes}</p>
                </IonCardContent>
              </IonCard>
            )}
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default AttendanceDetailsModal;
