import { Controller, useFormContext, FieldPath, FieldValues, PathValue } from 'react-hook-form';
import { IonSelect, IonSelectOption, SelectCustomEvent, SelectChangeEventDetail } from '@ionic/react';
import React, { MouseEvent, useId, useRef, JSX } from 'react';
import styles from './Input.module.scss';

export interface Option<V> {
  label: string;
  value: V;
}

interface Props<T extends FieldValues, Name extends FieldPath<T>> {
  name: Name;
  options: Option<PathValue<T, Name>>[] | string[];
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  fill?: 'outline' | 'solid';
  inputChange?: (e: SelectCustomEvent<SelectChangeEventDetail<PathValue<T, Name>>>) => void;
  onClick?: (e: MouseEvent<HTMLIonSelectElement>) => void;
  interface?: 'popover' | 'alert' | 'action-sheet';
  isDesktopBoolean: boolean;
  multiple?: boolean;
  id?: string;
}

const SelectComponent = <T extends FieldValues, Name extends FieldPath<T>>(
  {
    name,
    options,
    isDesktopBoolean,
    label = '',
    placeholder = '',
    required = true,
    disabled = false,
    fill = 'outline',
    inputChange,
    interface: mode = 'popover',
    multiple = false,
    id,
    onClick,
  }: Props<T, Name>,
  ref?: React.Ref<HTMLIonSelectElement>,
) => {
  const {
    control,
    formState: { isSubmitted },
  } = useFormContext<T>();

  const reactId = useId();
  const memoId = useRef<string>(null);

  //  adding default id if not provided
  if (!memoId.current) {
    memoId.current = id || reactId;
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? `${label ?? 'This field'} is required` : false }}
      render={({ field, fieldState }) => {
        const showError =
          disabled || !required
            ? false
            : Boolean(fieldState.error) ||
              (isSubmitted && !field.value) ||
              (required && !field.value && fieldState.isTouched);

        return (
          <>
            <IonSelect
              {...field}
              ref={ref}
              id={memoId.current || undefined}
              value={field.value}
              defaultValue={field.value}
              placeholder={placeholder}
              disabled={disabled}
              compareWith={(o1, o2) => o1 === o2}
              fill={fill}
              label={label}
              labelPlacement='floating'
              interface={isDesktopBoolean ? 'popover' : mode ?? 'alert'}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClick?.(e);
              }}
              onIonChange={(e) => {
                field.onChange(e.detail.value);
                inputChange?.(e);
              }}
              onIonBlur={field.onBlur}
              className={showError ? 'ion-invalid ion-touched' : ''}
              multiple={multiple}
            >
              {options?.map?.((opt) => (
                <IonSelectOption
                  key={String(typeof opt === 'string' ? opt : opt?.value)}
                  value={typeof opt === 'string' ? opt : opt?.value}
                >
                  {typeof opt === 'string' ? opt : opt.label ?? opt}
                </IonSelectOption>
              ))}
            </IonSelect>
            {fieldState?.error && <span className={styles.errorText}>{fieldState.error.message}</span>}
          </>
        );
      }}
    />
  );
};

const SelectValidated = React.forwardRef(SelectComponent) as <T extends FieldValues, Name extends FieldPath<T>>(
  props: Props<T, Name> & React.RefAttributes<HTMLIonSelectElement>,
) => JSX.Element;

export default SelectValidated;
