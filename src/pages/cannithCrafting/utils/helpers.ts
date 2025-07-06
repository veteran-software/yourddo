import type { ICannithShard } from '../../../types/cannithCrafting.ts'

export const groupedShards = (data: ICannithShard[]) => {
  const groupedShards = data.reduce<Record<string, ICannithShard[]>>(
    (acc: Record<string, ICannithShard[]>, shard: ICannithShard) => {
      const group: string = shard.group

      if (!(group in acc)) {
        acc[group] = []
      }

      acc[group].push(shard)

      return acc
    },
    {}
  )

  const sortedGroups: string[] = Object.keys(groupedShards).sort((a: string, b: string) => a.localeCompare(b))

  sortedGroups.forEach((group: string) => {
    groupedShards[group].sort((a: ICannithShard, b: ICannithShard) => a.name.localeCompare(b.name))
  })

  return {
    groupedShards,
    sortedGroups
  }
}
