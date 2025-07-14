import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { processStatus } from './utils/helpers.ts'

export const serverStatusLamApi = createApi({
  reducerPath: 'serverStatusLam',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api-lam',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'text/xml')
      return headers
    },
    credentials: 'include',
    responseHandler: 'text'
  }),
  endpoints: (build) => ({
    status: build.query<boolean | undefined, string>({
      query: (ipAddress: string) => ({
        url: 'status',
        params: new URLSearchParams({ s: ipAddress }),
        headers: {
          Accept: 'application/xml'
        }
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    dc: build.query<string | undefined, void>({
      query: () => ({
        url: 'dc'
      })
    })
  })
})
