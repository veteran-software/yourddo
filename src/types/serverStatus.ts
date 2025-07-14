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

export interface SOAPResponse {
  GetDatacenterStatusResponse: GetDatacenterStatusResponse
}

export interface GetDatacenterStatusResponse {
  xmlns: string
  children: GetDatacenterStatusResponseChild[]
}

export interface GetDatacenterStatusResponseChild {
  GetDatacenterStatusResult: GetDatacenterStatusResult
}

export interface GetDatacenterStatusResult {
  children: ServerStatusData[]
}

export interface ServerStatusData {
  StatusServerResult: StatusServerResult
}

export interface StatusServerResult {
  children: StatusServerResultChild[]
}

export interface StatusServerResultChild {
  LastUpdated?: LastUpdated
  Results?: LastUpdated
  Updating?: LastUpdated
  ServerName?: LastUpdated
}

export interface LastUpdated {
  content: string
}

// For parsing the raw XML stuff
export interface Root {
  ArrayOfDatacenterStruct: ArrayOfDatacenterStruct
}

export interface ArrayOfDatacenterStruct {
  DatacenterStruct: DatacenterStruct | DatacenterStruct[]
}

export interface DatacenterStruct {
  KeyName: string
  Datacenter: Datacenter
}

export interface Datacenter {
  datacenter: Datacenter2
}

export interface Datacenter2 {
  Datacenter: Datacenter3
}

export interface Datacenter3 {
  Name: string
  Worlds: Worlds
  AuthServer: string
  PatchServer: string
  LauncherConfigurationServer: string
}

export interface Worlds {
  World: World | World[]
}

export interface World {
  Name: string
  LoginServerUrl: string
  ChatServerUrl: string
  StatusServerUrl: string
  Language?: string
  Order: number
}
