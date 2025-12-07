import {
  IonCol,
  IonContent,
  IonPage,
  IonRow,
  IonButton,
  IonIcon,
  useIonViewDidEnter,
  IonToggle,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
} from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import toast from 'react-hot-toast';
import { createOutline, eyeOutline, chevronDownOutline, chevronUpOutline, swapHorizontalOutline } from 'ionicons/icons';
import { getUsersPaginated } from '../../api/users.api';
import QUERY_KEYS from '../../constants/query-keys';
import { IUser } from '../../interfaces/user.interface';
import { PaginationOrderDir } from '../../interfaces/dto/pagination.dto';
import { fullNameBodyTemplate } from './table.helper';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import usePlatform from '../../hooks/usePlatform';
import Header from '../../components/Header/Header';
import { InputIcon } from 'primereact/inputicon';
import { IconField } from 'primereact/iconfield';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import MobileView from './MobileView';
import styles from './Users.module.scss';
import { getStakes } from '../../api/stakes.api';
import UserFormModal from '../../components/UserFormModal/UserFormModal';
import { useIonRouter } from '@ionic/react';

const Users = () => {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [inputValue, setInputValue] = useState('');
  const [searchName, setSearchName] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<1 | -1>(1);
  const { isMobile, isDesktop } = usePlatform();
  const isMobileView = isMobile();
  const router = useIonRouter();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'permuta'>('create');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [originalUser, setOriginalUser] = useState<IUser | undefined>(undefined);

  // Filter states (draft - not applied until "Buscar" is clicked)
  const [filtersDraft, setFiltersDraft] = useState({
    email: '',
    firstName: '',
    middleName: '',
    paternalLastName: '',
    maternalLastName: '',
    dni: '',
    phone: '',
    address: '',
    department: '',
    hasArrived: null as boolean | null,
    medicalCondition: '',
    medicalTreatment: '',
    hasMedicalCondition: null as boolean | null,
    hasMedicalTreatment: null as boolean | null,
    keyCode: '',
    ward: '',
    stakeId: '',
    stakeName: '',
    age: '',
    isMemberOfTheChurch: null as boolean | null,
    notes: '',
    status: '',
    shirtSize: '',
    bloodType: '',
    healthInsurance: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    gender: '',
    birthDate: '',
  });

  // Applied filters (used in the query)
  const [appliedFilters, setAppliedFilters] = useState(filtersDraft);

  const { data: stakesData } = useQuery({
    queryKey: [QUERY_KEYS.GET_STAKES],
    queryFn: () => getStakes(),
  });

  const { data, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.GET_USERS_PAGINATED, first, rows, searchName, appliedFilters, sortField, sortOrder],
    queryFn: () =>
      getUsersPaginated({
        pagination: {
          skip: first,
          limit: rows,
          orderBy: sortField,
          orderDir: sortOrder === 1 ? PaginationOrderDir.Asc : PaginationOrderDir.Desc,
        },
        filters: {
          roleNames: [ROLES.PARTICIPANT],
          ...(searchName && { searchName }),
          ...(appliedFilters.email && { email: appliedFilters.email }),
          ...(appliedFilters.firstName && { firstName: appliedFilters.firstName }),
          ...(appliedFilters.middleName && { middleName: appliedFilters.middleName }),
          ...(appliedFilters.paternalLastName && { paternalLastName: appliedFilters.paternalLastName }),
          ...(appliedFilters.maternalLastName && { maternalLastName: appliedFilters.maternalLastName }),
          ...(appliedFilters.dni && { dni: appliedFilters.dni }),
          ...(appliedFilters.phone && { phone: appliedFilters.phone }),
          ...(appliedFilters.address && { address: appliedFilters.address }),
          ...(appliedFilters.department && { department: appliedFilters.department }),
          ...(appliedFilters.hasArrived !== null && { hasArrived: appliedFilters.hasArrived }),
          ...(appliedFilters.medicalCondition && { medicalCondition: appliedFilters.medicalCondition }),
          ...(appliedFilters.medicalTreatment && { medicalTreatment: appliedFilters.medicalTreatment }),
          ...(appliedFilters.hasMedicalCondition !== null && {
            hasMedicalCondition: appliedFilters.hasMedicalCondition,
          }),
          ...(appliedFilters.hasMedicalTreatment !== null && {
            hasMedicalTreatment: appliedFilters.hasMedicalTreatment,
          }),
          ...(appliedFilters.keyCode && { keyCode: appliedFilters.keyCode }),
          ...(appliedFilters.ward && { ward: appliedFilters.ward }),
          ...(appliedFilters.stakeId && { stakeId: appliedFilters.stakeId }),
          ...(appliedFilters.stakeName && { stakeName: appliedFilters.stakeName }),
          ...(appliedFilters.age && { age: appliedFilters.age }),
          ...(appliedFilters.isMemberOfTheChurch !== null && {
            isMemberOfTheChurch: appliedFilters.isMemberOfTheChurch,
          }),
          ...(appliedFilters.notes && { notes: appliedFilters.notes }),
          ...(appliedFilters.status && { status: appliedFilters.status }),
          ...(appliedFilters.shirtSize && { shirtSize: appliedFilters.shirtSize }),
          ...(appliedFilters.bloodType && { bloodType: appliedFilters.bloodType }),
          ...(appliedFilters.healthInsurance && { healthInsurance: appliedFilters.healthInsurance }),
          ...(appliedFilters.emergencyContactName && { emergencyContactName: appliedFilters.emergencyContactName }),
          ...(appliedFilters.emergencyContactPhone && { emergencyContactPhone: appliedFilters.emergencyContactPhone }),
          ...(appliedFilters.gender && { gender: appliedFilters.gender }),
          ...(appliedFilters.birthDate && { birthDate: appliedFilters.birthDate }),
        },
      }),
  });

  const onPage = (event: DataTablePageEvent) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const onSort = (event: DataTableSortEvent) => {
    setSortField(event.sortField as string);
    setSortOrder(event.sortOrder as 1 | -1);
    setFirst(0);
  };

  const handleEditClick = (user: IUser) => {
    if (isDesktop()) {
      setModalMode('edit');
      setSelectedUserId(user.id);
      setOriginalUser(undefined);
      setIsModalOpen(true);
    } else {
      router.push(ROUTES.EDIT_USER.replace(':id', user.id));
    }
  };

  const handlePermutaClick = (user: IUser) => {
    setModalMode('permuta');
    setSelectedUserId(undefined);
    setOriginalUser(user);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    if (isDesktop()) {
      setModalMode('create');
      setSelectedUserId(undefined);
      setOriginalUser(undefined);
      setIsModalOpen(true);
    } else {
      router.push(ROUTES.CREATE_USER);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUserId(undefined);
    setOriginalUser(undefined);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  const actionBodyTemplate = (rowData: IUser) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <IonButton size='default' fill='clear' title='View' routerLink={ROUTES.DETAILS_USER.replace(':id', rowData.id)}>
          <IonIcon slot='icon-only' icon={eyeOutline} />
        </IonButton>
        <IonButton
          size='default'
          fill='clear'
          color='tertiary'
          title='Editar usuario'
          type='button'
          onClick={() => handleEditClick(rowData)}
        >
          <IonIcon slot='icon-only' icon={createOutline} />
        </IonButton>
        <IonButton
          size='default'
          fill='clear'
          color='warning'
          title='Realizar Permuta'
          type='button'
          onClick={() => handlePermutaClick(rowData)}
        >
          <IonIcon slot='icon-only' icon={swapHorizontalOutline} />
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
          <IonButton onClick={handleCreateClick} color='success'>
            Añadir +
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

  const handleFilterChange = (field: string, value: string | boolean | null) => {
    setFiltersDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filtersDraft);
    setFirst(0);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      email: '',
      firstName: '',
      middleName: '',
      paternalLastName: '',
      maternalLastName: '',
      dni: '',
      phone: '',
      address: '',
      department: '',
      hasArrived: null,
      medicalCondition: '',
      medicalTreatment: '',
      hasMedicalCondition: null,
      hasMedicalTreatment: null,
      keyCode: '',
      ward: '',
      stakeId: '',
      stakeName: '',
      age: '',
      isMemberOfTheChurch: null,
      notes: '',
      status: '',
      shirtSize: '',
      bloodType: '',
      healthInsurance: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      gender: '',
      birthDate: '',
    };
    setFiltersDraft(emptyFilters);
    setAppliedFilters(emptyFilters);
    setFirst(0);
  };

  const renderFiltersSection = () => {
    const genderOptions = [
      { label: 'Masculino', value: 'Male' },
      { label: 'Femenino', value: 'Female' },
      { label: 'Otro', value: 'Other' },
    ];

    const stakeOptions = stakesData?.map((stake) => ({ label: stake?.name, value: stake?.id }));

    return (
      <IonCard className='ion-margin-bottom' color='dark'>
        <IonCardHeader>
          <IonRow>
            <IonCol>
              <h5>Filtros Avanzados</h5>
            </IonCol>
            <IonCol size='auto'>
              <IonButton fill='clear' onClick={() => setShowFilters(!showFilters)}>
                <IonIcon icon={showFilters ? chevronUpOutline : chevronDownOutline} />
              </IonButton>
            </IonCol>
          </IonRow>
        </IonCardHeader>
        {showFilters && (
          <IonCardContent className='ion-padding'>
            <IonRow className='ion-margin-bottom ion-align-items-center ion-justify-content-center'>
              {/* First Name */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='12' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Nombre</IonLabel>
                <InputText
                  value={filtersDraft.firstName}
                  onChange={(e) => handleFilterChange('firstName', e.target.value)}
                  placeholder='Nombre'
                  className={styles.filterInput}
                />
              </IonCol>

              {/* Paternal Last Name */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='12' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Apellido Paterno</IonLabel>
                <InputText
                  value={filtersDraft.paternalLastName}
                  onChange={(e) => handleFilterChange('paternalLastName', e.target.value)}
                  placeholder='Apellido Paterno'
                  className={styles.filterInput}
                />
              </IonCol>

              {/* Maternal Last Name */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Apellido Materno</IonLabel>
                <InputText
                  value={filtersDraft.maternalLastName}
                  onChange={(e) => handleFilterChange('maternalLastName', e.target.value)}
                  placeholder='Apellido Materno'
                  className={styles.filterInput}
                />
              </IonCol>

              {/* Department */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Habitación</IonLabel>
                <InputText
                  value={filtersDraft.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  placeholder='Departamento'
                  className={styles.filterInput}
                />
              </IonCol>

              {/* Stake */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Estaca</IonLabel>
                <Dropdown
                  value={filtersDraft.stakeId}
                  onChange={(e) => handleFilterChange('stakeId', e.value)}
                  options={stakeOptions}
                  placeholder='Seleccionar Estaca'
                  className={styles.filterInput}
                  showClear
                />
              </IonCol>

              {/* Ward */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Barrio</IonLabel>
                <InputText
                  value={filtersDraft.ward}
                  onChange={(e) => handleFilterChange('ward', e.target.value)}
                  placeholder='Barrio'
                  className={styles.filterInput}
                />
              </IonCol>

              {/* Gender */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Género</IonLabel>
                <Dropdown
                  value={filtersDraft.gender}
                  onChange={(e) => handleFilterChange('gender', e.value)}
                  options={genderOptions}
                  placeholder='Seleccionar Género'
                  className={styles.filterInput}
                  showClear
                />
              </IonCol>

              {/* Shirt Size */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Talla de Polo</IonLabel>
                <Dropdown
                  value={filtersDraft.shirtSize}
                  onChange={(e) => handleFilterChange('shirtSize', e.value)}
                  options={['S', 'M', 'L', 'XL', 'XXL']}
                  placeholder='Talla de Polo'
                  className={styles.filterInput}
                  showClear
                />
              </IonCol>

              {/* Age */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Edad</IonLabel>
                <InputText
                  type='number'
                  value={filtersDraft.age}
                  onChange={(e) => handleFilterChange('age', e.target.value)}
                  placeholder='Edad'
                  className={styles.filterInput}
                />
              </IonCol>

              {/* Medical Condition */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Condición Médica</IonLabel>
                <InputText
                  value={filtersDraft.medicalCondition}
                  onChange={(e) => handleFilterChange('medicalCondition', e.target.value)}
                  placeholder='Condición Médica'
                  className={styles.filterInput}
                />
              </IonCol>

              {/* Medical Treatment */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Tratamiento Médico</IonLabel>
                <InputText
                  value={filtersDraft.medicalTreatment}
                  onChange={(e) => handleFilterChange('medicalTreatment', e.target.value)}
                  placeholder='Tratamiento Médico'
                  className={styles.filterInput}
                />
              </IonCol>

              {/* Blood Type */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Tipo de Sangre</IonLabel>
                <InputText
                  value={filtersDraft.bloodType}
                  onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                  placeholder='Tipo de Sangre'
                  className={styles.filterInput}
                />
              </IonCol>

              {/* Has Arrived Toggle */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Ha Llegado</IonLabel>
                <IonToggle
                  checked={filtersDraft.hasArrived === true}
                  onIonChange={(e) => handleFilterChange('hasArrived', e.detail.checked ? true : null)}
                  color='success'
                />
              </IonCol>

              {/* Is Member of the Church Toggle */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Miembro de la Iglesia</IonLabel>
                <IonToggle
                  checked={filtersDraft.isMemberOfTheChurch === true}
                  onIonChange={(e) => handleFilterChange('isMemberOfTheChurch', e.detail.checked ? true : null)}
                  color='success'
                />
              </IonCol>

              {/* Has Medical Condition Toggle */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Tiene Condición Médica</IonLabel>
                <IonToggle
                  checked={filtersDraft.hasMedicalCondition === true}
                  onIonChange={(e) => handleFilterChange('hasMedicalCondition', e.detail.checked ? true : null)}
                  color='success'
                />
              </IonCol>
              {/* Has Medical Treatment Toggle */}
              <IonCol className={isMobileView ? '' : 'ion-padding'} size='6' sizeMd='3'>
                <IonLabel className={styles.filterLabel}>Tiene Tratamiento Médico</IonLabel>
                <IonToggle
                  checked={filtersDraft.hasMedicalTreatment === true}
                  onIonChange={(e) => handleFilterChange('hasMedicalTreatment', e.detail.checked ? true : null)}
                  color='success'
                />
              </IonCol>
            </IonRow>

            {/* Action Buttons */}
            <IonRow className='ion-justify-content-end'>
              <IonCol size='6' sizeMd='3'>
                <IonButton expand='block' color='light' onClick={handleApplyFilters}>
                  Buscar
                </IonButton>
              </IonCol>
              <IonCol size='6' sizeMd='3'>
                <IonButton expand='block' fill='outline' color='light' onClick={handleClearFilters}>
                  Limpiar
                </IonButton>
              </IonCol>
            </IonRow>
          </IonCardContent>
        )}
      </IonCard>
    );
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
        <UserFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          mode={modalMode}
          userId={selectedUserId}
          originalUser={originalUser}
          onSuccess={handleModalSuccess}
        />
        {isMobileView ? (
          <>
            {renderFiltersSection()}
            <MobileView
              users={data?.data}
              totalRecords={data?.count || 0}
              first={first}
              rows={rows}
              onPageChange={(newFirst, newRows) => {
                setFirst(newFirst);
                setRows(newRows);
              }}
              onPermutaClick={handlePermutaClick}
              onCreateClick={handleCreateClick}
            />
          </>
        ) : (
          <IonRow>
            <IonCol>
              <div className='table-container'>
                {renderFiltersSection()}
                <DataTable
                  className='custom-datatable'
                  value={data?.data || []}
                  stripedRows
                  paginator
                  rows={rows}
                  first={first}
                  totalRecords={data?.count || 0}
                  onPage={onPage}
                  onSort={onSort}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  rowsPerPageOptions={[10, 20, 50, 100, 200]}
                  dataKey='id'
                  header={renderHeader()}
                  emptyMessage='Usuarios no encontrados'
                  lazy
                  paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                  currentPageReportTemplate='Mostrando {first} a {last} de {totalRecords} registros encontrados'
                >
                  <Column field='firstName' header='Nombre Completo' body={fullNameBodyTemplate} sortable />
                  <Column
                    field='stake.name'
                    header='Estaca / Barrio'
                    body={(rowData: IUser) =>
                      `${rowData.stake?.name ? rowData.stake?.name?.replace('Estaca ', '') : 'N/A'} / ${
                        rowData.ward || 'N/A'
                      }`
                    }
                  />
                  <Column
                    field='shirtSize'
                    header='Talla de Polo'
                    bodyStyle={{ textAlign: 'center' }}
                    headerStyle={{ textAlign: 'center' }}
                    sortable
                  />
                  <Column
                    field='age'
                    header='Edad'
                    sortable
                    bodyStyle={{ textAlign: 'center' }}
                    headerStyle={{ textAlign: 'center' }}
                  />
                  <Column
                    field='userRooms.0.room.roomNumber'
                    header='Habitación'
                    bodyStyle={{ textAlign: 'center' }}
                    headerStyle={{ textAlign: 'center' }}
                  />
                  <Column
                    field='isMemberOfTheChurch'
                    header='Miembro de la Iglesia'
                    body={(rowData: IUser) => (rowData.isMemberOfTheChurch ? 'Sí' : 'No')}
                    bodyStyle={{ textAlign: 'center' }}
                    headerStyle={{ textAlign: 'center' }}
                    sortable
                  />
                  <Column
                    field='medicalCondition'
                    header='Condición Médica'
                    bodyStyle={{ textAlign: 'center' }}
                    body={(rowData: IUser) => rowData.medicalCondition ?? 'No'}
                    sortable
                  />
                  <Column
                    field='medicalTreatment'
                    header='Tratamiento Médico'
                    headerStyle={{ textAlign: 'center' }}
                    body={(rowData: IUser) => rowData.medicalTreatment ?? 'No'}
                    sortable
                  />
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
