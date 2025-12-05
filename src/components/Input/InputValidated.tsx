import { IonInput, InputCustomEvent } from '@ionic/react';
import React, { useId, useRef, JSX } from 'react';
import {
  AutocompleteTypes,
  InputChangeEventDetail,
  IonInputCustomEvent,
  InputInputEventDetail,
  TextFieldTypes,
} from '@ionic/core';
import { FieldValues, FieldPath, useFormContext, Controller } from 'react-hook-form';

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
  inputChange?: (e: InputCustomEvent<InputChangeEventDetail>) => void;
  inputInput?: (e: IonInputCustomEvent<InputInputEventDetail>) => void;
  value?: string | number;
  name: FieldPath<T>;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  isManualError?: boolean;
}

const InputComponent = <T extends FieldValues>(
  {
    id,
    type = 'text',
    autocomplete = 'off',
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
    maxLength,
    minLength,
    value: externalValue,
    isManualError,
  }: Props<T>,
  ref: React.ForwardedRef<HTMLIonInputElement>,
) => {
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
      rules={{
        required: required && !disabled ? `${label ?? 'This field'} is required` : false,
        ...(type === 'email' && {
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Please enter a valid email address',
          },
        }),
        ...(maxLength && { maxLength: { value: maxLength, message: `Maximum ${maxLength} characters allowed` } }),
        ...(minLength && { minLength: { value: minLength, message: `Minimum ${minLength} characters required` } }),
      }}
      render={({ field, fieldState }) => {
        const isEmpty =
          type === 'number' ? field.value === '' || field.value === null || field.value === undefined : !field.value;

        const showError =
          disabled || !required
            ? false
            : Boolean(fieldState?.error) ||
              (formState.isSubmitted && isEmpty) ||
              (required && isEmpty && fieldState.isTouched) ||
              isManualError;

        return (
          <IonInput
            id={memoId.current}
            value={externalValue !== undefined ? externalValue : field.value}
            disabled={disabled}
            readonly={readonly}
            fill={fill}
            autocomplete={autocomplete}
            label={label}
            maxlength={maxLength}
            minlength={minLength}
            errorText={
              fieldState?.error?.message ||
              (fieldState?.error?.type === 'required' ? `${label ?? 'This field'} is required` : '') ||
              (fieldState?.error?.type === 'pattern' && type === 'email' ? 'Please enter a valid email address' : '')
            }
            helperText={helperText}
            className={showError ? 'ion-invalid ion-touched' : ''}
            type={type}
            labelPlacement='floating'
            placeholder={placeholder}
            onIonBlur={field.onBlur}
            ref={ref}
            onIonInput={(e) => {
              field.onChange(e.detail.value);
              inputInput?.(e);
            }}
            onIonChange={(e) => {
              field.onChange(e.detail.value);
              inputChange?.(e);
            }}
          />
        );
      }}
    />
  );
};

const InputValidated = React.forwardRef(InputComponent) as <T extends FieldValues>(
  props: Props<T> & React.RefAttributes<HTMLIonInputElement>,
) => JSX.Element;

export default InputValidated;
