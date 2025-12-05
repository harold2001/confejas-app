import {
  IonCol,
  IonContent,
  IonPage,
  IonRow,
  IonSpinner,
  IonButton,
  useIonViewDidEnter,
  IonToggle,
  IonIcon,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import toast from 'react-hot-toast';
import { getUsersPaginated } from '../../api/users.api';
import QUERY_KEYS from '../../constants/query-keys';
import { IUser } from '../../interfaces/user.interface';
import { useUser } from '../../hooks/useUser';
import { ROLES } from '../../constants/roles';
import usePlatform from '../../hooks/usePlatform';
import Header from '../../components/Header/Header';
import { fullNameBodyTemplate } from '../users/table.helper';
import MobileView from './MobileView';
import { ROUTES } from '../../constants/routes';
import { eyeOutline } from 'ionicons/icons';

const Attendance = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchName, setSearchName] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const { markAsArrived } = useUser();
  const { isMobile } = usePlatform();
  const isMobileView = isMobile();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.GET_USERS_ATTENDANCE_PAGINATED, first, rows, searchName],
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
      <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
        <IonButton
          size='small'
          fill='clear'
          title='View Details'
          routerLink={ROUTES.ATTENDANCE_DETAILS.replace(':id', rowData.id)}
        >
          <IonIcon slot='icon-only' icon={eyeOutline} />
        </IonButton>
      </div>
    );
  };

  const hasArrivedBodyTemplate = (rowData: IUser) => {
    return (
      <div className='ion-text-center'>
        <IonToggle
          checked={rowData.hasArrived}
          color='success'
          onIonChange={async (e) => {
            await markAsArrived({ id: rowData.id, body: { hasArrived: e.detail.checked } });
            await refetch();
          }}
        />
      </div>
    );
  };

  // Search header
  const renderHeader = () => {
    return (
      <IonRow className='ion-justify-content-between ion-align-items-center'>
        <IonCol size='auto'>
          <h2>Asistencia</h2>
        </IonCol>
        <IonCol size='auto'>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
          </div>
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
      {isMobileView && <Header title='Asistencia' />}
      <IonContent className='ion-padding'>
        {isMobileView ? (
          <MobileView users={data?.data} refetch={refetch} handleSearchByName={handleSearchByName} />
        ) : (
          <IonRow>
            <IonCol>
              {isLoading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '2rem',
                  }}
                >
                  <IonSpinner name='crescent' />
                </div>
              ) : (
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
                    <Column field='hasArrived' header='¿Asistió?' body={hasArrivedBodyTemplate} />
                    <Column field='firstName' header='Nombre Completo' body={fullNameBodyTemplate} sortable />
                    <Column field='stake.name' header='Estaca' sortable />
                    <Column field='ward' header='Barrio' sortable />
                    <Column field='keyCode' header='Código de Llave' sortable />
                    <Column field='age' header='Edad' sortable />
                    <Column
                      field='isMemberOfTheChurch'
                      header='Miembro de la Iglesia'
                      body={(rowData: IUser) => (rowData.isMemberOfTheChurch ? 'Sí' : 'No')}
                      sortable
                    />
                    <Column header='Acciones' body={actionBodyTemplate} style={{ width: '12rem' }} />
                  </DataTable>
                </div>
              )}
            </IonCol>
          </IonRow>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Attendance;
