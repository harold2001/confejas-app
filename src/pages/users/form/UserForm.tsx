import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonLabel,
  IonPage,
  IonRow,
  IonSpinner,
  IonToggle,
  IonIcon,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { useIonRouter } from '@ionic/react';
import { Controller, FormProvider, useForm, FieldErrors } from 'react-hook-form';
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
import InputValidated from '../../../components/Input/InputValidated';
import PhoneInputValidated from '../../../components/Input/PhoneInputValidated';
import TextareaValidated from '../../../components/Input/TextareaValidated';
import SelectValidated from '../../../components/Input/SelectValidated';
import DateInputValidated from '../../../components/Input/DateInputValidated';
import DatetimeButtonPopoverValidated from '../../../components/DatetimeButtonPopoverValidated/DatetimeButtonPopoverValidated';
import styles from './UserForm.module.scss';
import { CreateUserDto } from '../../../interfaces/dto/create-user.dto';
import toast from 'react-hot-toast';

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

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: [QUERY_KEYS.GET_ROOMS_WITH_COUNT],
    queryFn: getRoomsWithCount,
  });

  const methods = useForm<CreateUserDto | UpdateUserDto>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      middleName: '',
      paternalLastName: '',
      maternalLastName: '',
      dni: '',
      birthDate: undefined,
      gender: undefined,
      phone: '',
      email: '',
      address: '',
      department: '',
      hasArrived: false,
      medicalCondition: '',
      medicalTreatment: '',
      keyCode: '',
      ward: '',
      stakeId: '',
      age: '',
      isMemberOfTheChurch: true,
      notes: '',
      shirtSize: '',
      bloodType: '',
      healthInsurance: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      companyId: '',
      roomId: '',
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Populate form with user data when loaded (edit mode)
  useEffect(() => {
    if (data && isEditMode) {
      reset({
        id: data.id,
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        paternalLastName: data.paternalLastName || '',
        maternalLastName: data.maternalLastName || '',
        dni: data.dni || '',
        birthDate: data.birthDate || undefined,
        gender: data.gender === 'Varón' || data.gender === 'Mujer' ? data.gender : undefined,
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        department: data.department || '',
        hasArrived: data.hasArrived ?? false,
        medicalCondition: data.medicalCondition || '',
        medicalTreatment: data.medicalTreatment || '',
        keyCode: data.keyCode || '',
        ward: data.ward || '',
        stakeId: data.stake?.id || '',
        age: data.age || '',
        isMemberOfTheChurch: data.isMemberOfTheChurch ?? true,
        notes: data.notes || '',
        shirtSize: data.shirtSize || '',
        bloodType: data.bloodType || '',
        healthInsurance: data.healthInsurance || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
        companyId: data.company?.id || '',
        roomId: data.userRooms?.[0]?.room?.id || '',
      });
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
                {/* Personal Information Section */}
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Información Personal</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size='12' sizeMd='6'>
                        <InputValidated name='firstName' label='Nombre *' placeholder='Ingrese el nombre' required />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <InputValidated
                          name='middleName'
                          label='Segundo Nombre'
                          placeholder='Ingrese el segundo nombre'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <InputValidated
                          name='paternalLastName'
                          label='Apellido Paterno *'
                          placeholder='Ingrese el apellido paterno'
                          required
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <InputValidated
                          name='maternalLastName'
                          label='Apellido Materno'
                          placeholder='Ingrese el apellido materno'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='4'>
                        <SelectValidated
                          name='gender'
                          label='Género'
                          placeholder='Seleccione el género'
                          options={[
                            { label: 'Varón', value: 'Varón' },
                            { label: 'Mujer', value: 'Mujer' },
                          ]}
                          isDesktopBoolean={isDesktop()}
                          interface='action-sheet'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='4'>
                        <InputValidated
                          name='age'
                          label='Edad'
                          type='number'
                          placeholder='Ingrese la edad'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='3'>
                        <DateInputValidated name='birthDate' label='Fecha de Nacimiento' required={false} />
                      </IonCol>

                      <IonCol size='auto' className='ion-align-self-center'>
                        <Controller
                          name='birthDate'
                          control={control}
                          render={({ field }) => (
                            <DatetimeButtonPopoverValidated
                              name='birthDate'
                              datetimeId='birthDatetime'
                              buttonId='birthButton'
                              value={field.value || null}
                              preferWheel={false}
                              maxToday
                            />
                          )}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Contact Information Section */}
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Información de Contacto</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size='12' sizeMd='6'>
                        <InputValidated
                          name='email'
                          label='Email'
                          type='email'
                          placeholder='ejemplo@correo.com'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <PhoneInputValidated name='phone' label='Teléfono' required={false} />
                      </IonCol>

                      <IonCol size='12'>
                        <TextareaValidated
                          name='address'
                          label='Dirección'
                          placeholder='Ingrese la dirección'
                          rows={2}
                          required={false}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Church Information Section */}
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Información Eclesiástica</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow className='ion-align-items-center'>
                      <IonCol size='12' sizeMd='6'>
                        <SelectValidated
                          name='stakeId'
                          label='Estaca'
                          placeholder='Seleccione una estaca'
                          options={
                            stakesLoading
                              ? [{ label: 'Cargando...', value: '' }]
                              : stakes?.map((stake) => ({ label: stake.name, value: stake.id })) || []
                          }
                          isDesktopBoolean={isDesktop()}
                          interface='action-sheet'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <InputValidated name='ward' label='Barrio' placeholder='Ingrese el barrio' required={false} />
                      </IonCol>

                      <IonCol size='12' className='ion-margin-top'>
                        <IonLabel className='ion-margin-end'>¿Es miembro de la iglesia?</IonLabel>
                        <Controller
                          name='isMemberOfTheChurch'
                          control={control}
                          render={({ field }) => (
                            <IonToggle
                              checked={field.value}
                              onIonChange={(e) => field.onChange(e.detail.checked)}
                              color='success'
                            />
                          )}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Accommodation Information Section */}
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Información de Alojamiento</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow className='ion-align-items-center'>
                      <IonCol size='12' sizeMd='6'>
                        <SelectValidated
                          name='companyId'
                          label='Compañía'
                          placeholder='Seleccione una compañía'
                          options={
                            companiesLoading
                              ? [{ label: 'Cargando...', value: '' }]
                              : companies?.map((company) => ({
                                  label: `${company.name} - ${company.userCount}`,
                                  value: company.id,
                                })) || []
                          }
                          isDesktopBoolean={isDesktop()}
                          interface='action-sheet'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <SelectValidated
                          name='roomId'
                          label='Habitación'
                          placeholder='Seleccione una habitación'
                          options={
                            roomsLoading
                              ? [{ label: 'Cargando...', value: '' }]
                              : rooms?.map((room) => ({
                                  label: `${room.floor?.building?.name || 'Sin edificio'}/${room.roomNumber} - Camas: ${
                                    room.availableBeds
                                  }/${room.totalBeds}`,
                                  value: room.id,
                                  cssClass: room.availableBeds === 0 ? 'room-full' : '',
                                })) || []
                          }
                          isDesktopBoolean={isDesktop()}
                          interface='action-sheet'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <InputValidated
                          name='keyCode'
                          label='Código de Llave'
                          placeholder='Ingrese el código de llave'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='6' className='ion-margin-top'>
                        <IonLabel className='ion-margin-end'>¿Ha llegado?</IonLabel>
                        <Controller
                          name='hasArrived'
                          control={control}
                          render={({ field }) => (
                            <IonToggle
                              checked={field.value}
                              onIonChange={(e) => field.onChange(e.detail.checked)}
                              color='success'
                            />
                          )}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Medical Information Section */}
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Información Médica</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size='12'>
                        <TextareaValidated
                          name='medicalCondition'
                          label='Condición Médica'
                          placeholder='Ingrese alguna condición médica importante'
                          rows={2}
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12'>
                        <TextareaValidated
                          name='medicalTreatment'
                          label='Tratamiento Médico'
                          placeholder='Ingrese el tratamiento que recibe'
                          rows={2}
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='4'>
                        <InputValidated
                          name='bloodType'
                          label='Tipo de Sangre'
                          placeholder='O+, A+, B+, AB+, etc.'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='4'>
                        <InputValidated
                          name='healthInsurance'
                          label='Seguro de Salud'
                          placeholder='EsSalud, SIS, Privado, etc.'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='4'>
                        <SelectValidated
                          name='shirtSize'
                          label='Talla de Polo'
                          placeholder='Seleccione la talla'
                          options={[
                            { label: 'XS', value: 'XS' },
                            { label: 'S', value: 'S' },
                            { label: 'M', value: 'M' },
                            { label: 'L', value: 'L' },
                            { label: 'XL', value: 'XL' },
                            { label: 'XXL', value: 'XXL' },
                          ]}
                          isDesktopBoolean={isDesktop()}
                          interface='action-sheet'
                          required={false}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Emergency Contact Section */}
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Contacto de Emergencia</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size='12' sizeMd='6'>
                        <InputValidated
                          name='emergencyContactName'
                          label='Nombre del Contacto'
                          placeholder='Ingrese el nombre del contacto de emergencia'
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <PhoneInputValidated
                          name='emergencyContactPhone'
                          label='Teléfono del Contacto'
                          required={false}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Additional Information Section */}
                <IonCard color='primary'>
                  <IonCardHeader>
                    <IonCardTitle>Información Adicional</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size='12'>
                        <TextareaValidated
                          name='notes'
                          label='Notas / Taller Propuesto'
                          placeholder='Ingrese notas adicionales o taller que le gustaría aprender'
                          rows={3}
                          required={false}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Action Buttons */}
                <IonRow className='ion-margin-top'>
                  <IonCol size='12' sizeMd='6'>
                    <IonButton
                      expand='block'
                      color='medium'
                      onClick={() => router.push(ROUTES.USERS, 'back')}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </IonButton>
                  </IonCol>
                  <IonCol size='12' sizeMd='6'>
                    <IonButton expand='block' type='submit' color='success' disabled={isSubmitting}>
                      {isSubmitting ? (
                        <IonSpinner name='crescent' />
                      ) : isEditMode ? (
                        'Actualizar Usuario'
                      ) : (
                        'Crear Usuario'
                      )}
                    </IonButton>
                  </IonCol>
                </IonRow>
              </form>
            </FormProvider>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default UserForm;
