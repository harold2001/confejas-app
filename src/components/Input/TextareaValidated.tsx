import { useId, useRef } from 'react';
import { IonTextarea } from '@ionic/react';
import {
  AutocompleteTypes,
  TextFieldTypes,
  IonTextareaCustomEvent,
  TextareaChangeEventDetail,
  TextareaInputEventDetail,
} from '@ionic/core';
import { FieldError, FieldValues, FieldPath, useFormContext, Controller } from 'react-hook-form';

interface FieldState {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  error?: FieldError;
}

interface Props<T extends FieldValues> {
  id?: string;
  type?: TextFieldTypes;
  placeholder?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  readonly?: boolean;
  autocomplete?: AutocompleteTypes;
  fill?: 'outline' | 'solid';
  state?: FieldState;
  inputChange?: (e: IonTextareaCustomEvent<TextareaInputEventDetail>) => void;
  inputInput?: (e: IonTextareaCustomEvent<TextareaChangeEventDetail>) => void;
  value?: string | number;
  name: FieldPath<T>;
  required?: boolean;
  rows?: number;
  className?: string;
  autoGrow?: boolean;
}

const TextareaValidated = <T extends FieldValues>({
  id,
  label,
  placeholder = '',
  disabled = false,
  readonly = false,
  helperText = '',
  fill = 'outline',
  inputChange,
  inputInput,
  name,
  required = true,
  rows = 1,
  className = '',
  autoGrow = false,
}: Props<T>) => {
  const formContext = useFormContext<T>();
  const formState = formContext?.formState;

  const reactId = useId();
  const memoId = useRef<string>('');

  //  adding default id if not provided
  if (!memoId.current) {
    memoId.current = id || reactId;
  }

  return (
    <Controller
      name={name}
      control={formContext.control}
      rules={{ required: required && !disabled ? `${label ?? 'This field'} is required` : false }}
      render={({ field, fieldState }) => {
        const showError =
          disabled || !required
            ? false
            : Boolean(fieldState?.error) ||
              (formState.isSubmitted && !field.value) ||
              (required && !field.value && fieldState.isTouched);

        return (
          <IonTextarea
            {...field}
            id={memoId.current}
            disabled={disabled}
            readonly={readonly}
            fill={fill}
            label={label}
            errorText={
              fieldState?.error?.type === 'required' ? fieldState?.error?.message ?? 'This field is required' : ''
            }
            helperText={helperText}
            className={`${showError ? 'ion-invalid ion-touched' : ''} ${className}`}
            labelPlacement='floating'
            placeholder={placeholder}
            onIonBlur={field?.onBlur}
            onIonInput={(e) => {
              field.onChange(e.detail.value);
              inputInput?.(e);
            }}
            onIonChange={(e) => {
              field.onChange(e.detail.value);
              inputChange?.(e);
            }}
            rows={rows}
            autoGrow={autoGrow}
          />
        );
      }}
    />
  );
};

export default TextareaValidated;
