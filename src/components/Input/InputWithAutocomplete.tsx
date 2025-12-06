import { IonInput, IonList, IonItem, IonLabel, InputCustomEvent } from '@ionic/react';
import React, { useState, useEffect, useId, useRef, JSX } from 'react';
import {
  AutocompleteTypes,
  InputChangeEventDetail,
  IonInputCustomEvent,
  InputInputEventDetail,
  TextFieldTypes,
} from '@ionic/core';
import { FieldValues, FieldPath, useFormContext, Controller } from 'react-hook-form';
import styles from './InputWithAutocomplete.module.css';

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
  maxLength?: number;
  minLength?: number;
  isManualError?: boolean;

  // Autocomplete specific props
  suggestions?: string[];
  minCharsToSearch?: number;
  onSuggestionSelect?: (suggestion: string) => void;
  isLoading?: boolean;
  loadingText?: string;
  noResultsText?: string;
}

const InputWithAutocompleteComponent = <T extends FieldValues>(
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
    isManualError,
    suggestions = [],
    minCharsToSearch = 1,
    onSuggestionSelect,
    isLoading = false,
    loadingText = 'Loading...',
    noResultsText = 'No results found',
  }: Props<T>,
  ref: React.ForwardedRef<HTMLIonInputElement>,
) => {
  const formContext = useFormContext<T>();
  const formState = formContext?.formState;
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const reactId = useId();
  const memoId = useRef<string>('');

  if (!memoId.current) {
    memoId.current = id || reactId;
  }

  // Watch for field value changes
  const fieldValue = formContext.watch(name);

  useEffect(() => {
    if (fieldValue && fieldValue !== inputValue) {
      setInputValue(fieldValue);
    }
  }, [fieldValue, inputValue]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Update form value
    formContext?.setValue(name, suggestion as T[FieldPath<T>]);
    onSuggestionSelect?.(suggestion);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const shouldShowSuggestions = inputValue.length >= minCharsToSearch && (suggestions.length > 0 || isLoading);

  const handleInputFocus = () => {
    setShowSuggestions(shouldShowSuggestions);
    setSelectedIndex(-1);
  };

  const handleInputBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

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
        const showError =
          disabled || !required
            ? false
            : Boolean(fieldState?.error) ||
              (formState.isSubmitted && !field.value) ||
              (required && !field.value && fieldState.isTouched) ||
              isManualError;

        return (
          <div className={styles.inputContainer}>
            <IonInput
              id={memoId.current}
              value={field.value}
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
              onIonFocus={handleInputFocus}
              onIonBlur={handleInputBlur}
              ref={ref}
              onKeyDown={handleKeyDown}
              onIonInput={(e) => {
                const value = e.detail.value as string;
                setInputValue(value);
                field.onChange(value);
                setShowSuggestions(value.length >= minCharsToSearch && (suggestions.length > 0 || isLoading));
                setSelectedIndex(-1);
                inputInput?.(e);
              }}
              onIonChange={(e) => {
                const value = e.detail.value as string;
                setInputValue(value);
                field.onChange(value);
                inputChange?.(e);
              }}
            />

            {showSuggestions && (suggestions.length > 0 || isLoading) && (
              <div className={styles.suggestionsContainer}>
                <IonList>
                  {isLoading && (
                    <IonItem>
                      <IonLabel>{loadingText}</IonLabel>
                    </IonItem>
                  )}

                  {!isLoading &&
                    suggestions.length > 0 &&
                    suggestions.map((suggestion, index) => (
                      <IonItem
                        key={suggestion}
                        button
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={`${styles.suggestionItem} ${
                          index === selectedIndex ? styles.suggestionItemSelected : styles.suggestionItemNormal
                        }`}
                      >
                        <IonLabel>{suggestion}</IonLabel>
                      </IonItem>
                    ))}

                  {!isLoading && suggestions.length === 0 && (
                    <IonItem>
                      <IonLabel>{noResultsText}</IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

const InputWithAutocomplete = React.forwardRef(InputWithAutocompleteComponent) as <T extends FieldValues>(
  props: Props<T> & React.RefAttributes<HTMLIonInputElement>,
) => JSX.Element;

export default InputWithAutocomplete;
