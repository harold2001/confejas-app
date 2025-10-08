import {
  IonCol,
  IonContent,
  IonPage,
  IonRow,
  IonSpinner,
  IonButton,
  IonIcon,
  IonCheckbox,
  useIonViewDidEnter,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import toast from 'react-hot-toast';
import { createOutline, trashOutline, eyeOutline } from 'ionicons/icons';
import { getUsersPaginated } from '../../api/users.api';
import QUERY_KEYS from '../../constants/query-keys';
import { IUser } from '../../interfaces/user.interface';
import { useUser } from '../../hooks/useUser';
import { fullNameBodyTemplate } from './table.helper';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';

const Users = () => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  // const [first, setFirst] = useState(0); // Index of first record to display
  // const [rows, setRows] = useState(10); // Number of rows per page
  const { markAsArrived } = useUser();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.GET_USERS_PAGINATED],
    queryFn: () =>
      getUsersPaginated({
        pagination: {
          skip: 0,
          limit: 200,
        },
        filters: {
          roleNames: [ROLES.PARTICIPANT],
        },
      }),
  });

  // Handle page change (when user clicks next/prev or changes page)
  // const onPage = (event: DataTablePageEvent) => {
  //   setFirst(event.first);
  //   setRows(event.rows);
  // };

  // Action buttons template
  const actionBodyTemplate = (rowData: IUser) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* <IonButton
          size='small'
          fill='clear'
          onClick={() => handleView(rowData)}
          title='View'
        >
          <IonIcon slot='icon-only' icon={eyeOutline} />
        </IonButton> */}
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
        {/* <IonButton
          size='small'
          fill='clear'
          color='danger'
          onClick={() => handleDelete(rowData)}
          title='Delete'
        >
          <IonIcon slot='icon-only' icon={trashOutline} />
        </IonButton> */}
      </div>
    );
  };

  const hasArrivedBodyTemplate = (rowData: IUser) => {
    return (
      <div className='ion-text-center'>
        <IonCheckbox
          checked={rowData.hasArrived}
          onIonChange={async e => {
            await markAsArrived(rowData.id);
            await refetch();
          }}
        ></IonCheckbox>
      </div>
    );
  };

  // Action handlers
  // const handleView = (user: IUser) => {
  //   console.log('View user:', user);
  //   toast.success(`Viewing ${user.firstName} ${user.paternalLastName}`);
  //   // TODO: Navigate to user detail page or open modal
  // };

  // const handleDelete = (user: IUser) => {
  //   console.log('Delete user:', user);
  //   toast.error(`Delete ${user.firstName} ${user.paternalLastName}`);
  //   // TODO: Show confirmation dialog and delete user
  // };

  // Search header
  const renderHeader = () => {
    return (
      <IonRow>
        <IonCol>
          <h2>Lista de Participantes</h2>
        </IonCol>
        <IonCol size='auto'>
          <IconField iconPosition='left'>
            <InputIcon className='pi pi-search search-icon' />
            <InputText
              id='search-users'
              name='search-users'
              value={globalFilterValue}
              onChange={e => setGlobalFilterValue(e.target.value)}
              placeholder='Buscar participantes...'
            />
          </IconField>
        </IonCol>
      </IonRow>
    );
  };

  useIonViewDidEnter(() => {
    refetch();
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to fetch users'
      );
    }
  }, [error]);

  return (
    <IonPage>
      <IonContent className='ion-padding'>
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
                  rows={200}
                  rowsPerPageOptions={[10, 20, 50, 100, 200]}
                  dataKey='id'
                  globalFilter={globalFilterValue}
                  header={renderHeader()}
                  emptyMessage='Usuarios no encontrados'
                  globalFilterFields={[
                    'firstName',
                    'paternalLastName',
                    'maternalLastName',
                    'stake.name',
                    'ward',
                  ]}
                >
                  <Column
                    field='hasArrived'
                    header='¿Asistió?'
                    body={hasArrivedBodyTemplate}
                    sortable
                  />
                  <Column
                    field='firstName'
                    header='Nombre Completo'
                    body={fullNameBodyTemplate}
                    sortable
                  />
                  {/* <Column field='dni' header='DNI' sortable />
                  <Column field='email' header='Correo Electrónico' sortable />
                  <Column field='phone' header='Teléfono' sortable />
                  <Column
                    field='birthDate'
                    header='Fecha de Nacimiento'
                    body={dateBodyTemplate}
                    sortable
                  />
                  <Column field='keyCode' header='Código de Llave' sortable /> */}
                  <Column field='stake.name' header='Estaca' sortable />
                  <Column field='ward' header='Barrio' sortable />
                  <Column field='age' header='Edad' sortable />
                  <Column
                    field='isMemberOfTheChurch'
                    header='Miembro de la Iglesia'
                    body={(rowData: IUser) =>
                      rowData.isMemberOfTheChurch ? 'Sí' : 'No'
                    }
                    sortable
                  />
                  <Column
                    header='Acciones'
                    body={actionBodyTemplate}
                    style={{ width: '12rem' }}
                  />
                </DataTable>
              </div>
            )}
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Users;
