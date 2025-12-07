export enum PaginationOrderDir {
  Asc = 'asc',
  Desc = 'desc',
}

export class PaginationDto {
  limit?: number;
  skip?: number;
  page?: number;
  orderBy?: string;
  orderDir?: PaginationOrderDir;
}
