import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonModal,
  IonRow,
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonAlert,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonSearchbar,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { getUserById, getUsersPaginated } from '../../api/users.api';
import QUERY_KEYS from '../../constants/query-keys';
import { getStakes } from '../../api/stakes.api';
import { getRoles } from '../../api/roles.api';
import { getCompaniesWithCount } from '../../api/companies.api';
import { getRoomsWithCount } from '../../api/rooms.api';
import { ROLES } from '../../constants/roles';
import { closeOutline, personOutline } from 'ionicons/icons';
import { useUser } from '../../hooks/useUser';
import usePlatform from '../../hooks/usePlatform';
import { CreateUserDto } from '../../interfaces/dto/create-user.dto';
import { UpdateUserDto } from '../../interfaces/dto/update-user.dto';
import toast from 'react-hot-toast';
import { IUser } from '../../interfaces/user.interface';
import UserFormFields from '../UserFormFields/UserFormFields';
import { initialValues, getDefaultValues } from '../../pages/users/form/form.helper';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'permuta';
  userId?: string;
  originalUser?: IUser;
  onSuccess: () => void;
}

const UserFormModal = ({ isOpen, onClose, mode, userId, originalUser, onSuccess }: UserFormModalProps) => {
  const { saveUser, permutaUser } = useUser();
  const { isDesktop } = usePlatform();
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<CreateUserDto | UpdateUserDto | null>(null);
  const [optionSelected, setOptionSelected] = useState<'existing' | 'new' | null>(null);
  const [permutaUserId, setPermutaUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isEditMode = mode === 'edit';
  const isPermutaMode = mode === 'permuta';

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId!),
    enabled: isEditMode && !!userId,
  });

  const { data: stakes, isLoading: stakesLoading } = useQuery({
    queryKey: [QUERY_KEYS.GET_STAKES],
    queryFn: getStakes,
  });

  const { data: roles } = useQuery({
    queryKey: [QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
  });

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: [QUERY_KEYS.GET_COMPANIES_WITH_COUNT],
    queryFn: getCompaniesWithCount,
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: [QUERY_KEYS.GET_ROOMS_WITH_COUNT],
    queryFn: getRoomsWithCount,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: [QUERY_KEYS.GET_USERS, { searchName: searchTerm }],
    queryFn: () =>
      getUsersPaginated({
        pagination: { page: 1, limit: 100 },
        filters: { searchName: searchTerm || undefined },
      }),
    enabled: isPermutaMode && optionSelected === 'existing',
  });

  const methods = useForm<CreateUserDto | UpdateUserDto>({
    mode: 'onChange',
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Populate form with user data
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && data) {
        reset(getDefaultValues(data));
      } else if (isPermutaMode && originalUser) {
        reset({
          ...initialValues,
          companyId: originalUser?.company?.id || '',
          roomId: originalUser?.userRooms?.[0]?.room?.id || '',
        });
      } else {
        reset(initialValues);
      }
    }
  }, [isOpen, data, originalUser, reset, isEditMode, isPermutaMode]);

  const onSubmit = async (formData: CreateUserDto | UpdateUserDto) => {
    if (isPermutaMode) {
      // Show confirmation alert for permuta
      setFormDataToSubmit(formData);
      setShowConfirmAlert(true);
    } else {
      await executeSubmit(formData);
    }
  };

  const executeSubmit = async (formData?: CreateUserDto | UpdateUserDto) => {
    try {
      if (isEditMode && formData) {
        await saveUser(formData);
      } else if (isPermutaMode && originalUser) {
        // Permuta con usuario existente
        if (optionSelected === 'existing' && permutaUserId) {
          const permutaData = {
            permutaUserId,
            originalUserId: originalUser.id,
            isExisting: true,
          };
          await permutaUser(permutaData);
        }
        // Permuta con nuevo usuario
        else if (optionSelected === 'new' && formData) {
          const participantRole = roles?.find((role) => role.name === ROLES.PARTICIPANT);

          if (!participantRole) {
            toast.error('No se encontró el rol de participante');
            return;
          }

          const permutaData = {
            ...(formData as CreateUserDto),
            roleIds: [participantRole.id],
            originalUserId: originalUser.id,
          };

          await permutaUser(permutaData);
        }
      } else {
        // Create new user
        const participantRole = roles?.find((role) => role.name === ROLES.PARTICIPANT);
        if (!participantRole) {
          toast.error('No se encontró el rol de participante');
          return;
        }

        const createData: CreateUserDto = {
          ...(formData as CreateUserDto),
          roleIds: [participantRole.id],
        };

        await saveUser(createData);
      }

      onSuccess();
      onClose();
    } catch {
      // Error handling is done by useUser hook
    }
  };

  const onErrors = () => {
    toast.error('Por favor, corrija los errores en el formulario antes de continuar.');
  };

  const handleClose = () => {
    reset();
    onClose();
    setOptionSelected(null);
    setFormDataToSubmit(null);
    setPermutaUserId(null);
    setSearchTerm('');
  };

  const getModalTitle = () => {
    if (isEditMode) return 'Editar Usuario';
    if (isPermutaMode) return 'Hacer Permuta';
    return 'Crear Usuario';
  };

  const getOriginalUserName = () => {
    if (!originalUser) return '';
    return `${originalUser.firstName} ${originalUser.paternalLastName}`;
  };

  const getNewUserName = () => {
    const firstName = methods.watch('firstName');
    const paternalLastName = methods.watch('paternalLastName');
    if (!firstName || !paternalLastName) return '[Nuevo Usuario]';
    return `${firstName} ${paternalLastName}`;
  };

  const handleSelectExistingUser = (user: IUser) => {
    setPermutaUserId(user.id);
    setShowConfirmAlert(true);
  };

  const getSelectedUserName = () => {
    if (!permutaUserId || !usersData) return '[Usuario Seleccionado]';
    const selectedUser = usersData.data.find((u: IUser) => u.id === permutaUserId);
    if (!selectedUser) return '[Usuario Seleccionado]';
    return `${selectedUser.firstName} ${selectedUser.paternalLastName}`;
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
            <IonTitle>{getModalTitle()}</IonTitle>
            <IonButtons slot='end'>
              <IonButton onClick={handleClose} disabled={isSubmitting}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className='ion-padding'>
          {!!isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <IonSpinner name='crescent' />
            </div>
          )}

          <IonRow>
            <IonCol size='12'>
              {isPermutaMode && originalUser && (
                <IonCard color='warning' className='ion-margin-bottom'>
                  <IonCardContent>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Usuario Original: {getOriginalUserName()}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      Este usuario cederá su cupo al nuevo usuario que estás creando.
                    </p>
                  </IonCardContent>
                </IonCard>
              )}

              {isPermutaMode && optionSelected === null && (
                <IonCard className='ion-margin-bottom'>
                  <IonCardContent>
                    <IonText color='light'>
                      <h2>Selecciona una opción para la permuta</h2>
                    </IonText>
                    <IonRow>
                      <IonCol size='12' sizeMd='6' className='ion-text-center ion-padding'>
                        <IonButton expand='block' color='light' onClick={() => setOptionSelected('existing')}>
                          Usuario Existente
                        </IonButton>
                      </IonCol>
                      <IonCol size='12' sizeMd='6' className='ion-text-center ion-padding'>
                        <IonButton expand='block' color='light' onClick={() => setOptionSelected('new')}>
                          Nuevo Usuario
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>
              )}

              {isPermutaMode && optionSelected === 'existing' && (
                <IonCard className='ion-margin-bottom'>
                  <IonCardContent>
                    <IonText color='light'>
                      <h2>Selecciona el Usuario Existente</h2>
                    </IonText>
                    <p>Busca y selecciona el usuario que recibirá el cupo del usuario original.</p>

                    <IonSearchbar
                      value={searchTerm}
                      onIonInput={(e) => setSearchTerm(e.detail.value!)}
                      placeholder='Buscar por nombre'
                      debounce={500}
                    />

                    {usersLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <IonSpinner name='crescent' />
                      </div>
                    ) : (
                      <IonList>
                        {usersData?.data
                          ?.filter((user: IUser) => user.id !== originalUser?.id)
                          .map((user: IUser) => (
                            <IonItem key={user.id} button onClick={() => handleSelectExistingUser(user)}>
                              <IonIcon icon={personOutline} slot='start' />
                              <IonLabel>
                                <h2>
                                  {user.firstName} {user.paternalLastName}
                                </h2>
                                <p>{user.email || 'Sin email'}</p>
                              </IonLabel>
                            </IonItem>
                          ))}
                      </IonList>
                    )}
                  </IonCardContent>
                </IonCard>
              )}

              {!!(!isPermutaMode || optionSelected === 'new') && (
                <FormProvider {...methods}>
                  <form onSubmit={handleSubmit(onSubmit, onErrors)}>
                    <UserFormFields
                      stakes={stakes}
                      stakesLoading={stakesLoading}
                      companies={companies}
                      companiesLoading={companiesLoading}
                      rooms={rooms}
                      roomsLoading={roomsLoading}
                      isDesktop={isDesktop()}
                      isSubmitting={isSubmitting}
                      isEditMode={isEditMode}
                      showCancelButton={true}
                      onCancel={handleClose}
                      submitButtonText={
                        isPermutaMode ? 'Hacer Permuta' : isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'
                      }
                    />
                  </form>
                </FormProvider>
              )}
            </IonCol>
          </IonRow>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showConfirmAlert}
        onDidDismiss={() => setShowConfirmAlert(false)}
        header='Confirmar Permuta'
        message={`¿Seguro que deseas hacer la permuta de ${getOriginalUserName()} por ${
          optionSelected === 'existing' ? getSelectedUserName() : getNewUserName()
        }?`}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'alert-button-cancel',
          },
          {
            text: 'Confirmar',
            cssClass: 'alert-button-confirm',
            handler: () => {
              if (optionSelected === 'existing') {
                executeSubmit();
              } else if (formDataToSubmit) {
                executeSubmit(formDataToSubmit);
              }
            },
          },
        ]}
        cssClass='custom-alert'
      />
    </>
  );
};

export default UserFormModal;
