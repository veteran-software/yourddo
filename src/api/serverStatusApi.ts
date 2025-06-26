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
    argonnessen: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.145.11' }),
        headers: {
          Accept: 'application/xml'
        }
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    cannith: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.145.17' })
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    ghallanda: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.145.23' })
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    khyber: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.145.29' })
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    orien: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.145.35' })
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    sarlona: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.145.41' })
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    thelanis: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.145.47' })
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    wayfinder: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.145.53' })
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    hardcore: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.145.80' })
      }),
      transformResponse: processStatus
    }),
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    cormyr: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.193.146.10' })
      }),
      transformResponse: processStatus
    })
  })
})
