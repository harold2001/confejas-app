import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  IonSpinner,
  IonToggle,
  IonAlert,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonChip,
} from '@ionic/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { closeOutline, checkmarkCircleOutline, homeOutline, alertCircleOutline } from 'ionicons/icons';
import toast from 'react-hot-toast';
import { getUsersForRoomAssignment, assignUserToRoom } from '../../api/rooms.api';
import QUERY_KEYS from '../../constants/query-keys';
import { IRoomDetail, IUserForRoomAssignment } from '../../interfaces/room-with-details.interface';
import styles from './AssignRoomModal.module.scss';

interface AssignRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: IRoomDetail | null;
  onSuccess: () => void;
}

const ITEMS_PER_PAGE = 12;

const AssignRoomModal: React.FC<AssignRoomModalProps> = ({ isOpen, onClose, room, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithoutRoom, setShowOnlyWithoutRoom] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUserForRoomAssignment | null>(null);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<IUserForRoomAssignment[]>({
    queryKey: [QUERY_KEYS.GET_USERS_FOR_ROOM_ASSIGNMENT],
    queryFn: getUsersForRoomAssignment,
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId, roomId }: { userId: string; roomId: string }) => assignUserToRoom(userId, roomId),
    onMutate: () => {
      toast.loading('Asignando usuario a la habitación...');
    },
    onSuccess: () => {
      toast.dismissAll();
      toast.success('Usuario asignado correctamente');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ROOMS_WITH_DETAILS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USERS_FOR_ROOM_ASSIGNMENT] });
      onSuccess();
      handleClose();
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al asignar usuario';
      toast.dismissAll();
      toast.error(errorMessage);
    },
  });

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filtro de búsqueda por nombre
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchLower) ||
          user.firstName.toLowerCase().includes(searchLower) ||
          user.paternalLastName.toLowerCase().includes(searchLower) ||
          (user.maternalLastName && user.maternalLastName.toLowerCase().includes(searchLower)),
      );
    }

    // Filtro de usuarios sin habitación
    if (showOnlyWithoutRoom) {
      filtered = filtered.filter((user) => !user.hasRoom);
    }

    return filtered;
  }, [users, searchTerm, showOnlyWithoutRoom]);

  const displayedUsers = useMemo(() => {
    return filteredUsers.slice(0, displayCount);
  }, [filteredUsers, displayCount]);

  const handleLoadMore = (event: CustomEvent<void>) => {
    setTimeout(() => {
      setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
      (event.target as HTMLIonInfiniteScrollElement).complete();
    }, 500);
  };

  const handleSelectUser = (user: IUserForRoomAssignment) => {
    setSelectedUser(user);
    setShowConfirmAlert(true);
  };

  const handleConfirmAssign = () => {
    if (selectedUser && room) {
      assignMutation.mutate({ userId: selectedUser.id, roomId: room.id });
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setShowOnlyWithoutRoom(false);
    setSelectedUser(null);
    setShowConfirmAlert(false);
    setDisplayCount(ITEMS_PER_PAGE);
    onClose();
  };

  const getConfirmMessage = () => {
    if (!selectedUser || !room) return '';

    if (selectedUser.hasRoom) {
      return `El usuario ${selectedUser.fullName} ya tiene asignada la habitación ${selectedUser.currentRoom?.roomNumber}. ¿Está seguro de reasignar al usuario a la habitación ${room.roomNumber}?`;
    }

    return `¿Está seguro de añadir al usuario ${selectedUser.fullName} a la habitación ${room.roomNumber}?`;
  };

  return (
    <>
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
            <IonTitle>{room ? `Asignar usuario - Habitación ${room.roomNumber}` : 'Asignar usuario'}</IonTitle>
            <IonButtons slot='end'>
              <IonButton onClick={handleClose}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <div className={styles.assignModalContent}>
            {/* Info de habitación */}
            {room && (
              <div className={styles.roomInfoBanner}>
                <div>
                  <h3>Habitación {room.roomNumber}</h3>
                  <p>
                    Capacidad: {room.occupiedBeds}/{room.totalBeds} camas
                  </p>
                  {room.roomType && <p>Tipo: {room.roomType.name}</p>}
                </div>
                <IonBadge color={room.occupiedBeds >= room.totalBeds ? 'danger' : 'success'}>
                  {room.totalBeds - room.occupiedBeds} disponibles
                </IonBadge>
              </div>
            )}

            {/* Filtros */}
            <div className={styles.modalFilters}>
              <IonSearchbar
                value={searchTerm}
                onIonInput={(e) => setSearchTerm(e.detail.value!)}
                placeholder='Buscar por nombre o apellido'
                color='primary'
                debounce={300}
              />

              <IonItem lines='none' color='primary' className='ion-margin-top'>
                <IonLabel>Mostrar solo usuarios sin habitación</IonLabel>
                <IonToggle
                  checked={showOnlyWithoutRoom}
                  onIonChange={(e) => setShowOnlyWithoutRoom(e.detail.checked)}
                  color='success'
                />
              </IonItem>

              <div className={styles.resultsInfo}>
                <IonChip color='light'>
                  <IonLabel>{filteredUsers.length} usuarios encontrados</IonLabel>
                </IonChip>
              </div>
            </div>

            {/* Lista de usuarios */}
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <IonSpinner name='crescent' />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className={styles.noUsers}>
                <IonIcon icon={alertCircleOutline} className={styles.noUsersIcon} />
                <p>No se encontraron usuarios</p>
              </div>
            ) : (
              <>
                <IonList>
                  {displayedUsers.map((user) => (
                    <IonItem key={user.id} button onClick={() => handleSelectUser(user)} className={styles.userItem}>
                      <IonLabel>
                        <h2>{user.fullName}</h2>
                        <p>{user.email}</p>
                        {user.hasRoom && user.currentRoom && (
                          <p className={styles.userCurrentRoom}>
                            <IonIcon icon={homeOutline} className={styles.roomIcon} />
                            Habitación {user.currentRoom.roomNumber} - Piso {user.currentRoom.floorNumber} -{' '}
                            {user.currentRoom.buildingName}
                          </p>
                        )}
                      </IonLabel>
                      <div className={styles.userBadges} slot='end'>
                        {user.hasRoom && (
                          <IonBadge color='warning' className={styles.userBadge}>
                            <IonIcon icon={checkmarkCircleOutline} />
                            Con habitación
                          </IonBadge>
                        )}
                        {!user.hasRoom && (
                          <IonBadge color='medium' className={styles.userBadge}>
                            Sin habitación
                          </IonBadge>
                        )}
                      </div>
                    </IonItem>
                  ))}
                </IonList>

                {displayedUsers.length < filteredUsers.length && (
                  <IonInfiniteScroll onIonInfinite={handleLoadMore}>
                    <IonInfiniteScrollContent loadingText='Cargando más usuarios...' />
                  </IonInfiniteScroll>
                )}
              </>
            )}
          </div>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showConfirmAlert}
        onDidDismiss={() => setShowConfirmAlert(false)}
        header='Confirmar Asignación'
        message={getConfirmMessage()}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'alert-button-cancel',
            handler: () => {
              setSelectedUser(null);
            },
          },
          {
            text: 'Confirmar',
            handler: handleConfirmAssign,
            cssClass: 'alert-button-confirm',
          },
        ]}
        cssClass='custom-alert'
      />
    </>
  );
};

export default AssignRoomModal;
