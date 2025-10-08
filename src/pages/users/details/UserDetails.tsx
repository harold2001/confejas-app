import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonToggle,
  IonDatetime,
  IonIcon,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { useIonRouter } from '@ionic/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { getUserById, createUser, updateUser } from '../../../api/users.api';
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
import styles from './UserDetails.module.scss';

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const router = useIonRouter();
  const isEditMode = !!id;

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, id],
    queryFn: () => getUserById(id!),
    enabled: isEditMode,
  });

  const { data: stakes, isLoading: stakesLoading } = useQuery({
    queryKey: [QUERY_KEYS.GET_STAKES],
    queryFn: getStakes,
  });

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: [QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
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
        birthDate: data.birthDate
          ? new Date(data.birthDate).toISOString()
          : undefined,
        gender: data.gender as 'Varón' | 'Mujer' | undefined,
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

  useEffect(() => {
    if (error) {
      toast.error('Error al cargar los datos del usuario');
    }
  }, [error]);

  const onSubmit = async (
    formData: CreateUserFormData | UpdateUserFormData
  ) => {
    try {
      if (isEditMode) {
        // Update existing user
        const updateData = {
          ...(formData as UpdateUserFormData),
          birthDate: formData.birthDate
            ? new Date(formData.birthDate)
            : undefined,
        };
        await updateUser(updateData as any);
        toast.success('Usuario actualizado correctamente');
      } else {
        // Create new user - find Participant role ID
        const participantRole = roles?.find(
          role => role.name === ROLES.PARTICIPANT
        );
        if (!participantRole) {
          toast.error('No se pudo encontrar el rol de Participante');
          return;
        }

        const createData = {
          ...(formData as CreateUserFormData),
          birthDate: formData.birthDate
            ? new Date(formData.birthDate)
            : undefined,
          password: 'password', // Default password
          roleIds: [participantRole.id], // Use Participant role ID
        };
        await createUser(createData as any);
        toast.success('Usuario creado correctamente');
      }
      router.push(ROUTES.USERS, 'back', 'replace');
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(
        isEditMode
          ? 'Error al actualizar el usuario'
          : 'Error al crear el usuario'
      );
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className='ion-padding'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
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
          <IonCol
            size='12'
            sizeMd='10'
            offsetMd='1'
            sizeLg='8'
            offsetLg='2'
            className={styles.headerCol}
          >
            <IonButton
              routerLink={ROUTES.USERS}
              fill='clear'
              type='button'
              color='dark'
            >
              <IonIcon
                icon={arrowBackOutline}
                slot='icon-only'
                aria-hidden='true'
              />
            </IonButton>
            <h1 className='ion-no-margin'>
              {isEditMode ? 'Editar Usuario' : 'Crear Usuario'}
            </h1>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size='12' sizeMd='10' offsetMd='1' sizeLg='8' offsetLg='2'>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Personal Information Section */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Información Personal</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonRow>
                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>
                          Nombre <span style={{ color: 'red' }}>*</span>
                        </IonLabel>
                        <Controller
                          name='firstName'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              placeholder='Ingrese el nombre'
                            />
                          )}
                        />
                      </IonItem>
                      {errors.firstName && (
                        <p style={{ color: 'red', fontSize: '12px' }}>
                          {errors.firstName.message}
                        </p>
                      )}
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>Segundo Nombre</IonLabel>
                        <Controller
                          name='middleName'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              placeholder='Ingrese el segundo nombre'
                            />
                          )}
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>
                          Apellido Paterno{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </IonLabel>
                        <Controller
                          name='paternalLastName'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              placeholder='Ingrese el apellido paterno'
                            />
                          )}
                        />
                      </IonItem>
                      {errors.paternalLastName && (
                        <p style={{ color: 'red', fontSize: '12px' }}>
                          {errors.paternalLastName.message}
                        </p>
                      )}
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>Apellido Materno</IonLabel>
                        <Controller
                          name='maternalLastName'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              placeholder='Ingrese el apellido materno'
                            />
                          )}
                        />
                      </IonItem>
                      {errors.maternalLastName && (
                        <p style={{ color: 'red', fontSize: '12px' }}>
                          {errors.maternalLastName.message}
                        </p>
                      )}
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>DNI</IonLabel>
                        <Controller
                          name='dni'
                          control={control}
                          render={({ field }) => (
                            <IonInput {...field} placeholder='Ingrese el DNI' />
                          )}
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>Género</IonLabel>
                        <Controller
                          name='gender'
                          control={control}
                          render={({ field }) => (
                            <IonSelect
                              {...field}
                              placeholder='Seleccione el género'
                            >
                              <IonSelectOption value='Varón'>
                                Varón
                              </IonSelectOption>
                              <IonSelectOption value='Mujer'>
                                Mujer
                              </IonSelectOption>
                            </IonSelect>
                          )}
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>
                          Fecha de Nacimiento
                        </IonLabel>
                        <Controller
                          name='birthDate'
                          control={control}
                          render={({ field }) => (
                            <IonDatetime {...field} presentation='date' />
                          )}
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>Edad</IonLabel>
                        <Controller
                          name='age'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              type='number'
                              placeholder='Ingrese la edad'
                            />
                          )}
                        />
                      </IonItem>
                      {errors.age && (
                        <p style={{ color: 'red', fontSize: '12px' }}>
                          {errors.age.message}
                        </p>
                      )}
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
                      <IonItem>
                        <IonLabel position='stacked'>Email</IonLabel>
                        <Controller
                          name='email'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              type='email'
                              placeholder='ejemplo@correo.com'
                            />
                          )}
                        />
                      </IonItem>
                      {errors.email && (
                        <p style={{ color: 'red', fontSize: '12px' }}>
                          {errors.email.message}
                        </p>
                      )}
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>Teléfono</IonLabel>
                        <Controller
                          name='phone'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              type='tel'
                              placeholder='Ingrese el teléfono'
                            />
                          )}
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size='12'>
                      <IonItem>
                        <IonLabel position='stacked'>Dirección</IonLabel>
                        <Controller
                          name='address'
                          control={control}
                          render={({ field }) => (
                            <IonTextarea
                              {...field}
                              placeholder='Ingrese la dirección'
                              rows={2}
                            />
                          )}
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>Región</IonLabel>
                        <Controller
                          name='region'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              placeholder='Ingrese la región'
                            />
                          )}
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>Departamento</IonLabel>
                        <Controller
                          name='department'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              placeholder='Ingrese el departamento'
                            />
                          )}
                        />
                      </IonItem>
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
                      <IonItem>
                        <IonLabel position='stacked'>Barrio</IonLabel>
                        <Controller
                          name='ward'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              placeholder='Ingrese el barrio'
                            />
                          )}
                        />
                      </IonItem>
                      {errors.ward && (
                        <p style={{ color: 'red', fontSize: '12px' }}>
                          {errors.ward.message}
                        </p>
                      )}
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>Estaca</IonLabel>
                        <Controller
                          name='stakeId'
                          control={control}
                          render={({ field }) => (
                            <IonSelect
                              {...field}
                              placeholder='Seleccione una estaca'
                            >
                              {stakesLoading ? (
                                <IonSelectOption value=''>
                                  Cargando...
                                </IonSelectOption>
                              ) : (
                                stakes?.map(stake => (
                                  <IonSelectOption
                                    key={stake.id}
                                    value={stake.id}
                                  >
                                    {stake.name}
                                  </IonSelectOption>
                                ))
                              )}
                            </IonSelect>
                          )}
                        />
                      </IonItem>
                      {errors.stakeId && (
                        <p style={{ color: 'red', fontSize: '12px' }}>
                          {errors.stakeId.message}
                        </p>
                      )}
                    </IonCol>

                    <IonCol size='12'>
                      <IonItem>
                        <IonLabel>¿Es miembro de la iglesia?</IonLabel>
                        <Controller
                          name='isMemberOfTheChurch'
                          control={control}
                          render={({ field }) => (
                            <IonToggle
                              checked={field.value}
                              onIonChange={e =>
                                field.onChange(e.detail.checked)
                              }
                            />
                          )}
                        />
                      </IonItem>
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
                      <IonItem>
                        <IonLabel position='stacked'>Condición Médica</IonLabel>
                        <Controller
                          name='medicalCondition'
                          control={control}
                          render={({ field }) => (
                            <IonTextarea
                              {...field}
                              placeholder='Ingrese alguna condición médica importante'
                              rows={3}
                            />
                          )}
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size='12'>
                      <IonItem>
                        <IonLabel position='stacked'>
                          Notas / Taller Propuesto
                        </IonLabel>
                        <Controller
                          name='notes'
                          control={control}
                          render={({ field }) => (
                            <IonTextarea
                              {...field}
                              placeholder='Ingrese notas adicionales o taller que le gustaría aprender'
                              rows={3}
                            />
                          )}
                        />
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' sizeMd='6'>
                      <IonItem>
                        <IonLabel position='stacked'>Código de Llave</IonLabel>
                        <Controller
                          name='keyCode'
                          control={control}
                          render={({ field }) => (
                            <IonInput
                              {...field}
                              placeholder='Ingrese el código de llave'
                            />
                          )}
                        />
                      </IonItem>
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
                  <IonButton
                    expand='block'
                    type='submit'
                    disabled={isSubmitting}
                  >
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
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default UserDetails;
