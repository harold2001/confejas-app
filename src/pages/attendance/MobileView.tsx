import { IonButton, IonCard, IonCardContent, IonCol, IonInput, IonRow, IonToggle } from '@ionic/react';
import { IUser } from '../../interfaces/user.interface';
import styles from './Attendance.module.scss';
import { RefetchType } from '../../types';
import { useUser } from '../../hooks/useUser';
import { useState } from 'react';
import { useHistory } from 'react-router';
import { ROUTES } from '../../constants/routes';

interface Props {
  users: IUser[] | undefined;
  refetch: RefetchType;
  handleSearchByName: (name: string) => void;
}

const MobileView = ({ users, refetch, handleSearchByName }: Props) => {
  const { markAsArrived } = useUser();
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
        <IonCard
          key={user.id}
          onClick={() => history.push(ROUTES.ATTENDANCE_DETAILS.replace(':id', user.id))}
          className={styles.userCard}
        >
          <IonCardContent>
            <IonRow>
              <IonCol size='9'>
                <span className={styles.userFullName}>
                  {user.firstName} {user.paternalLastName} {user.maternalLastName}
                </span>
                <p>Estaca: {user?.stake?.name}</p>
                <p>Barrio: {user?.ward}</p>
              </IonCol>
              <IonCol size='3' className='ion-text-end'>
                <div className='ion-text-end'>
                  <div className={styles.toggleText}>Asistió</div>
                  <IonToggle
                    checked={user.hasArrived}
                    color='success'
                    onClick={(e) => e.stopPropagation()}
                    onIonChange={async (e) => {
                      e.stopPropagation();
                      await markAsArrived({ id: user.id, body: { hasArrived: e.detail.checked } });
                      await refetch();
                    }}
                  />
                </div>
              </IonCol>
            </IonRow>
          </IonCardContent>
        </IonCard>
      ))}
    </>
  );
};

export default MobileView;
