import type { LootItem } from '../../pages/gearPlanner/types.ts'

import bastardSwords from './runtime/bastardSword.json'
import battleAxes from './runtime/battleAxe.json'
import belts from './runtime/belt.json'
import boots from './runtime/boots.json'

import bracers from './runtime/bracers.json'
import bucklers from './runtime/buckler.json'
import cloaks from './runtime/cloak.json'
import clubs from './runtime/club.json'
import daggers from './runtime/dagger.json'
import darts from './runtime/dart.json'
import dwarvenWarAxes from './runtime/dwarvenWarAxe.json'
import falchions from './runtime/falchion.json'
import gloves from './runtime/gloves.json'
import goggles from './runtime/goggles.json'
import greatAxes from './runtime/greatAxe.json'
import greatClubs from './runtime/greatClub.json'
import greatCrossbows from './runtime/greatCrossbow.json'
import greatSwords from './runtime/greatSword.json'
import handAxes from './runtime/handAxe.json'
import handwraps from './runtime/handwraps.json'
import heavyArmor from './runtime/heavyArmor.json'
import heavyCrossbows from './runtime/heavyCrossbow.json'
import heavyMaces from './runtime/heavyMace.json'
import heavyPicks from './runtime/heavyPick.json'
import helmets from './runtime/helmet.json'
import kamas from './runtime/kama.json'
import khopeshs from './runtime/khopesh.json'
import kukris from './runtime/kukri.json'
import largeShields from './runtime/largeShield.json'
import lightArmor from './runtime/lightArmor.json'
import lightCrossbows from './runtime/lightCrossbow.json'
import lightHammers from './runtime/lightHammer.json'
import lightMaces from './runtime/lightMace.json'
import lightPicks from './runtime/lightPick.json'
import longBows from './runtime/longBow.json'
import longSwords from './runtime/longSword.json'
import mauls from './runtime/maul.json'
import mediumArmor from './runtime/mediumArmor.json'
import morningstars from './runtime/morningstar.json'
import necklaces from './runtime/necklace.json'
import orbs from './runtime/orb.json'
import outfits from './runtime/outfit.json'
import quarterstaves from './runtime/quarterstaff.json'
import rapiers from './runtime/rapier.json'
import heavyRepeaters from './runtime/repeatingHeavyCrossbow.json'
import lightRepeaters from './runtime/repeatingLightCrossbow.json'
import rings from './runtime/ring.json'
import robes from './runtime/robe.json'
import scimitars from './runtime/scimitar.json'
import shortBows from './runtime/shortBow.json'
import shortSwords from './runtime/shortSword.json'
import shuriken from './runtime/shuriken.json'
import sickles from './runtime/sickle.json'
import smallShields from './runtime/smallShield.json'
import throwingAxes from './runtime/throwingAxe.json'
import throwingDaggers from './runtime/throwingDagger.json'
import throwingHammers from './runtime/throwingHammer.json'
import towerShields from './runtime/towerShield.json'
import trinkets from './runtime/trinket.json'
import warhammers from './runtime/warhammer.json'

export const JEWELRY: LootItem[] = ([] as LootItem[]).concat(
  bracers as unknown as LootItem[],
  goggles as unknown as LootItem[],
  necklaces as unknown as LootItem[],
  rings as unknown as LootItem[],
  trinkets as unknown as LootItem[]
)

export const CLOTHING: LootItem[] = ([] as LootItem[]).concat(
  helmets as unknown as LootItem[],
  gloves as unknown as LootItem[],
  cloaks as unknown as LootItem[],
  belts as unknown as LootItem[],
  boots as unknown as LootItem[]
)

export const ALL_ARMOR: LootItem[] = ([] as LootItem[]).concat(
  heavyArmor as unknown as LootItem[],
  lightArmor as unknown as LootItem[],
  mediumArmor as unknown as LootItem[],
  outfits as unknown as LootItem[],
  robes as unknown as LootItem[]
)

export const ALL_SHIELDS: LootItem[] = ([] as LootItem[]).concat(
  bucklers as unknown as LootItem[],
  smallShields as unknown as LootItem[],
  largeShields as unknown as LootItem[],
  orbs as unknown as LootItem[],
  towerShields as unknown as LootItem[]
)

export const SIMPLE_WEAPONS: LootItem[] = ([] as LootItem[]).concat(
  clubs as unknown as LootItem[],
  daggers as unknown as LootItem[],
  heavyCrossbows as unknown as LootItem[],
  heavyMaces as unknown as LootItem[],
  lightCrossbows as unknown as LootItem[],
  lightMaces as unknown as LootItem[],
  morningstars as unknown as LootItem[],
  quarterstaves as unknown as LootItem[],
  sickles as unknown as LootItem[]
)

export const MARTIAL_WEAPONS: LootItem[] = ([] as LootItem[]).concat(
  battleAxes as unknown as LootItem[],
  falchions as unknown as LootItem[],
  greatAxes as unknown as LootItem[],
  greatClubs as unknown as LootItem[],
  greatSwords as unknown as LootItem[],
  handAxes as unknown as LootItem[],
  heavyPicks as unknown as LootItem[],
  kukris as unknown as LootItem[],
  lightHammers as unknown as LootItem[],
  lightPicks as unknown as LootItem[],
  longBows as unknown as LootItem[],
  longSwords as unknown as LootItem[],
  mauls as unknown as LootItem[],
  rapiers as unknown as LootItem[],
  scimitars as unknown as LootItem[],
  shortBows as unknown as LootItem[],
  shortSwords as unknown as LootItem[],
  warhammers as unknown as LootItem[]
)

export const EXOTIC_WEAPONS: LootItem[] = ([] as LootItem[]).concat(
  bastardSwords as unknown as LootItem[],
  dwarvenWarAxes as unknown as LootItem[],
  greatCrossbows as unknown as LootItem[],
  handwraps as unknown as LootItem[],
  heavyRepeaters as unknown as LootItem[],
  kamas as unknown as LootItem[],
  khopeshs as unknown as LootItem[],
  lightRepeaters as unknown as LootItem[]
)

export const THROWING_WEAPONS: LootItem[] = ([] as LootItem[]).concat(
  darts as unknown as LootItem[],
  shuriken as unknown as LootItem[],
  throwingAxes as unknown as LootItem[],
  throwingDaggers as unknown as LootItem[],
  throwingHammers as unknown as LootItem[]
)

export const WEAPONS: LootItem[] = ([] as LootItem[])
  .concat(SIMPLE_WEAPONS, MARTIAL_WEAPONS, EXOTIC_WEAPONS)
  .sort((a, b) => a.name.localeCompare(b.name))

export const RANGED_WEAPONS: LootItem[] = ([] as LootItem[]).concat(
  heavyCrossbows as unknown as LootItem[],
  lightCrossbows as unknown as LootItem[],
  greatCrossbows as unknown as LootItem[],
  heavyRepeaters as unknown as LootItem[],
  lightRepeaters as unknown as LootItem[],
  longBows as unknown as LootItem[],
  shortBows as unknown as LootItem[]
)

export const ACCESSORIES: LootItem[] = ([] as LootItem[]).concat(JEWELRY, CLOTHING)
