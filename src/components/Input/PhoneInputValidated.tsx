import { InputCustomEvent } from '@ionic/react';
import React, { useCallback, useId, useRef, JSX } from 'react';
import {
  AutocompleteTypes,
  InputChangeEventDetail,
  TextFieldTypes,
  IonInputCustomEvent,
  InputInputEventDetail,
} from '@ionic/core';
import { FieldValues, FieldPath, useFormContext, PathValue, Path } from 'react-hook-form';
import InputValidated from './InputValidated';

// Format phone for Peru: 9xx xxx xxx (9 digits)
const formatPeruPhone = (value: string): string => {
  const digits = value?.replace(/\D/g, '') ?? '';
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
};

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
  name: FieldPath<T>;
  required?: boolean;
}

const PhoneInputComponent = <T extends FieldValues>(
  {
    id,
    type = 'tel',
    autocomplete = 'tel',
    label,
    placeholder = '9xx xxx xxx',
    disabled = false,
    readonly = false,
    helperText = '',
    fill = 'outline',
    inputChange,
    inputInput,
    name,
    required = true,
  }: Props<T>,
  ref: React.ForwardedRef<HTMLIonInputElement>,
) => {
  const { setValue, trigger, watch } = useFormContext<T>();
  const currentValue = watch(name);

  const reactId = useId();
  const memoId = useRef<string>(null);

  //  adding default id if not provided
  if (!memoId.current) {
    memoId.current = id || reactId;
  }

  const updatePhoneValue = useCallback(
    (rawValue: string) => {
      const digitsOnly = rawValue?.replace(/\D/g, '')?.slice(0, 9);

      setValue(name, digitsOnly as PathValue<T, Path<T>>, {
        shouldTouch: true,
        shouldDirty: true,
        shouldValidate: true,
      });
      trigger(name);
    },
    [name, setValue, trigger],
  );

  const handlePhoneInput = useCallback(
    (e: InputCustomEvent<InputChangeEventDetail>) => {
      const raw = e.detail.value?.toString() ?? '';
      updatePhoneValue(raw);
      inputInput?.(e);
    },
    [updatePhoneValue, inputInput],
  );

  const handlePhoneChange = useCallback(
    (e: InputCustomEvent<InputChangeEventDetail>) => {
      const raw = e.detail.value?.toString() ?? '';
      updatePhoneValue(raw);
      inputChange?.(e);
    },
    [updatePhoneValue, inputChange],
  );

  const displayValue = formatPeruPhone((currentValue as unknown as string) ?? '');

  return (
    <InputValidated<T>
      id={memoId.current}
      type={type}
      autocomplete={autocomplete}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      readonly={readonly}
      helperText={helperText}
      fill={fill}
      name={name}
      required={required}
      value={displayValue}
      inputInput={handlePhoneInput}
      inputChange={handlePhoneChange}
      ref={ref}
    />
  );
};

const PhoneInputValidated = React.forwardRef(PhoneInputComponent) as <T extends FieldValues>(
  props: Props<T> & React.RefAttributes<HTMLIonInputElement>,
) => JSX.Element;

export default PhoneInputValidated;
