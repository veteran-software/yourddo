import { convertXML } from 'simple-xml-to-json'
import type {
  Child,
  ServerStatusData,
  ServerStatusResponse,
  SOAPResponse,
  StatusServerResult
} from '../../../types/serverStatus'

/**
 * Removes SOAP envelope and body tags from an XML string.
 *
 * This function takes an XML string that may include SOAP-specific
 * `<Envelope>` and `<Body>` tags with or without namespaces. It removes
 * these tags, including their opening and closing counterparts, and
 * returns the resulting string. The trimmed string contains only the
 * inner content of the SOAP message.
 *
 * @param {string} xmlString - The XML string that contains SOAP envelope
 * and body tags to be stripped.
 * @returns {string} A string with the SOAP envelope and body tags
 * removed.
 */
const stripSoapEnvelope = (xmlString: string): string => {
  const processString = (input: string): string => {
    const tagPairs = [
      ['<s:Envelope', '</s:Envelope>'],
      ['<soap:Envelope', '</soap:Envelope>'],
      ['<SOAP-ENV:Envelope', '</SOAP-ENV:Envelope>'],
      ['<s:Body', '</s:Body>'],
      ['<soap:Body', '</soap:Body>'],
      ['<SOAP-ENV:Body', '</SOAP-ENV:Body>']
    ]

    let result = input
    for (const [openTag, closeTag] of tagPairs) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        const startIndex = result.toLowerCase().indexOf(openTag.toLowerCase())
        if (startIndex === -1) break

        const endTag = result.toLowerCase().indexOf('>', startIndex)
        if (endTag === -1) break

        const closeIndex = result.toLowerCase().indexOf(closeTag.toLowerCase())
        if (closeIndex === -1) break

        const closeEndIndex = closeIndex + closeTag.length

        // Remove the tag
        result = result.slice(0, startIndex) + result.slice(endTag + 1, closeIndex) + result.slice(closeEndIndex)
      }
    }
    return result
  }

  let previous
  do {
    previous = xmlString
    xmlString = processString(xmlString)
  } while (xmlString !== previous)

  return xmlString.trim()
}

/**
 * Parses and processes the server status response from a SOAP API.
 * Converts the SOAP XML response to a structured object, extracts relevant
 * children data, and returns an array of server status information.
 *
 * @param {string} response - The SOAP API response as an XML-formatted string.
 * @returns {ServerStatusData[]} An array of processed server status data.
 * Returns an empty array if the response is empty or invalid.
 */
export const processStatus = (response: string): ServerStatusData[] => {
  if (response.length === 0) {
    return []
  }

  const parsedResponse: SOAPResponse = convertXML(stripSoapEnvelope(response)) as SOAPResponse

  return parsedResponse.GetDatacenterStatusResponse.children[0].GetDatacenterStatusResult.children
}

/**
 * Extracts and processes the server status information from the provided server status result object.
 *
 * This function retrieves the XML content from a specified child within the provided server status object,
 * then unescapes the XML content to restore its original structure. After unescaping, it converts the XML
 * content into a `ServerStatusResponse` object. If the required XML content is not found, the function
 * returns `undefined`.
 *
 * @param {StatusServerResult} serverStatus - The result object containing the server status information,
 *                                           including a list of child elements where the required XML content
 *                                           may be located.
 * @returns {ServerStatusResponse | undefined} The processed server status response object derived from
 *                                             the unescaped XML content, or undefined if the XML is missing.
 */
export const extractStatus = (serverStatus: StatusServerResult): ServerStatusResponse | undefined => {
  const resultsXml = serverStatus.children.find((child) => child.Results)?.Results?.content

  if (!resultsXml) {
    return undefined
  }

  // Unescape the XML content
  const unescapedXml = resultsXml
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')

  return convertXML(unescapedXml) as ServerStatusResponse
}

/**
 * Extracts the server name from the provided server status data.
 *
 * This function processes the `server` object and navigates through its structure to extract
 * the name of the server. If the name cannot be found, it returns a default value of "Unknown Server".
 *
 * @param {ServerStatusData} server - The server status data containing nested properties related to server information.
 * @returns {string} The extracted server name, or "Unknown Server" if no name is found.
 */
export const extractServerName = (server: ServerStatusData): string => {
  return (
    extractStatus(server.StatusServerResult)?.Status.children.find((child: Child) => child.name)?.name?.content ??
    'Unknown Server'
  )
}

/**
 * Determines if the server is considered "up" based on specific billing roles.
 *
 * This function checks the server's status data to determine if it allows billing roles
 * and matches required role criteria. If the server contains at least five specific billing roles,
 * it is considered to be up. If no billing roles are found, it returns `false`.
 *
 * @param {ServerStatusData} server - The status data of the server that contains information
 *                                    about billing roles and other status parameters.
 * @returns {boolean | undefined} - Returns `true` if the server is up based on matching criteria,
 *                                  `false` if the criteria are not met, or `undefined` if the input
 *                                  data is not enough.
 */
export const isServerUp = (server: ServerStatusData): boolean | undefined => {
  const billingRoles: string | undefined = extractStatus(server.StatusServerResult)?.Status.children.find(
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
    ].reduce((count: number, str: string) => {
      if (billingRoles.includes(str)) {
        count++
      }

      return count
    }, 0)

    return rolesPresent >= 5
  }

  return false
}
