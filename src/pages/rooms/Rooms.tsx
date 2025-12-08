import {
  IonPage,
  IonContent,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSearchbar,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { addOutline, peopleOutline, bedOutline } from 'ionicons/icons';
import Header from '../../components/Header/Header';
import { getRoomsWithDetails } from '../../api/rooms.api';
import QUERY_KEYS from '../../constants/query-keys';
import { IBuildingDetail, IRoomDetail } from '../../interfaces/room-with-details.interface';
import styles from './Rooms.module.scss';
import AssignRoomModal from '../../components/AssignRoomModal/AssignRoomModal';
import usePlatform from '../../hooks/usePlatform';

const Rooms = () => {
  const { isMobile } = usePlatform();
  const isMobileView = isMobile();
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [searchRoom, setSearchRoom] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'available' | 'full'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomForAssignment, setSelectedRoomForAssignment] = useState<IRoomDetail | null>(null);

  const {
    data: buildings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.GET_ROOMS_WITH_DETAILS],
    queryFn: getRoomsWithDetails,
  });

  // Filtrar habitaciones según búsqueda y filtros
  const filteredBuildings = useMemo(() => {
    if (!buildings.length) return [];

    return buildings
      .map((building) => {
        if (selectedBuilding && building.id !== selectedBuilding) {
          return null;
        }

        const floors = building.floors
          .map((floor) => {
            const rooms = floor.rooms.filter((room) => {
              // Filtro de búsqueda
              const matchesSearch = !searchRoom || room.roomNumber.toLowerCase().includes(searchRoom.toLowerCase());

              // Filtro de capacidad
              const matchesCapacity =
                capacityFilter === 'all' ||
                (capacityFilter === 'available' && room.occupiedBeds < room.totalBeds) ||
                (capacityFilter === 'full' && room.occupiedBeds >= room.totalBeds);

              // Filtro de piso
              const matchesFloor = !selectedFloor || floor.id === selectedFloor;

              return matchesSearch && matchesCapacity && matchesFloor;
            });

            return { ...floor, rooms };
          })
          .filter((floor) => floor.rooms.length > 0);

        return { ...building, floors };
      })
      .filter((building) => building !== null && building.floors.length > 0) as IBuildingDetail[];
  }, [buildings, selectedBuilding, searchRoom, capacityFilter, selectedFloor]);

  const handleOpenAssignModal = (room: IRoomDetail) => {
    setSelectedRoomForAssignment(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoomForAssignment(null);
  };

  const handleAssignSuccess = () => {
    refetch();
  };

  // Obtener el edificio actual para mostrar los pisos
  const currentBuilding = useMemo(() => {
    return buildings.find((b) => b.id === selectedBuilding);
  }, [buildings, selectedBuilding]);

  if (isLoading) {
    return (
      <IonPage>
        {isMobileView && <Header title='Habitaciones' />}
        <IonContent>
          <IonCard>
            <IonCardContent className='ion-text-center ion-padding'>
              <IonSpinner name='crescent' />
              <p>Cargando habitaciones...</p>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        {isMobileView && <Header title='Habitaciones' />}
        <IonContent>
          <div className='flex items-center justify-center h-full p-4'>
            <p className='text-red-500'>Error al cargar las habitaciones</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      {isMobileView && <Header title='Habitaciones' />}
      <IonContent>
        <div className={styles.roomsContainer}>
          {/* Tabs de edificios */}
          {buildings.length > 0 && (
            <IonSegment
              value={selectedBuilding}
              onIonChange={(e) => {
                setSelectedBuilding(e.detail.value as string);
                setSelectedFloor(null);
              }}
              className={styles.buildingTabs}
            >
              {buildings.map((building) => (
                <IonSegmentButton key={building.id} value={building.id}>
                  <IonLabel>{building.name}</IonLabel>
                </IonSegmentButton>
              ))}
            </IonSegment>
          )}

          {/* Filtros */}
          <div className={styles.filtersSection}>
            <IonSearchbar
              value={searchRoom}
              onIonInput={(e) => setSearchRoom(e.detail.value!)}
              placeholder='Buscar por número de habitación'
              color='primary'
              className={styles.searchRoom}
            />

            <div className={styles.filterChips}>
              <IonChip color={capacityFilter === 'all' ? 'success' : 'light'} onClick={() => setCapacityFilter('all')}>
                <IonLabel>Todas</IonLabel>
              </IonChip>
              <IonChip
                color={capacityFilter === 'available' ? 'success' : 'light'}
                onClick={() => setCapacityFilter('available')}
              >
                <IonLabel>Disponibles</IonLabel>
              </IonChip>
              <IonChip color={capacityFilter === 'full' ? 'danger' : 'light'} onClick={() => setCapacityFilter('full')}>
                <IonLabel>Llenas</IonLabel>
              </IonChip>
            </div>

            {/* Filtro de pisos */}
            {currentBuilding && currentBuilding.floors.length > 1 && (
              <div className={styles.floorFilter}>
                <IonChip color={!selectedFloor ? 'success' : 'light'} onClick={() => setSelectedFloor(null)}>
                  <IonLabel>Todos los pisos</IonLabel>
                </IonChip>
                {currentBuilding.floors.map((floor) => (
                  <IonChip
                    key={floor.id}
                    color={selectedFloor === floor.id ? 'success' : 'light'}
                    onClick={() => setSelectedFloor(floor.id)}
                  >
                    <IonLabel>Piso {floor.floorNumber}</IonLabel>
                  </IonChip>
                ))}
              </div>
            )}
          </div>

          {/* Acordeón de pisos */}
          {filteredBuildings.length === 0 ? (
            <div className={styles.noResults}>
              <p>No se encontraron habitaciones</p>
            </div>
          ) : (
            filteredBuildings.map((building) => (
              <IonAccordionGroup key={building.id} multiple className={styles.accordionGroup}>
                {building.floors.map((floor) => (
                  <IonAccordion key={floor.id} value={floor.id}>
                    <IonItem slot='header' color='primary'>
                      <IonLabel>
                        <h2>Piso {floor.floorNumber}</h2>
                        <p>{floor.rooms.length} habitaciones</p>
                      </IonLabel>
                    </IonItem>

                    <div slot='content' className={styles.floorContent}>
                      <IonGrid>
                        <IonRow>
                          {floor.rooms.map((room) => (
                            <IonCol key={room.id} size='12' sizeMd='6' sizeLg='4'>
                              <IonCard
                                color='primary'
                                className={`${styles.roomCard} ${
                                  room.occupiedBeds >= room.totalBeds ? styles.full : ''
                                }`}
                              >
                                <IonCardHeader>
                                  <div className={styles.roomHeader}>
                                    <IonCardTitle>Habitación {room.roomNumber}</IonCardTitle>
                                    <IonBadge color={room.occupiedBeds >= room.totalBeds ? 'danger' : 'success'}>
                                      {room.occupiedBeds}/{room.totalBeds}
                                    </IonBadge>
                                  </div>
                                  {room.roomType && <p className={styles.roomType}>{room.roomType.name}</p>}
                                </IonCardHeader>

                                <IonCardContent>
                                  <div className={styles.roomInfo}>
                                    <div className={styles.infoItem}>
                                      <IonIcon icon={bedOutline} />
                                      <span>{room.totalBeds} camas</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                      <IonIcon icon={peopleOutline} />
                                      <span>{room.occupiedBeds} ocupadas</span>
                                    </div>
                                  </div>

                                  {room.occupants.length > 0 && (
                                    <div className={styles.occupantsList}>
                                      <span className={styles.occupantsTitle}>Ocupantes:</span>
                                      {room.occupants.map((occupant) => (
                                        <span key={occupant.id} className={styles.occupantName}>
                                          • {occupant.firstName} {occupant.lastName}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <IonButton
                                    expand='block'
                                    color={room.occupiedBeds >= room.totalBeds ? 'medium' : 'success'}
                                    onClick={() => handleOpenAssignModal(room)}
                                    disabled={room.occupiedBeds >= room.totalBeds}
                                    className={styles.assignButton}
                                  >
                                    {room.occupiedBeds >= room.totalBeds ? (
                                      'Sin camas disponibles'
                                    ) : (
                                      <>
                                        <IonIcon icon={addOutline} slot='start' />
                                        Asignar habitación
                                      </>
                                    )}
                                  </IonButton>
                                </IonCardContent>
                              </IonCard>
                            </IonCol>
                          ))}
                        </IonRow>
                      </IonGrid>
                    </div>
                  </IonAccordion>
                ))}
              </IonAccordionGroup>
            ))
          )}
        </div>

        <AssignRoomModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          room={selectedRoomForAssignment}
          onSuccess={handleAssignSuccess}
        />
      </IonContent>
    </IonPage>
  );
};

export default Rooms;
