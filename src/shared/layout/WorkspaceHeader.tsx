import { Title } from '@mantine/core'
import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import styles from './workspace.module.css'

interface WorkspaceHeaderProps {
  title: string
  icon: Icon
  description?: ReactNode
  actions?: ReactNode
}

export default function WorkspaceHeader({
  title,
  icon: CrestIcon,
  description,
  actions
}: Readonly<WorkspaceHeaderProps>) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <span className={styles.crest} aria-hidden>
          <CrestIcon size={23} stroke={1.6} />
        </span>
        <div>
          <Title order={1} size='h2'>
            {title}
          </Title>
          {description && <div className={styles.description}>{description}</div>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
