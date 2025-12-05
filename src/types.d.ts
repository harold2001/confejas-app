import { UseQueryResult } from '@tanstack/react-query';

export type RefetchType = UseQueryResult<unknown, unknown>['refetch'];
