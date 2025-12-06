import { IonButton, IonCard, IonCardContent, IonCol, IonRow, IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import {
  eyeOutline,
  createOutline,
  chevronBackOutline,
  chevronForwardOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import { IUser } from '../../interfaces/user.interface';
import styles from './Users.module.scss';
import { useHistory } from 'react-router';
import { ROUTES } from '../../constants/routes';

interface Props {
  users: IUser[] | undefined;
  totalRecords: number;
  first: number;
  rows: number;
  onPageChange: (first: number, rows: number) => void;
  onPermutaClick: (user: IUser) => void;
  onCreateClick: () => void;
}

const MobileView = ({ users, totalRecords, first, rows, onPageChange, onPermutaClick, onCreateClick }: Props) => {
  const history = useHistory();

  const currentPage = Math.floor(first / rows) + 1;
  const totalPages = Math.ceil(totalRecords / rows);
  const lastRecord = Math.min(first + rows, totalRecords);

  const handlePrevPage = () => {
    if (first > 0) {
      onPageChange(first - rows, rows);
    }
  };

  const handleNextPage = () => {
    if (first + rows < totalRecords) {
      onPageChange(first + rows, rows);
    }
  };

  const handleRowsChange = (newRows: number) => {
    onPageChange(0, newRows);
  };

  return (
    <>
      {/* Add Button */}
      <IonRow className='ion-margin-bottom'>
        <IonCol>
          <IonButton expand='block' color='success' onClick={onCreateClick}>
            Añadir +
          </IonButton>
        </IonCol>
      </IonRow>

      {/* Pagination Controls */}
      <IonCard color='dark' className='ion-margin-top'>
        <IonCardContent>
          <IonRow className='ion-align-items-center ion-justify-content-between'>
            <IonCol size='12' className='ion-text-center ion-margin-bottom'>
              <span style={{ fontSize: '0.9rem' }}>
                Mostrando {first + 1} a {lastRecord} de {totalRecords} registros
              </span>
            </IonCol>
            <IonCol size='4'>
              <IonSelect
                value={rows}
                onIonChange={(e) => handleRowsChange(e.detail.value)}
                interface='popover'
                placeholder='Filas'
              >
                <IonSelectOption value={10}>10</IonSelectOption>
                <IonSelectOption value={20}>20</IonSelectOption>
                <IonSelectOption value={50}>50</IonSelectOption>
                <IonSelectOption value={100}>100</IonSelectOption>
              </IonSelect>
            </IonCol>
            <IonCol size='8' className='ion-text-end'>
              <IonButton fill='clear' size='small' disabled={first === 0} onClick={handlePrevPage}>
                <IonIcon slot='icon-only' icon={chevronBackOutline} />
              </IonButton>
              <span style={{ margin: '0 1rem' }}>
                Página {currentPage} de {totalPages}
              </span>
              <IonButton fill='clear' size='small' disabled={first + rows >= totalRecords} onClick={handleNextPage}>
                <IonIcon slot='icon-only' icon={chevronForwardOutline} />
              </IonButton>
            </IonCol>
          </IonRow>
        </IonCardContent>
      </IonCard>

      {users?.map((user) => (
        <IonCard key={user.id} className={styles.userCard} color='primary'>
          <IonCardContent>
            <div className={styles.userCardHeader}>
              <span className={styles.userFullName}>
                {user.firstName} {user.paternalLastName} {user.maternalLastName}
              </span>
            </div>

            <div className={styles.userInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Nombre Completo:</span>
                <span className={styles.value}>
                  {`${user?.firstName || ''} ${user?.paternalLastName || ''} ${user?.maternalLastName || ''}`}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Estaca / Barrio:</span>
                <span className={styles.value}>
                  {`${user?.stake?.name ? user.stake.name.replace('Estaca ', '') : 'N/A'} / ${user?.ward || 'N/A'}`}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Talla de Polo:</span>
                <span className={styles.value}>{user?.shirtSize || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Edad:</span>
                <span className={styles.value}>{user?.age || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Miembro de la Iglesia:</span>
                <span className={styles.value}>{user.isMemberOfTheChurch ? 'Sí' : 'No'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Condición Médica:</span>
                <span className={styles.value}>{user?.medicalCondition || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Tratamiento Médico:</span>
                <span className={styles.value}>{user?.medicalTreatment || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Teléfono:</span>
                <span className={styles.value}>{user?.phone || 'N/A'}</span>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <IonButton
                id='view-details-button'
                type='button'
                size='default'
                fill='outline'
                expand='block'
                onClick={() => history.push(ROUTES.DETAILS_USER.replace(':id', user.id))}
              >
                <IonIcon slot='start' icon={eyeOutline} />
                Ver Detalles
              </IonButton>
              <IonButton
                id='edit-button'
                type='button'
                size='default'
                fill='solid'
                color='tertiary'
                expand='block'
                onClick={() => history.push(ROUTES.EDIT_USER.replace(':id', user.id))}
              >
                <IonIcon slot='start' icon={createOutline} />
                Editar
              </IonButton>
              <IonButton
                id='permuta-button'
                type='button'
                size='default'
                fill='solid'
                color='warning'
                expand='block'
                onClick={() => onPermutaClick(user)}
              >
                <IonIcon slot='start' icon={swapHorizontalOutline} />
                Hacer Permuta
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      ))}
    </>
  );
};

export default MobileView;
