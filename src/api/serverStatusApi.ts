import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { processStatus } from './utils/helpers.ts'

export const serverStatusApi = createApi({
  reducerPath: 'serverStatus',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'text/xml')
      return headers
    },
    credentials: 'include',
    responseHandler: 'text'
  }),
  endpoints: (build) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    dc: build.query<string | undefined, void>({
      query: () => ({
        url: 'dc'
      })
    }),
    status: build.query<boolean | undefined, string>({
      query: (ipAddress: string) => ({
        url: 'status',
        params: new URLSearchParams({ s: ipAddress }),
        headers: {
          Accept: 'application/xml'
        }
      }),
      transformResponse: processStatus
    })
  })
})
