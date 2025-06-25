import { convertXML } from 'simple-xml-to-json'
import type {
  Child,
  ServerStatusData,
  ServerStatusResponse,
  SOAPResponse,
  StatusServerResult
} from '../../../types/serverStatus'

const stripSoapEnvelope = (xmlString: string): string => {
  return xmlString
    .replace(/<[\w-]+:Envelope[^>]*>/g, '')
    .replace(/<\/[\w-]+:Envelope>/g, '')
    .replace(/<[\w-]+:Body[^>]*>/g, '')
    .replace(/<\/[\w-]+:Body>/g, '')

    .trim()
}

export const processStatus = (response: string): ServerStatusData[] => {
  if (response.length === 0) {
    return []
  }

  const parsedResponse: SOAPResponse = convertXML(stripSoapEnvelope(response)) as SOAPResponse

  return parsedResponse.GetDatacenterStatusResponse.children[0].GetDatacenterStatusResult.children
}

export const extractStatus = (serverStatus: StatusServerResult): ServerStatusResponse | undefined => {
  const resultsXml = serverStatus.children.find((child) => child.Results)?.Results?.content

  if (!resultsXml) {
    return undefined
  }

  // Unescape the XML content
  const unescapedXml = resultsXml
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")

  return convertXML(unescapedXml) as ServerStatusResponse
}

export const extractServerName = (server: ServerStatusData): string => {
  return (
    extractStatus(server.StatusServerResult)?.Status.children.find((child: Child) => child.name)?.name?.content ??
    'Unknown Server'
  )
}

export const isServerUp = (server: ServerStatusData): boolean | undefined => {
  const billingRoles = extractStatus(server.StatusServerResult)?.Status.children.find(
    (child: Child) => child.allow_billing_role
  )?.allow_billing_role?.content

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
