import { IonCol, IonContent, IonPage, IonRow, IonButton, IonIcon, useIonViewDidEnter } from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import toast from 'react-hot-toast';
import { createOutline, eyeOutline } from 'ionicons/icons';
import { getUsersPaginated } from '../../api/users.api';
import QUERY_KEYS from '../../constants/query-keys';
import { IUser } from '../../interfaces/user.interface';
import { fullNameBodyTemplate } from './table.helper';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import usePlatform from '../../hooks/usePlatform';
import Header from '../../components/Header/Header';
import { InputIcon } from 'primereact/inputicon';
import { IconField } from 'primereact/iconfield';
import { InputText } from 'primereact/inputtext';
import MobileView from './MobileView';
import styles from './Users.module.scss';

const Users = () => {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [inputValue, setInputValue] = useState('');
  const [searchName, setSearchName] = useState('');
  const { isMobile } = usePlatform();
  const isMobileView = isMobile();

  const { data, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.GET_USERS_PAGINATED, first, rows, searchName],
    queryFn: () =>
      getUsersPaginated({
        pagination: {
          skip: first,
          limit: rows,
        },
        filters: {
          roleNames: [ROLES.PARTICIPANT],
          ...(searchName && { searchName }),
        },
      }),
  });

  const onPage = (event: DataTablePageEvent) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const actionBodyTemplate = (rowData: IUser) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <IonButton size='small' fill='clear' title='View' routerLink={ROUTES.DETALS_USER.replace(':id', rowData.id)}>
          <IonIcon slot='icon-only' icon={eyeOutline} />
        </IonButton>
        <IonButton
          size='small'
          fill='clear'
          color='warning'
          title='Editar usuario'
          type='button'
          routerLink={ROUTES.EDIT_USER.replace(':id', rowData.id)}
        >
          <IonIcon slot='icon-only' icon={createOutline} />
        </IonButton>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <IonRow className='ion-justify-content-center'>
        <IonCol size='12' sizeMd='4' className={styles.titleCol}>
          <h2>Participantes</h2>
        </IonCol>
        <IonCol size='12' sizeMd='8' className={styles.headerInputCol}>
          <IconField iconPosition='left'>
            <InputIcon className='pi pi-search search-icon' />
            <InputText
              id='search-users'
              name='search-users'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchByName(inputValue);
                }
              }}
              placeholder='Buscar por nombre o apellidos'
            />
          </IconField>
          <IonButton onClick={() => handleSearchByName(inputValue)} color='light'>
            Buscar
          </IonButton>
        </IonCol>
      </IonRow>
    );
  };

  const handleSearchByName = (name: string) => {
    setInputValue(name);
    setSearchName(name);
    setFirst(0);
  };

  useIonViewDidEnter(() => {
    refetch();
  });

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  }, [error]);

  return (
    <IonPage>
      {isMobileView && <Header title='Participantes' />}
      <IonContent className='ion-padding'>
        {isMobileView ? (
          <MobileView users={data?.data} handleSearchByName={handleSearchByName} />
        ) : (
          <IonRow>
            <IonCol>
              <div className='table-container'>
                <DataTable
                  className='custom-datatable'
                  value={data?.data || []}
                  stripedRows
                  paginator
                  rows={rows}
                  first={first}
                  totalRecords={data?.count || 0}
                  onPage={onPage}
                  rowsPerPageOptions={[10, 20, 50, 100, 200]}
                  dataKey='id'
                  header={renderHeader()}
                  emptyMessage='Usuarios no encontrados'
                  lazy
                >
                  <Column field='firstName' header='Nombre Completo' body={fullNameBodyTemplate} sortable />
                  <Column field='stake.name' header='Estaca' sortable />
                  <Column field='ward' header='Barrio' sortable />
                  <Column field='phone' header='Teléfono' sortable />
                  <Column field='age' header='Edad' sortable />
                  <Column field='dni' header='DNI' sortable />
                  <Column
                    field='isMemberOfTheChurch'
                    header='Miembro de la Iglesia'
                    body={(rowData: IUser) => (rowData.isMemberOfTheChurch ? 'Sí' : 'No')}
                    sortable
                  />
                  <Column field='medicalCondition' header='Condición Médica' sortable />
                  <Column header='Acciones' body={actionBodyTemplate} style={{ width: '12rem' }} />
                </DataTable>
              </div>
            </IonCol>
          </IonRow>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Users;
