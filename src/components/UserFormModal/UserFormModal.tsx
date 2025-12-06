import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonLabel,
  IonModal,
  IonRow,
  IonSpinner,
  IonToggle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonAlert,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { getUserById } from '../../api/users.api';
import QUERY_KEYS from '../../constants/query-keys';
import { createUserSchema, updateUserSchema, CreateUserFormData, UpdateUserFormData } from '../../schemas/userSchema';
import { getStakes } from '../../api/stakes.api';
import { getRoles } from '../../api/roles.api';
import { ROLES } from '../../constants/roles';
import { closeOutline } from 'ionicons/icons';
import { useUser } from '../../hooks/useUser';
import usePlatform from '../../hooks/usePlatform';
import InputValidated from '../Input/InputValidated';
import PhoneInputValidated from '../Input/PhoneInputValidated';
import TextareaValidated from '../Input/TextareaValidated';
import SelectValidated from '../Input/SelectValidated';
import DateInputValidated from '../Input/DateInputValidated';
import DatetimeButtonPopoverValidated from '../DatetimeButtonPopoverValidated/DatetimeButtonPopoverValidated';
import { CreateUserDto } from '../../interfaces/dto/create-user.dto';
import toast from 'react-hot-toast';
import { IUser } from '../../interfaces/user.interface';

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
  const [formDataToSubmit, setFormDataToSubmit] = useState<CreateUserFormData | UpdateUserFormData | null>(null);

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

  const methods = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
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
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Populate form with user data
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && data) {
        // Edit mode: load existing user data
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
        });
      } else if (isPermutaMode && originalUser) {
        // Permuta mode: pre-fill with original user data (stakeId, ward, department, shirtSize)
        reset({
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
          department: originalUser.department || '',
          hasArrived: false,
          medicalCondition: '',
          medicalTreatment: '',
          keyCode: '',
          ward: originalUser.ward || '',
          stakeId: originalUser.stake?.id || '',
          age: '',
          isMemberOfTheChurch: true,
          notes: '',
          shirtSize: originalUser.shirtSize || '',
          bloodType: '',
          healthInsurance: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
        });
      } else {
        // Create mode: empty form
        reset({
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
        });
      }
    }
  }, [isOpen, data, originalUser, reset, isEditMode, isPermutaMode]);

  const onSubmit = async (formData: CreateUserFormData | UpdateUserFormData) => {
    if (isPermutaMode) {
      // Show confirmation alert for permuta
      setFormDataToSubmit(formData);
      setShowConfirmAlert(true);
    } else {
      await executeSubmit(formData);
    }
  };

  const executeSubmit = async (formData: CreateUserFormData | UpdateUserFormData) => {
    try {
      if (isEditMode) {
        // Update existing user
        const updateData = {
          ...(formData as UpdateUserFormData),
          birthDate: formData.birthDate || undefined,
        };
        await saveUser(updateData);
      } else if (isPermutaMode && originalUser) {
        // Permuta operation
        const participantRole = roles?.find((role) => role.name === ROLES.PARTICIPANT);
        if (!participantRole) {
          toast.error('No se encontró el rol de participante');
          return;
        }

        const permutaData = {
          ...(formData as CreateUserFormData),
          birthDate: formData.birthDate || undefined,
          password: 'password',
          roleIds: [participantRole.id],
          originalUserId: originalUser.id,
        };

        await permutaUser(permutaData);
      } else {
        // Create new user
        const participantRole = roles?.find((role) => role.name === ROLES.PARTICIPANT);
        if (!participantRole) {
          toast.error('No se encontró el rol de participante');
          return;
        }

        const createData = {
          ...(formData as CreateUserFormData),
          birthDate: formData.birthDate || undefined,
          password: 'password',
          roleIds: [participantRole.id],
        };

        await saveUser(createData as CreateUserDto);
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
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <IonSpinner name='crescent' />
            </div>
          ) : (
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
                            <InputValidated
                              name='firstName'
                              label='Nombre *'
                              placeholder='Ingrese el nombre'
                              required
                            />
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
                            <InputValidated
                              name='dni'
                              label='DNI'
                              placeholder='12345678'
                              required={false}
                              maxLength={8}
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

                          <IonCol size='12' sizeMd='6'>
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
                            <InputValidated
                              name='ward'
                              label='Barrio'
                              placeholder='Ingrese el barrio'
                              required={false}
                            />
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
                        <IonRow className='ion-align-items-center'>
                          <IonCol size='12' sizeMd='6'>
                            <InputValidated
                              name='keyCode'
                              label='Código de Llave'
                              placeholder='Ingrese el código de llave'
                              required={false}
                            />
                          </IonCol>

                          <IonCol size='12' sizeMd='6'>
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
                        <IonButton expand='block' color='medium' onClick={handleClose} disabled={isSubmitting}>
                          Cancelar
                        </IonButton>
                      </IonCol>
                      <IonCol size='12' sizeMd='6'>
                        <IonButton expand='block' type='submit' color='success' disabled={isSubmitting}>
                          {isSubmitting ? (
                            <IonSpinner name='crescent' />
                          ) : isPermutaMode ? (
                            'Hacer Permuta'
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
          )}
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showConfirmAlert}
        onDidDismiss={() => setShowConfirmAlert(false)}
        header='Confirmar Permuta'
        message={`¿Seguro que deseas hacer la permuta de ${getOriginalUserName()} por ${getNewUserName()}?`}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Confirmar',
            handler: () => {
              if (formDataToSubmit) {
                executeSubmit(formDataToSubmit);
              }
            },
          },
        ]}
      />
    </>
  );
};

export default UserFormModal;
