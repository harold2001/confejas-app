import { IUser } from '../../interfaces/user.interface';
import { formatDate } from '../../utils/date';

// Date body template
export const dateBodyTemplate = (rowData: IUser) => {
  return formatDate(rowData.birthDate);
};

// Full name body template
export const fullNameBodyTemplate = (rowData: IUser) => {
  const parts = [
    rowData.firstName || '',
    rowData.middleName || '',
    rowData.paternalLastName || '',
    rowData.maternalLastName || '',
  ].filter(Boolean);
  return parts.join(' ');
};
