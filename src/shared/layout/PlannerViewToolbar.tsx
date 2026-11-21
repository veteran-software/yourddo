import { Button, Group, Modal, SegmentedControl } from '@mantine/core'
import { IconFileImport, IconLayoutGrid, IconList } from '@tabler/icons-react'
import { useState } from 'react'
import type { WorkspaceTool } from './WorkspaceLayout'
import { BackupOnly } from './plannerView'
import styles from './PlannerWorkspace.module.css'

export function PlannerViewToolbar({
  view,
  changeView,
  tools
}: Readonly<{
  view: string
  changeView: (value: 'grid' | 'list') => void
  tools: readonly WorkspaceTool[]
}>) {
  const [opened, setOpened] = useState(false)
  const sharing = tools.find((tool) => tool.id === 'sharing')
  return (
    <div className={styles.viewToolbar}>
      <SegmentedControl
        aria-label='Equipment layout'
        size='xs'
        value={view}
        onChange={(value) => {
          changeView(value === 'grid' ? 'grid' : 'list')
        }}
        data={[
          {
            value: 'list',
            label: (
              <Group component='span' gap={5} wrap='nowrap'>
                <IconList size={15} aria-hidden />
                List
              </Group>
            )
          },
          {
            value: 'grid',
            label: (
              <Group component='span' gap={5} wrap='nowrap'>
                <IconLayoutGrid size={15} aria-hidden />
                Grid
              </Group>
            )
          }
        ]}
      />
      <Button
        size='compact-sm'
        variant='subtle'
        leftSection={<IconFileImport size={15} />}
        onClick={() => {
          setOpened(true)
        }}
      >
        Import / Export
      </Button>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false)
        }}
        title='Import / Export'
        centered
      >
        {opened && sharing && 'content' in sharing && (
          <BackupOnly.Provider value>{sharing.content}</BackupOnly.Provider>
        )}
      </Modal>
    </div>
  )
}
