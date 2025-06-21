import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { convertXML } from 'simple-xml-to-json'

const processStatus = (response: string): boolean | undefined => {
  if (response.length === 0) {
    return undefined
  }

  const parsedResponse: ServerStatusResponse = convertXML(response) as ServerStatusResponse
  const billingRoles = parsedResponse.Status.children.find((child: Child) => child.allow_billing_role)
    ?.allow_billing_role?.content

  if (billingRoles) {
    const rolesPresent: number = [
      'TurbineEmployee',
      'TurbineVIP',
      'StormreachLimited',
      'StormreachStandard',
      'StormreachGuest',
      'StormreachEUPre'
    ].reduce((count, str) => {
      if (billingRoles.includes(str)) {
        count++
      }

      return count
    }, 0)

    return rolesPresent >= 5
  }

  return false
}

export const serverStatusApi = createApi({
  reducerPath: 'serverStatus',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL as string,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'text/xml')
      return headers
    },
    mode: 'no-cors',
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
    lamannia: build.query<boolean | undefined, void>({
      query: () => ({
        url: '',
        // eslint-disable-next-line sonarjs/no-hardcoded-ip
        params: new URLSearchParams({ s: '10.192.160.64' })
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

export interface ServerStatusResponse {
  Status: Status
}

export interface Status {
  children: Child[]
}

export interface Child {
  allow_admin_role?: AllowAdminRole
  allow_billing_role?: AllowAdminRole
  deny_admin_role?: unknown
  deny_billing_role?: unknown
  farmid?: AllowAdminRole
  lastassignedqueuenumber?: AllowAdminRole
  loginservers?: AllowAdminRole
  logintierlastnumbers?: AllowAdminRole
  logintiermultipliers?: AllowAdminRole
  logintiers?: AllowAdminRole
  name?: AllowAdminRole
  nowservingqueuenumber?: AllowAdminRole
  queuenames?: AllowAdminRole
  queueurls?: AllowAdminRole
  wait_hint?: AllowAdminRole
  we_perma_death?: AllowAdminRole
  world_full?: AllowAdminRole
  world_pvppermission?: AllowAdminRole
}

export interface AllowAdminRole {
  content: string
}
