import { convertXML } from 'simple-xml-to-json'
import type { Child, ServerStatusResponse } from '../../types/serverStatus.ts'

export const processStatus = (response: string): boolean | undefined => {
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
