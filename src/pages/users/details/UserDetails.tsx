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
  IonDatetime,
  IonIcon,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { useIonRouter } from '@ionic/react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { getUserById } from '../../../api/users.api';
import QUERY_KEYS from '../../../constants/query-keys';
import {
  createUserSchema,
  updateUserSchema,
  CreateUserFormData,
  UpdateUserFormData,
} from '../../../schemas/userSchema';
import { ROUTES } from '../../../constants/routes';
import { getStakes } from '../../../api/stakes.api';
import { getRoles } from '../../../api/roles.api';
import { ROLES } from '../../../constants/roles';
import { arrowBackOutline } from 'ionicons/icons';
import { useUser } from '../../../hooks/useUser';
import usePlatform from '../../../hooks/usePlatform';
import InputValidated from '../../../components/Input/InputValidated';
import PhoneInputValidated from '../../../components/Input/PhoneInputValidated';
import TextareaValidated from '../../../components/Input/TextareaValidated';
import SelectValidated from '../../../components/Input/SelectValidated';
import styles from './UserDetails.module.scss';
import { CreateUserDto } from '../../../interfaces/dto/create-user.dto';

const UserDetails = () => {
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

  const methods = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      paternalLastName: '',
      maternalLastName: '',
      dni: '',
      gender: undefined,
      phone: '',
      email: '',
      address: '',
      region: '',
      department: '',
      medicalCondition: '',
      keyCode: '',
      ward: '',
      stakeId: '',
      age: '',
      isMemberOfTheChurch: true,
      notes: '',
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
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
        gender: data.gender === 'Varón' || data.gender === 'Mujer' ? data.gender : undefined,
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        region: data.region || '',
        department: data.department || '',
        medicalCondition: data.medicalCondition || '',
        keyCode: data.keyCode || '',
        ward: data.ward || '',
        stakeId: data.stake?.id || '',
        age: data.age || '',
        isMemberOfTheChurch: data.isMemberOfTheChurch ?? true,
        notes: data.notes || '',
      });
    }
  }, [data, reset, isEditMode]);

  const onSubmit = async (formData: CreateUserFormData | UpdateUserFormData) => {
    try {
      if (isEditMode) {
        // Update existing user
        const updateData = {
          ...(formData as UpdateUserFormData),
          birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
        };
        await saveUser(updateData);
        await refetch();
      } else {
        // Create new user - find Participant role ID
        const participantRole = roles?.find((role) => role.name === ROLES.PARTICIPANT);
        if (!participantRole) {
          return;
        }

        const createData = {
          ...(formData as CreateUserFormData),
          birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
          password: 'password', // Default password
          roleIds: [participantRole.id], // Use Participant role ID
        };

        await saveUser(createData as CreateUserDto);
        router.push(ROUTES.USERS, 'back', 'replace');
      }
    } catch {
      // Error handling is done by useUser hook
    }
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
          <IonCol size='12' sizeMd='10' offsetMd='1' sizeLg='8' offsetLg='2' className={styles.headerCol}>
            <IonButton routerLink={ROUTES.USERS} fill='clear' type='button' className={styles.backButton}>
              <IonIcon icon={arrowBackOutline} slot='start' />
              Volver
            </IonButton>
            <h1 className='ion-no-margin'>{isEditMode ? 'Editar Usuario' : 'Crear Usuario'}</h1>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size='12' sizeMd='10' offsetMd='1' sizeLg='8' offsetLg='2'>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Personal Information Section */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Información Personal</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size='12' sizeMd='6'>
                        <InputValidated name='firstName' label='Nombre' placeholder='Ingrese el nombre' required />
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
                          label='Apellido Paterno'
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

                      <IonCol size='12' sizeMd='6'>
                        <InputValidated name='dni' label='DNI' placeholder='Ingrese el DNI' required={false} />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
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

                      <IonCol size='12' sizeMd='6'>
                        <IonLabel position='stacked'>Fecha de Nacimiento</IonLabel>
                        <Controller
                          name='birthDate'
                          control={control}
                          render={({ field }) => <IonDatetime {...field} presentation='date' />}
                        />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <InputValidated
                          name='age'
                          label='Edad'
                          type='number'
                          placeholder='Ingrese la edad'
                          required={false}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Contact Information Section */}
                <IonCard>
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

                      <IonCol size='12' sizeMd='6'>
                        <InputValidated name='region' label='Región' placeholder='Ingrese la región' required={false} />
                      </IonCol>

                      <IonCol size='12' sizeMd='6'>
                        <InputValidated
                          name='department'
                          label='Departamento'
                          placeholder='Ingrese el departamento'
                          required={false}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Church Information Section */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Información Eclesiástica</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size='12' sizeMd='6'>
                        <InputValidated name='ward' label='Barrio' placeholder='Ingrese el barrio' required={false} />
                      </IonCol>

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

                      <IonCol size='12'>
                        <IonLabel>¿Es miembro de la iglesia?</IonLabel>
                        <Controller
                          name='isMemberOfTheChurch'
                          control={control}
                          render={({ field }) => (
                            <IonToggle checked={field.value} onIonChange={(e) => field.onChange(e.detail.checked)} />
                          )}
                        />
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>

                {/* Additional Information Section */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Información Adicional</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size='12'>
                        <TextareaValidated
                          name='medicalCondition'
                          label='Condición Médica'
                          placeholder='Ingrese alguna condición médica importante'
                          rows={3}
                          required={false}
                        />
                      </IonCol>

                      <IonCol size='12'>
                        <TextareaValidated
                          name='notes'
                          label='Notas / Taller Propuesto'
                          placeholder='Ingrese notas adicionales o taller que le gustaría aprender'
                          rows={3}
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

export default UserDetails;
