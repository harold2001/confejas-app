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
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { getUserById } from '../../api/users.api';
import QUERY_KEYS from '../../constants/query-keys';
import { getStakes } from '../../api/stakes.api';
import { getRoles } from '../../api/roles.api';
import { getCompaniesWithCount } from '../../api/companies.api';
import { getRoomsWithCount } from '../../api/rooms.api';
import { ROLES } from '../../constants/roles';
import { closeOutline } from 'ionicons/icons';
import { useUser } from '../../hooks/useUser';
import usePlatform from '../../hooks/usePlatform';
import { CreateUserDto } from '../../interfaces/dto/create-user.dto';
import { UpdateUserDto } from '../../interfaces/dto/update-user.dto';
import toast from 'react-hot-toast';
import { IUser } from '../../interfaces/user.interface';
import UserFormFields from '../UserFormFields/UserFormFields';

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
  const [formDataToSubmit, setFormDataToSubmit] = useState<Partial<CreateUserDto & UpdateUserDto> | null>(null);

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

  const methods = useForm<Partial<CreateUserDto & UpdateUserDto>>({
    mode: 'onSubmit',
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

  const onSubmit = async (formData: Partial<CreateUserDto & UpdateUserDto>) => {
    if (isPermutaMode) {
      // Show confirmation alert for permuta
      setFormDataToSubmit(formData);
      setShowConfirmAlert(true);
    } else {
      await executeSubmit(formData);
    }
  };

  const executeSubmit = async (formData: Partial<CreateUserDto & UpdateUserDto>) => {
    try {
      if (isEditMode) {
        // Update existing user
        const updateData: UpdateUserDto = {
          id: formData.id!,
          firstName: formData.firstName!,
          paternalLastName: formData.paternalLastName!,
          middleName: formData.middleName,
          maternalLastName: formData.maternalLastName,
          dni: formData.dni,
          birthDate: formData.birthDate || undefined,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          department: formData.department,
          hasArrived: formData.hasArrived,
          medicalCondition: formData.medicalCondition,
          medicalTreatment: formData.medicalTreatment,
          keyCode: formData.keyCode,
          ward: formData.ward,
          stakeId: formData.stakeId,
          companyId: formData.companyId,
          roomId: formData.roomId,
          age: formData.age,
          isMemberOfTheChurch: formData.isMemberOfTheChurch,
          notes: formData.notes,
          shirtSize: formData.shirtSize,
          bloodType: formData.bloodType,
          healthInsurance: formData.healthInsurance,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
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
          firstName: formData.firstName!,
          paternalLastName: formData.paternalLastName!,
          middleName: formData.middleName,
          maternalLastName: formData.maternalLastName,
          dni: formData.dni,
          birthDate: formData.birthDate || undefined,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          department: formData.department,
          hasArrived: formData.hasArrived,
          medicalCondition: formData.medicalCondition,
          medicalTreatment: formData.medicalTreatment,
          keyCode: formData.keyCode,
          ward: formData.ward,
          stakeId: formData.stakeId,
          companyId: formData.companyId,
          roomId: formData.roomId,
          age: formData.age,
          isMemberOfTheChurch: formData.isMemberOfTheChurch,
          notes: formData.notes,
          shirtSize: formData.shirtSize,
          bloodType: formData.bloodType,
          healthInsurance: formData.healthInsurance,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
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

        const createData: CreateUserDto = {
          firstName: formData.firstName!,
          paternalLastName: formData.paternalLastName!,
          middleName: formData.middleName,
          maternalLastName: formData.maternalLastName,
          dni: formData.dni,
          birthDate: formData.birthDate || undefined,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          department: formData.department,
          hasArrived: formData.hasArrived,
          medicalCondition: formData.medicalCondition,
          medicalTreatment: formData.medicalTreatment,
          keyCode: formData.keyCode,
          ward: formData.ward,
          stakeId: formData.stakeId,
          companyId: formData.companyId,
          roomId: formData.roomId,
          age: formData.age,
          isMemberOfTheChurch: formData.isMemberOfTheChurch,
          notes: formData.notes,
          shirtSize: formData.shirtSize,
          bloodType: formData.bloodType,
          healthInsurance: formData.healthInsurance,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          password: 'password',
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
            cssClass: 'alert-button-cancel',
          },
          {
            text: 'Confirmar',
            cssClass: 'alert-button-confirm',
            handler: () => {
              if (formDataToSubmit) {
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
