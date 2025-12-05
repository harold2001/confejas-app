import { useId, useRef } from 'react';
import { InputCustomEvent } from '@ionic/react';
import { maskitoDateOptionsGenerator } from '@maskito/kit';
import { useMaskito } from '@maskito/react';
import { format, isAfter, isValid, parseISO } from 'date-fns';
import { FieldPath, FieldValues, PathValue, useFormContext, useWatch } from 'react-hook-form';
import InputValidated from './InputValidated';
import { getFormattedDateToSave } from '../../utils/helpers';

interface Props<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  readonly?: boolean;
  onIonChange?: (event: InputCustomEvent) => void;
  disabled?: boolean;
  id?: string;
  helperText?: string;
  required?: boolean;
  fill?: 'outline' | 'solid';
  maxToday?: boolean;
}

const DateInputValidated = <T extends FieldValues>({
  label,
  onIonChange,
  name,
  readonly = false,
  disabled = false,
  id,
  helperText,
  required = true,
  fill,
  maxToday = false,
}: Props<T>) => {
  const { control, setValue } = useFormContext<T>();
  const valueToFormat = useWatch({ control, name });

  const reactId = useId();
  const memoId = useRef<string>(null);

  //  adding default id if not provided
  if (!memoId.current) {
    memoId.current = id || reactId;
  }

  const optionsMask = maskitoDateOptionsGenerator({
    mode: 'mm/dd/yyyy',
    separator: '-',
  });

  const maskedInputRef = useMaskito({ options: optionsMask });

  function isValidDate(): boolean {
    if (!valueToFormat || valueToFormat.length < 10) return false;

    const date = parseISO(valueToFormat);
    return isValid(date) || valueToFormat?.length === 10;
  }

  const onDateInputChange = (e: InputCustomEvent) => {
    const rawValue = e.detail.value;
    if (disabled || !rawValue || rawValue.length < 10) return;

    // Parse MM-DD-YYYY format to a valid Date object
    const [month, day, year] = rawValue.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day); // month is 0-indexed

    if (!isValid(selectedDate)) {
      return;
    }

    const today = new Date();
    const dateToUse =
      maxToday && isAfter(selectedDate, today) ? getFormattedDateToSave(today) : getFormattedDateToSave(selectedDate);

    setValue(name, dateToUse as PathValue<T, typeof name>);
  };

  function formatDisplayValue(value: string): string {
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      return value;
    }

    try {
      const date = parseISO(value);
      const result = format(date, 'MM-dd-yyyy');
      return result;
    } catch {
      return value;
    }
  }

  return (
    <InputValidated
      id={memoId.current}
      name={name}
      label={label}
      value={isValidDate() ? formatDisplayValue(valueToFormat) : valueToFormat}
      inputChange={onIonChange ?? ((e) => onDateInputChange(e))}
      readonly={readonly}
      disabled={disabled}
      helperText={helperText}
      required={required}
      placeholder='MM-DD-YYYY'
      fill={fill}
      ref={(dateInput) => {
        if (dateInput) {
          dateInput.getInputElement().then((input) => {
            maskedInputRef(input);
          });
        }
      }}
    />
  );
};

export default DateInputValidated;
