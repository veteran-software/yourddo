import { createSlice, type PayloadAction } from '@reduxjs/toolkit/react'
import type { ICannithShard } from '../../types/cannithCrafting.ts'

interface SlotEnchants {
  prefix?: ICannithShard
  suffix?: ICannithShard
  extra?: ICannithShard
  augment?: ICannithShard
}

const initialSlotState: SlotEnchants = {
  prefix: undefined,
  suffix: undefined,
  extra: undefined,
  augment: undefined
}

const initialState: CannithCraftingState = {
  minimumLevel: undefined,
  weapon1: initialSlotState,
  weapon2: initialSlotState,
  armor: initialSlotState,
  shield: initialSlotState,
  belt: initialSlotState,
  boots: initialSlotState,
  bracers: initialSlotState,
  cloak: initialSlotState,
  gloves: initialSlotState,
  goggles: initialSlotState,
  helm: initialSlotState,
  necklace: initialSlotState,
  ring1: initialSlotState,
  ring2: initialSlotState,
  trinket: initialSlotState,
  runearm: initialSlotState
}

const { actions, reducer } = createSlice({
  name: 'cannithCrafting',
  initialState,
  reducers: {
    setMinimumLevel: (state, action: PayloadAction<number>) => {
      state.minimumLevel = action.payload
    },
    setPrefix: (
      state,
      action: PayloadAction<{
        slot: keyof Omit<CannithCraftingState, 'minimumLevel'>
        shard: ICannithShard
      }>
    ) => {
      state[action.payload.slot].prefix = action.payload.shard
    },
    setSuffix: (
      state,
      action: PayloadAction<{
        slot: keyof Omit<CannithCraftingState, 'minimumLevel'>
        shard: ICannithShard
      }>
    ) => {
      state[action.payload.slot].suffix = action.payload.shard
    },
    setExtra: (
      state,
      action: PayloadAction<{
        slot: keyof Omit<CannithCraftingState, 'minimumLevel'>
        shard: ICannithShard
      }>
    ) => {
      state[action.payload.slot].extra = action.payload.shard
    },
    setAugment: (
      state,
      action: PayloadAction<{
        slot: keyof Omit<CannithCraftingState, 'minimumLevel'>
        shard: ICannithShard
      }>
    ) => {
      state[action.payload.slot].augment = action.payload.shard
    },
    resetSlot: (state, action: PayloadAction<keyof Omit<CannithCraftingState, 'minimumLevel'>>) => {
      state[action.payload] = initialSlotState
    },
    resetAll: (state) => {
      return {
        ...initialState,
        minimumLevel: state.minimumLevel
      }
    }
  }
})

export interface CannithCraftingState {
  minimumLevel: number | undefined
  weapon1: SlotEnchants
  weapon2: SlotEnchants
  armor: SlotEnchants
  shield: SlotEnchants
  belt: SlotEnchants
  boots: SlotEnchants
  bracers: SlotEnchants
  cloak: SlotEnchants
  gloves: SlotEnchants
  goggles: SlotEnchants
  helm: SlotEnchants
  necklace: SlotEnchants
  ring1: SlotEnchants
  ring2: SlotEnchants
  trinket: SlotEnchants
  runearm: SlotEnchants
}

export const { setMinimumLevel, setPrefix, setSuffix, setExtra, setAugment, resetSlot, resetAll } = actions

export default reducer
