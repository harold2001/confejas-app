import { IonButton, IonCard, IonCardContent, IonIcon, IonBadge } from '@ionic/react';
import { eyeOutline, createOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { ROUTES } from '../../constants/routes';
import { CompanyStatisticsDto } from '../../interfaces/company.interface';
import styles from './Companies.module.scss';

interface Props {
  companies: CompanyStatisticsDto[] | undefined;
}

const MobileView = ({ companies }: Props) => {
  const history = useHistory();

  return (
    <>
      {companies?.map((company) => (
        <IonCard key={company.companyId} className={styles.companyCard} color='primary'>
          <IonCardContent>
            <div className={styles.companyCardHeader}>
              <span className={styles.companyName}>{company.companyName}</span>
            </div>

            <div className={styles.companyInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Inscritos:</span>
                <IonBadge color='primary' className={styles.mobileBadge}>
                  {company.userCount}
                </IonBadge>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Llegaron:</span>
                <IonBadge color='success' className={styles.mobileBadge}>
                  {company.usersArrived}
                </IonBadge>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>No Llegaron:</span>
                <IonBadge color='danger' className={styles.mobileBadge}>
                  {company.usersNotArrived}
                </IonBadge>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <IonButton
                type='button'
                size='default'
                fill='outline'
                expand='block'
                onClick={() => history.push(ROUTES.DETAILS_COMPANY?.replace(':id', company.companyId))}
              >
                <IonIcon slot='start' icon={eyeOutline} />
                Ver Detalles
              </IonButton>
              <IonButton
                type='button'
                size='default'
                fill='solid'
                color='tertiary'
                expand='block'
                onClick={() => history.push(ROUTES.EDIT_COMPANY?.replace(':id', company.companyId))}
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
