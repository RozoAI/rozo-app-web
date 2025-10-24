import { type AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { type GroupBy, type ReportsSummary } from '@/features/reports/types';
import { client } from '@/modules/axios/client';

type ReportsVariables = {
  from: string;
  to: string;
  group_by?: GroupBy;
};

export const useGetReportsSummary = createQuery<ReportsSummary, ReportsVariables, AxiosError>({
  queryKey: ['reports', 'summary'],
  fetcher: async ({ from, to, group_by = 'day' }) => {
    const response = await client.get('functions/v1/reports', {
      params: { from, to, group_by },
    });
    return response.data.data;
  },
  // Cache for 5 minutes as per API docs
  staleTime: 5 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
});
