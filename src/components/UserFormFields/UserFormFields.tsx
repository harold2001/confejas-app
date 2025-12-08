import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonLabel,
  IonRow,
  IonSpinner,
  IonToggle,
} from '@ionic/react';
import { Controller, useFormContext } from 'react-hook-form';
import InputValidated from '../Input/InputValidated';
import PhoneInputValidated from '../Input/PhoneInputValidated';
import TextareaValidated from '../Input/TextareaValidated';
import SelectValidated from '../Input/SelectValidated';
import DateInputValidated from '../Input/DateInputValidated';
import DatetimeButtonPopoverValidated from '../DatetimeButtonPopoverValidated/DatetimeButtonPopoverValidated';

interface UserFormFieldsProps {
  stakes?: Array<{ id: string; name: string }>;
  stakesLoading: boolean;
  companies?: Array<{ id: string; name: string; userCount: number }>;
  companiesLoading: boolean;
  rooms?: Array<{
    id: string;
    roomNumber: string;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    floor?: { building?: { name: string } | null } | null;
  }>;
  roomsLoading: boolean;
  isDesktop: boolean;
  isSubmitting: boolean;
  isEditMode: boolean;
  showCancelButton?: boolean;
  onCancel?: () => void;
  cancelButtonText?: string;
  submitButtonText?: string;
}

const UserFormFields = ({
  stakes,
  stakesLoading,
  companies,
  companiesLoading,
  rooms,
  roomsLoading,
  isDesktop,
  isSubmitting,
  isEditMode,
  showCancelButton = true,
  onCancel,
  cancelButtonText = 'Cancelar',
  submitButtonText,
}: UserFormFieldsProps) => {
  const { control } = useFormContext();

  return (
    <>
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
                  { label: 'Varón', value: 'Male' },
                  { label: 'Mujer', value: 'Female' },
                ]}
                isDesktopBoolean={isDesktop}
                interface='action-sheet'
                required={false}
              />
            </IonCol>

            <IonCol size='12' sizeMd='4'>
              <InputValidated name='age' label='Edad' type='number' placeholder='Ingrese la edad' required={false} />
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
                isDesktopBoolean={isDesktop}
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
                        label: `${company.name} - Asignados: ${company.userCount}`,
                        value: company.id,
                      })) || []
                }
                isDesktopBoolean={isDesktop}
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
                          room.occupiedBeds
                        }/${room.totalBeds}`,
                        value: room.id,
                        cssClass: room.occupiedBeds >= room.totalBeds ? 'room-full' : 'room-available',
                      })) || []
                }
                isDesktopBoolean={isDesktop}
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
                isDesktopBoolean={isDesktop}
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
              <PhoneInputValidated name='emergencyContactPhone' label='Teléfono del Contacto' required={false} />
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
        {showCancelButton && (
          <IonCol size='12' sizeMd='6'>
            <IonButton expand='block' color='medium' onClick={onCancel} disabled={isSubmitting}>
              {cancelButtonText}
            </IonButton>
          </IonCol>
        )}
        <IonCol size='12' sizeMd={showCancelButton ? '6' : '12'}>
          <IonButton expand='block' type='submit' color='success' disabled={isSubmitting}>
            {isSubmitting ? (
              <IonSpinner name='crescent' />
            ) : submitButtonText ? (
              submitButtonText
            ) : isEditMode ? (
              'Actualizar Usuario'
            ) : (
              'Crear Usuario'
            )}
          </IonButton>
        </IonCol>
      </IonRow>
    </>
  );
};

export default UserFormFields;
