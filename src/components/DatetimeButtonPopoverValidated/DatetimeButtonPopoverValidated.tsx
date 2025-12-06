import { DatetimeCustomEvent, IonDatetime, IonDatetimeButton, IonIcon, IonPopover } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import { isAfter, parseISO } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import { getFormattedDateToSave } from '../../utils/helpers';

interface Props {
  name: string;
  datetimeId: string;
  buttonId: string;
  onIonChange?: (event: DatetimeCustomEvent) => void;
  value: string | null;
  preferWheel?: boolean;
  maxToday?: boolean;
  disabled?: boolean;
  maxValue?: string;
}

const DatetimeButtonPopoverValidated = ({
  name,
  datetimeId,
  buttonId,
  onIonChange,
  value,
  preferWheel = false,
  maxToday = false,
  disabled = false,
  maxValue,
}: Props) => {
  const { setValue } = useFormContext();

  const onDateInputChange = (e: DatetimeCustomEvent) => {
    const rawValue = e.detail.value as string;
    if (!rawValue || disabled) return;

    const selectedDate = parseISO(rawValue);
    const today = new Date();
    const dateToUse =
      maxToday && isAfter(selectedDate, today) ? getFormattedDateToSave(today) : getFormattedDateToSave(selectedDate);

    setValue(name, dateToUse);
  };

  const getTodayMax = () => {
    const today = new Date();
    const utcDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));

    return utcDate.toISOString();
  };

  return (
    <>
      <IonDatetimeButton datetime={datetimeId} id={buttonId} disabled={disabled}>
        <IonIcon icon={calendarOutline} slot='date-target' />
      </IonDatetimeButton>
      <IonPopover
        keepContentsMounted
        id={buttonId}
        className='date-modal'
        triggerAction='click'
        alignment='center'
        side='start'
        size='auto'
      >
        <IonDatetime
          id={datetimeId}
          presentation='date'
          preferWheel={preferWheel}
          showDefaultButtons
          color='tertiary'
          {...(maxToday ? { max: getTodayMax() } : {})}
          {...(maxValue ? { max: new Date(maxValue).toISOString() } : {})}
          onIonChange={onIonChange ?? ((e) => onDateInputChange(e))}
          value={value}
          disabled={disabled}
        />
      </IonPopover>
    </>
  );
};

export default DatetimeButtonPopoverValidated;
