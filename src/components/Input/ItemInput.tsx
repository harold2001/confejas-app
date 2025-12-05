import { css } from '@emotion/react';
import { AutocompleteTypes, InputChangeEventDetail, TextFieldTypes } from '@ionic/core';
import { IonInputCustomEvent } from '@ionic/core/dist/types/components';
import { IonButton, IonIcon, IonInput, IonItem } from '@ionic/react';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { Types } from '../../types';

type Props = {
  id: string;
  state: Types.InputState;
  setState: React.Dispatch<React.SetStateAction<Types.InputState>>;
  type?: TextFieldTypes;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  autocomplete?: AutocompleteTypes;
};

const ItemInput = ({
  id,
  type = 'text',
  autocomplete = 'off',
  state,
  setState,
  label: labelValue = '',
  placeholder = '',
  disabled = false,
}: Props) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const styles = {
    button: css`
      margin-top: 20px;
      margin-right: 0;
    `,
  };

  const onChange = (event: IonInputCustomEvent<InputChangeEventDetail>) => {
    const value = (event.detail.value as string) || '';
    setState({
      ...state,
      value,
      pristine: false,
      valid: state.validation.test(value),
    });
  };
  const onBlur = () => {
    setState({
      ...state,
      touched: true,
    });
  };

  return (
    <IonItem lines='none'>
      <IonInput
        disabled={disabled}
        autocomplete={autocomplete}
        className={`${state.touched && !state.pristine && !state.valid && 'ion-invalid'}`}
        type={type === 'password' && !passwordVisible ? 'password' : 'text'}
        data-testId={id}
        placeholder={placeholder}
        value={state.value}
        onIonInput={onChange}
        onIonBlur={onBlur}
        errorText={state.errorMessage}
        label={labelValue}
        labelPlacement='floating'
      />
      {type === 'password' && (
        <IonButton
          slot='end'
          css={styles.button}
          fill='clear'
          onClick={() => {
            setPasswordVisible(!passwordVisible);
          }}
        >
          {passwordVisible ? <IonIcon icon={eyeOutline} /> : <IonIcon icon={eyeOffOutline} />}
        </IonButton>
      )}
    </IonItem>
  );
};

export default ItemInput;
