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
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    lamannia: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.160.64' })
      }),
      transformResponse: processStatus
    })
  })
})
