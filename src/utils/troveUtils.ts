import type { ParseError } from 'papaparse'
import Papa from 'papaparse'
import type {
  ItemRollup,
  Location,
  TroveCsvRow
} from '../components/trove/types.ts'
import { toSingularName } from './jsxUtils.tsx'

/**
 * A Set containing predefined location identifiers used within the application.
 * The locations represent various storage or interaction points available to the user.
 *
 * LOCATIONS include the following:
 * - 'SharedBank': Represents a shared banking space accessible by multiple entities.
 * - 'SharedCrafting': Represents a shared crafting area for item creation.
 * - 'Inventory': Represents the player's personal inventory.
 * - 'Bank': Represents the player's personal banking space.
 * - 'Reincarnation Cache': Represents a special area for storing items across reincarnations.
 *
 * This Set ensures unique and predefined location values for consistent usage.
 */
const LOCATIONS = new Set<Location>(['SharedBank', 'SharedCrafting', 'Inventory', 'Bank', 'Reincarnation Cache'])

/**
 * Determines whether the provided string is a valid location.
 *
 * This function checks if the given string exists in the set of predefined locations
 * and returns a type guard indicating if the string is a member of the `Location` type.
 *
 * @param {string} x - The string to check against the set of locations.
 * @returns {boolean} True if the provided string is a valid location; otherwise false.
 */
const isLocation = (x: string): x is Location => LOCATIONS.has(x as Location)

/**
 * Normalizes a string by trimming any leading or trailing whitespace
 * and converting all characters to lowercase.
 *
 * @param {string} s - The input string to be normalized.
 * @returns {string} The normalized string.
 */
export const normItem = (s: string): string => s.trim().toLowerCase()

/**
 * Parses the quantity from the CSV row, defaulting to 0 if the value is invalid or missing.
 *
 * @param {TroveCsvRow} row - The row of data containing quantity and item information.
 * @param {string} itemName - The name of the item, for logging purposes.
 * @param {function(string): void} warn - A callback function used to log warnings for invalid data.
 * @returns {number} The parsed quantity, or 0 if parsing fails.
 */
const parseQuantity = (row: TroveCsvRow, itemName: string, warn: (m: string) => void): number => {
  if (typeof row.Quantity === 'number') {
    return row.Quantity
  }
  if (row.Quantity.trim() !== '') {
    const parsed = Number(row.Quantity.trim())
    if (!isNaN(parsed)) {
      return parsed
    }

    warn(`Non-numeric quantity "${row.Quantity}" for item "${itemName}" — defaulted to 0.`)
  }

  return 0
}

/**
 * Updates the binding information for an item entry, logging a warning if there's a conflict.
 *
 * @param {ItemRollup[string]} entry - The rollup entry for a specific item.
 * @param {string} binding - The binding type (e.g., 'Bind on Equip', 'Bind on Pickup').
 * @param {string} itemName - The name of the item, for logging purposes.
 * @param {function(string): void} warn - A callback function used to log warnings for conflicting data.
 */
const updateBinding = (
  entry: { binding: string },
  binding: string,
  itemName: string,
  warn: (m: string) => void
): void => {
  if (binding && entry.binding && binding !== entry.binding) {
    warn(`Binding mismatch for item ${itemName}: ${binding} vs ${entry.binding}`)
  } else if (binding && !entry.binding) {
    entry.binding = binding
  }
}

/**
 * Updates or inserts item information into the rollup data structure, ensuring values are aggregated correctly
 * and invalid or missing data is logged through the provided warning function.
 *
 * @param {ItemRollup} rollup - The data structure storing aggregated item information by character and location.
 * @param {TroveCsvRow} row - The row of data containing character, location, item name, and quantity information.
 * @param {function(string): void} warn - A callback function used to log warnings for invalid or skipped data.
 * @return {void} Does not return a value. Mutates the provided rollup object directly.
 */
const upsert = (rollup: ItemRollup, row: TroveCsvRow, warn: (m: string) => void): void => {
  let character = row.Character.trim()
  const location = row.Location.trim()
  const itemName = row.Name.trim()
  const binding = row.Binding.trim()

  const qty = parseQuantity(row, itemName, warn)

  // If the row is from a shared location, an empty Character should not cause a skip.
  // Bucket such entries under a placeholder '-' character key so they are still tallied.
  if (!character && isLocation(location) && (location === 'SharedCrafting' || location === 'SharedBank')) {
    character = '-'
  }

  if (!character || !location || !itemName) {
    if (location || itemName || character || row.Quantity != null) {
      warn(`Missing item/character/location — skipped row: ${JSON.stringify(row)}`)
    }
    return
  }
  if (!isLocation(location)) {
    warn(`Unknown location : ${location} — skipped (${character}/${itemName}).`)
    return
  }

  // Normalize the item key in singular form so lookups (which are also singular) match reliably
  const iKey = normItem(toSingularName(itemName))

  // Initialize the entry if missing; do not overwrite existing aggregates.
  if (!rollup[iKey]) {
    rollup[iKey] = { binding, byCharacter: [] }
  } else {
    updateBinding(rollup[iKey], binding, itemName, warn)
  }

  // Find existing character entry; if none, create it
  const existing = rollup[iKey].byCharacter.find((e) => e.character === character)
  if (existing) {
    existing.locations[location] = (existing.locations[location] ?? 0) + qty
  } else {
    // Initialize a full Location map to satisfy Record<Location, number>
    const base: Record<Location, number> = {
      SharedBank: 0,
      SharedCrafting: 0,
      Inventory: 0,
      Bank: 0,
      'Reincarnation Cache': 0
    }
    base[location] = (base[location] ?? 0) + qty
    rollup[iKey].byCharacter.push({ character, locations: base })
  }
}

export interface BuildResult {
  data: ItemRollup
  warnings: string[]
  errors: ParseError[]
}

/**
 * Parses a CSV file and constructs an item rollup object, incorporating warnings and errors encountered during parsing.
 *
 * @param {File} file - A file object representing the CSV file to be processed.
 * @returns {Promise<BuildResult>} - A promise that resolves to a `BuildResult` object, containing the parsed data, warnings, and errors.
 *
 * The function uses a library for CSV parsing that supports dynamic typing and multithreaded processing.
 * It processes each row individually, validating and updating the item rollup data.
 * Any parsing errors or warnings encountered during the process are collected and included in the final result.
 *
 * The structure of the returned `BuildResult` object includes:
 * - `data`: Parsed and aggregated item rollup data.
 * - `warnings`: A list of warning messages generated during processing.
 * - `errors`: An array of error objects detailing issues encountered while parsing.
 */
export const buildItemRollupFromCsvFile = (file: File): Promise<BuildResult> =>
  new Promise((resolve) => {
    const data: ItemRollup = {}
    const warnings: string[] = []
    const errors: ParseError[] = []
    const warn = (m: string) => warnings.push(m)

    Papa.parse<TroveCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: { Quantity: true },
      worker: true,
      step(result) {
        if (result.errors.length) errors.push(...result.errors)
        upsert(data, result.data, warn)
      },
      complete() {
        resolve({
          data,
          warnings,
          errors
        })
      },
      error(err) {
        errors.push({
          type: 'Abort',
          code: 'UnknownError',
          message: String(err),
          row: 0
        } as unknown as ParseError)
        resolve({
          data,
          warnings,
          errors
        })
      }
    })
  })

/**
 * Retrieves and parses the stored trove data from the local storage.
 *
 * This function fetches a JSON string associated with the key `troveData`
 * from the browser's local storage. If the data exists, it is parsed into
 * an `ItemRollup` object and returned. Otherwise, it returns `null`.
 *
 * @returns {ItemRollup | null} The parsed `ItemRollup` object if data is found, or `null` if no data exists in local storage.
 */
export const getStoredTroveData = (): ItemRollup | null => {
  const storedData: string | null = localStorage.getItem('troveData')

  if (!storedData) {
    return null
  }

  // Parse unknown JSON and normalize the legacy shape (byCharacter as an object map) to a new array shape at load time
  type LegacyByCharacterMap = Record<string, Record<Location, number>>

  interface LegacyEntry {
    binding: string
    byCharacter: LegacyByCharacterMap
  }

  interface ArrayEntry {
    binding: string
    byCharacter: { character: string; locations: Record<Location, number> }[]
  }

  type ParsedShape = Record<string, LegacyEntry | ArrayEntry>

  const parsedUnknown = JSON.parse(storedData) as unknown
  if (typeof parsedUnknown !== 'object' || parsedUnknown === null) return null

  const parsed = parsedUnknown as ParsedShape
  Object.keys(parsed).forEach((key) => {
    const entry = parsed[key]

    if (!Array.isArray(entry.byCharacter)) {
      const map: LegacyByCharacterMap = entry.byCharacter

      ;(entry as ArrayEntry).byCharacter = Object.entries(map).map(([character, locations]) => ({
        character,
        locations
      }))
    }
  })
  return parsed as unknown as ItemRollup
}

/**
 * Stores the provided trove data into the browser's local storage.
 *
 * @param {ItemRollup} data - The object containing the trove data to be stored.
 *                            It is serialized into a JSON string before being saved.
 */
export const storeTroveData = (data: ItemRollup): void => {
  localStorage.setItem('troveData', JSON.stringify(data))
}
