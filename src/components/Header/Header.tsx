import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import styles from './Header.module.scss';
import { addOutline } from 'ionicons/icons';
import usePlatform from '../../hooks/usePlatform';

type Props = {
  title: string;
  showBack?: boolean;
  defaultBackHref?: string;
  onEdit?: () => void;
  onAdd?: () => void;
  addText?: string;
  canSeeButton?: boolean;
  simple?: boolean;
  extraContent?: React.JSX.Element;
  className?: string;
};

const Header = ({
  title,
  onEdit,
  showBack = false,
  onAdd,
  addText,
  canSeeButton = true,
  simple = false,
  defaultBackHref,
  extraContent,
  className,
}: Props) => {
  const { isIOS } = usePlatform();

  return (
    <>
      {!!simple && (
        <IonHeader className={`${styles.simpleHeader} ${className || ''}`} color='primary'>
          <IonButtons slot='start'>
            {showBack && (
              <IonBackButton
                {...(defaultBackHref ? { defaultHref: defaultBackHref } : {})}
                className={styles.backButton}
              />
            )}
            {!showBack && (
              <IonMenuToggle>
                <IonMenuButton color='light' />
              </IonMenuToggle>
            )}
          </IonButtons>
          <IonTitle>
            <h1>{title}</h1>
          </IonTitle>
          {!!extraContent && extraContent}
        </IonHeader>
      )}

      {!simple && (
        <IonHeader className={`${styles.simpleHeader} ${className || ''}`} color='primary'>
          <IonToolbar className={isIOS() ? styles.customToolbarPaddingiOs : styles.customToolbarPadding}>
            <IonButtons slot='start'>
              {showBack && <IonBackButton {...(defaultBackHref ? { defaultHref: defaultBackHref } : {})} />}
              {!showBack && (
                <IonMenuToggle>
                  <IonMenuButton color='light' />
                </IonMenuToggle>
              )}
            </IonButtons>
            <IonTitle>{title}</IonTitle>
            {onEdit && canSeeButton && (
              <IonButtons slot='end'>
                <IonButton color='light' fill='solid' onClick={onEdit}>
                  Editar
                </IonButton>
              </IonButtons>
            )}
            {onAdd && canSeeButton && (
              <IonButtons slot='end'>
                <IonButton className={styles.headerBtn} color='light' fill='solid' onClick={onAdd}>
                  {addText || <IonIcon icon={addOutline} />}
                </IonButton>
              </IonButtons>
            )}
          </IonToolbar>
        </IonHeader>
      )}
    </>
  );
};

export default Header;
