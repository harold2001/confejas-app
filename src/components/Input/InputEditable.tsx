import { IonIcon, IonNote, IonText } from '@ionic/react';
import { useState } from 'react';
import { pencil } from 'ionicons/icons';
import { Button } from 'primereact/button';
import { DefaultValues, FieldPath, FieldValues, FormProvider, useForm } from 'react-hook-form';
import InputValidated from './InputValidated';
import styles from './InputEditable.module.scss';
import useDispatches from '../../utils/hooks/useDispatches';
import { Types } from '../../types';
import TextareaValidated from './TextareaValidated';

interface Props<T extends FieldValues> {
  entityId: number;
  value: string | number;
  name: FieldPath<T>;
  label: string;
  refetch: Types.RefetchType;
  type?: 'input' | 'textarea';
  allowEdit?: boolean;
}

const InputEditable = <T extends FieldValues>({
  value,
  name,
  label,
  entityId,
  refetch,
  type = 'input',
  allowEdit = true,
}: Props<T>) => {
  const { saveDispatch } = useDispatches();
  const [isEditable, setIsEditable] = useState(false);
  const form = useForm<T>({
    defaultValues: {
      [name]: value,
    } as DefaultValues<T>,
  });

  const onSubmit = async (data: T) => {
    if (allowEdit) {
      await saveDispatch({ id: entityId, ...data });
      await refetch();
      setIsEditable(false);
    }
  };

  return !isEditable ? (
    <>
      <IonNote>
        {label}{' '}
        {!!allowEdit && (
          <IonIcon
            icon={pencil}
            onClick={() => {
              if (allowEdit) {
                setIsEditable(true);
              }
            }}
            className={styles.icon}
            title='Click to edit this field'
          />
        )}
      </IonNote>
      <IonText>
        <span>{value || ''}</span>
      </IonText>
    </>
  ) : (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {type === 'input' ? (
          <InputValidated label={label} name={name} />
        ) : (
          <TextareaValidated label={label} name={name} rows={4} />
        )}
        <div className={styles.buttonsContainer}>
          <Button icon='pi pi-check' type='submit' size='small' rounded text className={styles.button} />
          <Button
            icon='pi pi-times'
            type='submit'
            size='small'
            rounded
            text
            severity='danger'
            onClick={() => {
              if (allowEdit) {
                setIsEditable(false);
              }
            }}
            className={styles.button}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default InputEditable;
