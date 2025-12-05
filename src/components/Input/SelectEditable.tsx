import { IonIcon, IonNote, IonText } from '@ionic/react';
import React, { useState } from 'react';
import { pencil } from 'ionicons/icons';
import { Button } from 'primereact/button';
import { PathValue, FieldValues, FieldPath, useForm, FormProvider, DefaultValues } from 'react-hook-form';
import styles from './InputEditable.module.scss';
import SelectValidated, { Option } from './SelectValidated';
import useDispatches from '../../utils/hooks/useDispatches';
import { Types } from '../../types';

interface Props<T extends FieldValues, Name extends FieldPath<T>> {
  entityId: number;
  value: string | number | string[] | number[];
  valueToDisplay: string | number;
  name: Name;
  label: string;
  options: Option<PathValue<T, Name>>[] | string[];
  isDesktopBoolean: boolean;
  refetch: Types.RefetchType;
  multiple?: boolean;
  labelExtraContent?: React.ReactNode | null;
  allowEdit?: boolean;
}

const SelectEditable = <T extends FieldValues, Name extends FieldPath<T>>({
  value,
  valueToDisplay,
  name,
  label,
  options,
  isDesktopBoolean,
  entityId,
  refetch,
  multiple = false,
  labelExtraContent,
  allowEdit = true,
}: Props<T, Name>) => {
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
        {labelExtraContent || ''}
      </IonNote>
      <IonText>
        <span>{valueToDisplay || ''}</span>
      </IonText>
    </>
  ) : (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectValidated
          label={label}
          name={name}
          options={options}
          isDesktopBoolean={isDesktopBoolean}
          multiple={multiple}
        />
        <div className={styles.buttonsContainer}>
          <Button icon='pi pi-check' type='submit' size='small' rounded text className={styles.button} />
          <Button
            icon='pi pi-times'
            type='button'
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

export default SelectEditable;
