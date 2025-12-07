import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonCheckbox,
  IonToggle,
  IonSearchbar,
  IonSpinner,
  IonIcon,
  IonBadge,
  IonAlert,
  IonRow,
  IonCol,
  IonLabel,
} from '@ionic/react';
import { mailOutline, checkmarkCircleOutline, closeCircleOutline, sendOutline } from 'ionicons/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import toast from 'react-hot-toast';
import Header from '../../components/Header/Header';
import usePlatform from '../../hooks/usePlatform';
import { getUsersPaginated, sendQrToUsers } from '../../api/users.api';
import { getStakes } from '../../api/stakes.api';
import QUERY_KEYS from '../../constants/query-keys';
import { IUser } from '../../interfaces/user.interface';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import styles from './QR.module.scss';

const QR_CONFIRMATION_KEY = 'qr_confirmation_preference';
const ITEMS_PER_PAGE = 20;

const QR = () => {
  const { isMobile } = usePlatform();
  const queryClient = useQueryClient();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [includeStaff, setIncludeStaff] = useState(false);
  const [stakeIds, setStakeIds] = useState<string[]>([]);
  const [ward, setWard] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [skipConfirmation, setSkipConfirmation] = useState(false);

  // Load skip confirmation preference
  useEffect(() => {
    const loadPreference = async () => {
      const { value } = await Preferences.get({ key: QR_CONFIRMATION_KEY });
      setSkipConfirmation(value === 'true');
    };
    loadPreference();
  }, []);

  // Fetch stakes
  const { data: stakesData } = useQuery({
    queryKey: [QUERY_KEYS.GET_STAKES],
    queryFn: () => getStakes(),
  });

  // Fetch users with pagination
  const { data: usersData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.GET_USERS_PAGINATED, currentPage, searchQuery, includeStaff, stakeIds, ward],
    queryFn: () =>
      getUsersPaginated({
        pagination: {
          skip: (currentPage - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        },
        filters: {
          searchName: searchQuery,
          roleNames: includeStaff ? ['Participant', 'Staff'] : ['Participant'],
          hasEmail: true,
          ...(stakeIds.length > 0 && { stakeIds }),
          ...(ward && { ward }),
        },
      }),
    placeholderData: (previousData) => previousData,
  });

  const users = usersData?.data || [];
  const totalUsers = usersData?.count || 0;
  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  // Send QR Mutation
  const sendQrMutation = useMutation({
    mutationFn: (userIds: string[]) => sendQrToUsers(userIds),
    onMutate: () => {
      toast.loading('Enviando códigos QR...');
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(
        `QR enviados exitosamente: ${data.successCount} exitosos, ${data.failedCount} fallidos, ${data.skipped} omitidos`,
        {
          duration: 5000,
        },
      );
      setSelectedUserIds(new Set());
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USERS_PAGINATED] });
    },
    onError: () => {
      toast.dismiss();
      toast.error('Error al enviar los códigos QR');
    },
  });

  // Handle select all in current page
  const handleSelectAll = (checked: boolean) => {
    if (!checked) {
      // Deselect all from current page
      const newSelected = new Set(selectedUserIds);
      users.forEach((user: IUser) => {
        newSelected.delete(user.id);
      });
      setSelectedUserIds(newSelected);
    } else {
      // Select all from current page (with confirmation for qrSent users)
      const newSelected = new Set(selectedUserIds);
      users.forEach((user: IUser) => {
        if (!user.qrSent || skipConfirmation) {
          newSelected.add(user.id);
        }
      });
      setSelectedUserIds(newSelected);
    }
  };

  // Check if all users in current page are selected
  const areAllSelected = users.length > 0 && users.every((user: IUser) => selectedUserIds.has(user.id));

  // Handle user selection
  const handleUserSelection = (user: IUser) => {
    // If user already has QR sent and confirmation is not skipped
    if (user.qrSent && !skipConfirmation) {
      setPendingUserId(user.id);
      setShowConfirmation(true);
      return;
    }

    // Toggle selection
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(user.id)) {
      newSelected.delete(user.id);
    } else {
      newSelected.add(user.id);
    }
    setSelectedUserIds(newSelected);
  };

  // Handle confirmation dialog
  const handleConfirmYes = () => {
    if (pendingUserId) {
      const newSelected = new Set(selectedUserIds);
      newSelected.add(pendingUserId);
      setSelectedUserIds(newSelected);
    }
    setShowConfirmation(false);
    setPendingUserId(null);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
    setPendingUserId(null);
  };

  const handleConfirmNever = async () => {
    await Preferences.set({ key: QR_CONFIRMATION_KEY, value: 'true' });
    setSkipConfirmation(true);
    if (pendingUserId) {
      const newSelected = new Set(selectedUserIds);
      newSelected.add(pendingUserId);
      setSelectedUserIds(newSelected);
    }
    setShowConfirmation(false);
    setPendingUserId(null);
    toast.success('Preferencia guardada. No se volverá a mostrar esta confirmación.');
  };

  // Handle send QR
  const handleSendQr = () => {
    if (selectedUserIds.size === 0) {
      toast.error('Selecciona al menos un usuario');
      return;
    }
    sendQrMutation.mutate(Array.from(selectedUserIds));
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate pagination info
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalUsers);

  return (
    <IonPage>
      {isMobile() && <Header title='Enviar Códigos QR' />}
      <IonContent className='ion-padding'>
        <div className={styles.container}>
          {/* Header Card */}
          <IonCard color='primary' className={styles.header}>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={mailOutline} style={{ marginRight: '0.5rem' }} />
                Enviar Códigos QR
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>Selecciona los usuarios a quienes deseas enviar el código QR de asistencia.</IonCardContent>
          </IonCard>

          {/* Filters */}
          <IonCard color='primary'>
            <IonCardContent>
              <IonRow className='ion-align-items-center ion-justify-content-center'>
                <IonCol size='12' sizeMd='12'>
                  <IonSearchbar
                    value={searchQuery}
                    onIonInput={(e) => setSearchQuery(e.detail.value!)}
                    placeholder='Buscar por nombre o email'
                    debounce={500}
                    color='dark'
                    className='ion-no-padding'
                  />
                </IonCol>

                <IonCol size='12' sizeMd='5' className='ion-margin-top'>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Estacas</label>
                  <MultiSelect
                    value={stakeIds}
                    onChange={(e) => {
                      setStakeIds(e.value);
                      setCurrentPage(1);
                    }}
                    options={stakesData?.map((stake) => ({ label: stake.name, value: stake.id })) || []}
                    placeholder='Seleccionar Estacas'
                    className={styles.filterInput}
                    display='chip'
                    maxSelectedLabels={2}
                  />
                </IonCol>
                <IonCol size='12' sizeMd='5' className='ion-margin-top'>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Barrio</label>
                  <InputText
                    value={ward}
                    onChange={(e) => {
                      setWard(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder='Barrio'
                    className={styles.filterInput}
                  />
                </IonCol>
                <IonCol size='12' sizeMd='2' className='ion-margin-top ion-padding-top ion-text-center'>
                  <IonLabel className={styles.toggleLabel}>¿Incluir staff?</IonLabel>
                  <IonToggle
                    checked={includeStaff}
                    onIonChange={(e) => {
                      setIncludeStaff(e.detail.checked);
                      setCurrentPage(1);
                    }}
                    color='success'
                  />
                </IonCol>
                <IonCol size='12' sizeMd='12' className='ion-margin-top'>
                  <IonButton
                    expand='block'
                    color='light'
                    onClick={() => {
                      setSearchQuery('');
                      setStakeIds([]);
                      setWard('');
                      setIncludeStaff(false);
                      setCurrentPage(1);
                    }}
                  >
                    Limpiar Filtros
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>

          {/* Table */}
          <IonCard color='primary'>
            <IonCardContent>
              {isLoading ? (
                <div className={styles.loadingContainer}>
                  <IonSpinner name='crescent' />
                </div>
              ) : users.length === 0 ? (
                <div className={styles.emptyState}>
                  <IonIcon icon={closeCircleOutline} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>No se encontraron usuarios</p>
                </div>
              ) : (
                <>
                  {/* Selection Info */}
                  {selectedUserIds.size > 0 && (
                    <IonRow>
                      <IonCol>
                        <div className={styles.selectionInfo}>
                          <span className={styles.selectionText}>
                            <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '0.5rem' }} />
                            {selectedUserIds.size} usuario{selectedUserIds.size !== 1 ? 's' : ''} seleccionado
                            {selectedUserIds.size !== 1 ? 's' : ''}
                          </span>
                          <IonButton
                            color='danger'
                            fill='solid'
                            size='small'
                            onClick={() => setSelectedUserIds(new Set())}
                          >
                            Limpiar selección
                          </IonButton>
                        </div>
                      </IonCol>
                    </IonRow>
                  )}

                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead className={styles.tableHeader}>
                        <tr>
                          <th className={styles.checkboxCell}>
                            <IonCheckbox
                              checked={areAllSelected}
                              onIonChange={(e) => handleSelectAll(e.detail.checked)}
                            />
                          </th>
                          <th>Nombre Completo</th>
                          <th>Estaca / Barrio</th>
                          <th>Email</th>
                          <th className={styles.statusCell}>Estado QR</th>
                        </tr>
                      </thead>
                      <tbody className={styles.tableBody}>
                        {users.map((user: IUser) => (
                          <tr key={user.id}>
                            <td className={styles.checkboxCell}>
                              <IonCheckbox
                                checked={selectedUserIds.has(user.id)}
                                onIonChange={() => handleUserSelection(user)}
                              />
                            </td>
                            <td className={styles.nameCell}>
                              {user.firstName} {user.paternalLastName} {user.maternalLastName}
                            </td>
                            <td>
                              {user.stake?.name?.replace('Estaca ', '')?.replace('Distrito ', '')} / {user.ward}
                            </td>
                            <td>{user.email || 'Sin email'}</td>
                            <td>
                              {user.qrSent ? (
                                <IonBadge color='success'>
                                  <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '0.25rem' }} />
                                  Enviado
                                </IonBadge>
                              ) : (
                                <IonBadge color='warning'>
                                  <IonIcon icon={closeCircleOutline} style={{ marginRight: '0.25rem' }} />
                                  No enviado
                                </IonBadge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>
                      Mostrando {startIndex} - {endIndex} de {totalUsers} usuarios
                    </div>
                    <div className={styles.paginationButtons}>
                      <IonButton
                        size='small'
                        fill='solid'
                        color='light'
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </IonButton>
                      <IonButton
                        size='small'
                        fill='solid'
                        color='light'
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </IonButton>
                    </div>
                  </div>
                </>
              )}
            </IonCardContent>
          </IonCard>

          {/* Send Button */}
          <IonRow>
            <IonCol>
              <IonButton
                expand='block'
                color='success'
                size='large'
                onClick={handleSendQr}
                disabled={selectedUserIds.size === 0 || sendQrMutation.isPending}
                className={styles.sendButton}
              >
                {sendQrMutation.isPending ? (
                  <>
                    <IonSpinner name='crescent' style={{ marginRight: '0.5rem' }} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <IonIcon slot='start' icon={sendOutline} />
                    Enviar QR a {selectedUserIds.size} usuario{selectedUserIds.size !== 1 ? 's' : ''}
                  </>
                )}
              </IonButton>
            </IonCol>
          </IonRow>
        </div>

        {/* Confirmation Alert */}
        <IonAlert
          isOpen={showConfirmation}
          onDidDismiss={handleConfirmNo}
          header='QR Enviado Anteriormente'
          message='A este usuario se le ha enviado el QR de asistencia antes, ¿deseas volver a enviarle?'
          buttons={[
            {
              text: 'Sí',
              handler: handleConfirmYes,
              cssClass: 'alert-button-confirm',
            },
            {
              text: 'No',
              role: 'cancel',
              handler: handleConfirmNo,
              cssClass: 'alert-button-cancel',
            },
            {
              text: 'No volver a mostrar',
              handler: handleConfirmNever,
              cssClass: 'alert-button-confirm',
            },
          ]}
          cssClass='custom-alert'
        />
      </IonContent>
    </IonPage>
  );
};

export default QR;
