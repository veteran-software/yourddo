/**
 * Represents various possible locations where items or resources can be stored or accessed within the system.
 *
 * The `Location` type defines a set of string literals, each representing a specific storage or usage location.
 *
 * Possible values:
 * - 'SharedBank': Indicates a shared banking location accessible by multiple characters on the same account.
 * - 'SharedCrafting': Represents a shared crafting bank.
 * - 'Inventory': Refers to a character inventory.
 * - 'Bank': Represents a character bank.
 * - 'Reincarnation Cache': Character's reincarnation cache populated from the TR process.
 */
export type Location = 'SharedBank' | 'SharedCrafting' | 'Inventory' | 'Bank' | 'Reincarnation Cache'

/**
 * Represents a nested data structure for aggregating item-related information.
 *
 * This type is organized into three levels of nested records:
 * - The first level keys are arbitrary strings representing item names.
 * - The second level keys are arbitrary strings representing the character name the item is currently on.
 * - The third level is a mapping where keys are Location and the values are numbers, representing specific counts for location.
 *
 * Use this structure to associate multiple levels of categorized data with a numerical representation for different locations.
 */
export type ItemRollup = Record<
  string, // normalized item name
  {
    binding: string
    // List of character-specific holdings to avoid accidental overwrite and preserve duplicates
    byCharacter: { character: string; locations: Record<Location, number> }[]
  }
>

/**
 * Represents a row in a Trove CSV file, encapsulating item details and properties.
 */
export interface TroveCsvRow {
  SubscriptionHash: string
  Character: string
  Location: string
  Tab: string
  Name: string
  Quantity: number | string
  Binding: string
}
