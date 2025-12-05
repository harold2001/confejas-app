import { IonButton, IonCard, IonCardContent, IonCol, IonInput, IonRow, IonIcon } from '@ionic/react';
import { eyeOutline, createOutline } from 'ionicons/icons';
import { IUser } from '../../interfaces/user.interface';
import styles from './Users.module.scss';
import { useState } from 'react';
import { useHistory } from 'react-router';
import { ROUTES } from '../../constants/routes';

interface Props {
  users: IUser[] | undefined;
  handleSearchByName: (name: string) => void;
}

const MobileView = ({ users, handleSearchByName }: Props) => {
  const history = useHistory();
  const [name, setName] = useState<string>('');

  return (
    <>
      <IonCard>
        <IonCardContent>
          <IonRow className='ion-align-items-center'>
            <IonCol size='9'>
              <IonInput
                id='mobile-search-input'
                placeholder='Buscar por nombre o apellidos'
                fill='outline'
                onIonInput={(e) => setName(e.detail.value ?? '')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchByName(name);
                  }
                }}
              />
            </IonCol>
            <IonCol size='3'>
              <IonButton type='button' color='light' expand='block' onClick={() => handleSearchByName(name)}>
                Buscar
              </IonButton>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>

      {users?.map((user) => (
        <IonCard key={user.id} className={styles.userCard}>
          <IonCardContent>
            <div className={styles.userCardHeader}>
              <span className={styles.userFullName}>
                {user.firstName} {user.paternalLastName} {user.maternalLastName}
              </span>
            </div>

            <div className={styles.userInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Nombre:</span>
                <span className={styles.value}>
                  {`${user?.firstName} ${user?.paternalLastName} ${user?.maternalLastName}`}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Estaca:</span>
                <span className={styles.value}>{user?.stake?.name || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Barrio:</span>
                <span className={styles.value}>{user?.ward || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Teléfono:</span>
                <span className={styles.value}>{user?.phone || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Edad:</span>
                <span className={styles.value}>{user?.age || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>DNI:</span>
                <span className={styles.value}>{user?.dni || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Miembro de la Iglesia:</span>
                <span className={styles.value}>{user.isMemberOfTheChurch ? 'Sí' : 'No'}</span>
              </div>
              {user.medicalCondition && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Condición Médica:</span>
                  <span className={styles.value}>{user.medicalCondition}</span>
                </div>
              )}
            </div>

            <div className={styles.actionButtons}>
              <IonButton
                id='view-details-button'
                type='button'
                size='default'
                fill='outline'
                expand='block'
                onClick={() => history.push(ROUTES.DETALS_USER.replace(':id', user.id))}
              >
                <IonIcon slot='start' icon={eyeOutline} />
                Ver Detalles
              </IonButton>
              <IonButton
                id='edit-button'
                type='button'
                size='default'
                fill='solid'
                color='warning'
                expand='block'
                onClick={() => history.push(ROUTES.EDIT_USER.replace(':id', user.id))}
              >
                <IonIcon slot='start' icon={createOutline} />
                Editar
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      ))}
    </>
  );
};

export default MobileView;
