# Gear Planner parity checklist

- [x] **Slave Lords set membership.** Choose the applied Heroic or Legendary set on eligible gear and count it toward the three- and five-piece bonuses.
- [x] **Trove owner details.** Show which character or shared bank holds an item.
- [x] **Find gear from an enchantment or set summary.** Open matching gear from the summary and surface available bonus types missing from the loadout.
- [x] **Augment comparison before slotting.** Show Upgrade, Redundant, or Overpowered while choosing an augment.
- [x] **Equipment details before equipping.** Show material, socket colors, equipped status, and crafting source in search results.
- [x] **Find a filigree across the loadout.** Search by effect, identify its equipped host, and jump to its slot.

## Other differences from legacy

- [x] **Automatic carryover of legacy browser saves.** On the same site and browser profile, v2 copies saved setups once and preserves the legacy original. Existing v2 setups keep their active selection. JSON import remains available for transfers between sites or browsers.
- [x] **Optional About and backup guide.** Open the guide beside the planner title for character setup, JSON backup and restore, and sharing a single setup. Startup dismissal is remembered.

## Additional findings from the parity scan

- [x] Open a set directly from an equipment result, equipped item, or slotted augment. Each shortcut opens Find Gear with that set selected.
- [x] Limit the Item set dropdown to sets with members in the selected level range. Find Gear also includes sets granted by augments within that range.
- [x] Show what each candidate would replace in Find gear and whether that equipped item belongs to the selected set. Find Gear shows both on the result card and identifies empty slots.
- [x] Flag an augment above the host item's level in the picker when Show all levels is on. Above-level choices show the host ML before selection.
- [x] Restore the one-click clear button for the Find gear search text.
- [x] Include enchantment notes in Discord and forum exports. Both formats include the note alongside its effect, including notes on active set bonuses.
- [x] Identify competing slots inline for equipped enchantments and slotted augments. Each conflict names the slot that overrides, ties, or is overridden by the displayed effect.
- [x] Show material and metal status in the equipped item header and in equipment search results.
- [x] Show filled and unlocked filigree counts on the host. Each filled tile has a remove button that keeps its slot unlocked.

## Smaller navigation difference

- [x] Drop locations and the farming list link named sources to their Compendium pages. Generic sources open a Compendium search for the source, including Crafting for craft-only items.

## CDN data verification

- [x] Verified against release `81.2.0/1795278156` on November 21, 2026. Lhor-Tragu’s Shadowed Armor has a Blue socket, Masterwork Gauntlet has Green and Yellow, Epic Pillar of Light has Orange, and Carved Bone Shield has Purple. V2 finds compatible augments for every one. The previously reported misspelling and wiki-markup remnants did not recur in the socket types across 11,305 normalized item/slot entries.
