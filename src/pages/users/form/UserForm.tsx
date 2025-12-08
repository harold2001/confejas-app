import { IonButton, IonCol, IonContent, IonPage, IonRow, IonSpinner, IonIcon } from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { useIonRouter } from '@ionic/react';
import { FormProvider, useForm, FieldErrors } from 'react-hook-form';
import { useEffect } from 'react';
import { getUserById } from '../../../api/users.api';
import QUERY_KEYS from '../../../constants/query-keys';
import { UpdateUserDto } from '../../../interfaces/dto/update-user.dto';
import { ROUTES } from '../../../constants/routes';
import { getStakes } from '../../../api/stakes.api';
import { getRoles } from '../../../api/roles.api';
import { getCompaniesWithCount } from '../../../api/companies.api';
import { getRoomsWithCount } from '../../../api/rooms.api';
import { ROLES } from '../../../constants/roles';
import { arrowBackOutline } from 'ionicons/icons';
import { useUser } from '../../../hooks/useUser';
import usePlatform from '../../../hooks/usePlatform';
import styles from './UserForm.module.scss';
import { CreateUserDto } from '../../../interfaces/dto/create-user.dto';
import toast from 'react-hot-toast';
import UserFormFields from '../../../components/UserFormFields/UserFormFields';
import { initialValues, getDefaultValues } from './form.helper';

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const router = useIonRouter();
  const isEditMode = !!id;
  const { saveUser } = useUser();
  const { isDesktop } = usePlatform();

  const { data, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, id],
    queryFn: () => getUserById(id!),
    enabled: isEditMode,
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

  const {
    data: rooms,
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: [QUERY_KEYS.GET_ROOMS_WITH_COUNT],
    queryFn: getRoomsWithCount,
    staleTime: 0,
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

  // Populate form with user data when loaded (edit mode)
  useEffect(() => {
    if (data && isEditMode) {
      reset(getDefaultValues(data));
    }
  }, [data, reset, isEditMode]);

  const onSubmit = async (formData: CreateUserDto | UpdateUserDto) => {
    try {
      if (isEditMode) {
        // Update existing user
        const updateData: UpdateUserDto = {
          id: id!,
          ...formData,
          birthDate: formData.birthDate || undefined,
        };
        await saveUser(updateData);
        await refetch();
        await refetchRooms();
      } else {
        // Create new user - find Participant role ID
        const participantRole = roles?.find((role) => role.name === ROLES.PARTICIPANT);
        if (!participantRole) {
          return;
        }

        const createData: CreateUserDto = {
          ...formData,
          firstName: formData.firstName!,
          paternalLastName: formData.paternalLastName!,
          birthDate: formData.birthDate || undefined,
          password: 'password', // Default password
          roleIds: [participantRole.id], // Use Participant role ID
        };

        await saveUser(createData);
        router.push(ROUTES.USERS, 'back', 'replace');
      }
    } catch {
      // Error handling is done by useUser hook
    }
  };

  const onErrors = (errors: FieldErrors<Partial<CreateUserDto & UpdateUserDto>>) => {
    const errorFields = Object.keys(errors).map((key) => {
      const error = errors[key as keyof typeof errors];
      return error?.message || key;
    });
    toast.error(`Por favor, corrija los siguientes errores: ${errorFields.join(', ')}`);
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className='ion-padding'>
          <div className={styles.loadingContainer}>
            <IonSpinner name='crescent' />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className='ion-padding'>
        <IonRow>
          <IonCol size='12' sizeMd='11' offsetMd='0.5' sizeLg='10' offsetLg='1' className={styles.headerCol}>
            <IonButton routerLink={ROUTES.USERS} fill='clear' type='button' className={styles.backButton}>
              <IonIcon icon={arrowBackOutline} slot='start' />
              Volver
            </IonButton>
            <h1 className='ion-no-margin'>{isEditMode ? 'Editar Usuario' : 'Crear Usuario'}</h1>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size='12' sizeMd='11' offsetMd='0.5' sizeLg='10' offsetLg='1'>
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
                  onCancel={() => router.push(ROUTES.USERS, 'back')}
                />
              </form>
            </FormProvider>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default UserForm;
