import ScopedAugmentDetails, { type ScopedAugmentPresentation } from './ScopedAugmentDetails'
import {
  Badge,
  Button,
  Checkbox,
  Group,
  Input,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  UnstyledButton
} from '@mantine/core'
import { IconChevronDown, IconSearch } from '@tabler/icons-react'
import { useId, useState, type ReactNode } from 'react'
import { ownsTroveItem, readTroveInventory, type TroveInventory } from '../../domains/gearPlanner/trove'
import { augmentColors } from './compatibility'
import styles from './AugmentPicker.module.css'

export interface PickerOption {
  presentation?: ScopedAugmentPresentation['presentation']
  fallbackDescription?: string
  searchLabels?: readonly string[]
  value: string
  label: string
  augmentType: string
  minimumLevel?: number | string
  aboveLevel?: boolean
  disabled?: boolean
}
interface Props {
  enchantmentNames?: readonly string[]
  label: string
  description?: string
  placeholder?: string
  options: readonly PickerOption[]
  colors: readonly string[]
  value?: string | null
  onChange: (value: string | null) => void
  hostLevel?: number
  levelFilter?: boolean
  renderOption?: (option: PickerOption) => ReactNode
  inventory?: TroveInventory
  ownedOnly?: boolean
  onOwnedChange?: (owned: boolean) => void
  nothingFoundMessage?: string
}

export default function AugmentPicker({
  label,
  description,
  placeholder,
  options,
  colors,
  enchantmentNames,
  value,
  onChange,
  hostLevel,
  levelFilter,
  renderOption,
  inventory,
  ownedOnly,
  onOwnedChange,
  nothingFoundMessage
}: Readonly<Props>) {
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState('')
  const [enchantment, setEnchantment] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(30)
  const [allLevels, setAllLevels] = useState(false)
  const [localOwned, setLocalOwned] = useState(false)
  const [saved, setSaved] = useState<TroveInventory>()
  const id = useId()
  const stock = inventory ?? saved
  const onlyOwned = ownedOnly ?? localOwned
  const changeOwned = onOwnedChange ?? setLocalOwned
  const selected = options.find((o) => o.value === value)
  const query = search.trim().toLowerCase()
  const visible = open
    ? options.filter(
        (o) =>
          (!color || o.augmentType === color) &&
          (!enchantment || o.searchLabels?.includes(enchantment)) &&
          (o.label.toLowerCase().includes(query) ||
            o.searchLabels?.some((name) => name.toLowerCase().includes(query))) &&
          (allLevels || !(o.aboveLevel ?? (hostLevel !== undefined && Number(o.minimumLevel) > hostLevel))) &&
          (!onlyOwned || !stock?.size || ownsTroveItem(stock, o.label))
      )
    : []
  function choose(v: string | null) {
    onChange(v)
    setOpen(false)
  }
  return (
    <>
      <Input.Wrapper label={label} description={description} id={id} size='xs'>
        <Input
          component='button'
          id={id}
          type='button'
          role='combobox'
          aria-label={label}
          aria-haspopup='dialog'
          aria-expanded={open}
          aria-controls={open ? id + '-dialog' : undefined}
          size='xs'
          rightSection={<IconChevronDown size={14} />}
          classNames={{ input: styles.trigger }}
          onClick={() => {
            setColor('')
            setSearch('')
            setEnchantment(null)
            setLimit(30)
            if (!inventory) setSaved(readTroveInventory())
            setOpen(true)
          }}
        >
          {selected?.label ?? placeholder ?? 'Choose augment'}
        </Input>
      </Input.Wrapper>
      <Modal
        opened={open}
        onClose={() => {
          setOpen(false)
        }}
        closeButtonProps={{ 'aria-label': 'Close' }}
        title={label}
        size='lg'
        centered
        zIndex={350}
        id={id + '-dialog'}
      >
        <Stack gap='sm'>
          <TextInput
            aria-label='Search augments'
            data-autofocus
            placeholder='Search augments'
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value)
              setLimit(30)
            }}
          />
          {Boolean(enchantmentNames?.length) && (
            <Select
              label='Filter by enchantment'
              data={enchantmentNames}
              value={enchantment}
              onChange={(name) => {
                setEnchantment(name)
                setLimit(30)
              }}
              searchable
              clearable
              comboboxProps={{ withinPortal: false }}
            />
          )}
          <Group gap={6} role='group' aria-label='Augment colors'>
            {['', ...colors].map((c) => (
              <Button
                key={c}
                size='compact-sm'
                radius='xl'
                color={augmentColors[c] ?? 'gray'}
                variant={color === c ? 'filled' : 'light'}
                aria-pressed={color === c}
                onClick={() => {
                  setColor(c)
                  setLimit(30)
                }}
              >
                {c || 'All'}
              </Button>
            ))}
          </Group>
          <Group gap='md'>
            <Checkbox
              size='xs'
              label='Show owned'
              disabled={!stock?.size}
              checked={Boolean(stock?.size && onlyOwned)}
              onChange={(e) => {
                changeOwned(e.currentTarget.checked)
                setLimit(30)
              }}
            />
            {(hostLevel !== undefined || levelFilter) && (
              <Switch
                size='xs'
                label='Show all levels'
                checked={allLevels}
                onChange={(e) => {
                  setAllLevels(e.currentTarget.checked)
                  setLimit(30)
                }}
              />
            )}
          </Group>
          <Group justify='space-between'>
            <Text c='dimmed' size='xs' aria-live='polite'>
              {visible.length} matching {visible.length === 1 ? 'augment' : 'augments'}
            </Text>
            {value && (
              <Button
                variant='subtle'
                size='compact-xs'
                onClick={() => {
                  choose(null)
                }}
              >
                Clear selection
              </Button>
            )}
          </Group>
          <div className={styles.results} key={JSON.stringify([color, search, onlyOwned, allLevels])}>
            {visible.slice(0, limit).map((o) => (
              <UnstyledButton
                key={o.value}
                className={styles.row}
                disabled={o.disabled}
                aria-pressed={value === o.value}
                onClick={() => {
                  choose(o.value)
                }}
              >
                {renderOption ? (
                  renderOption(o)
                ) : (
                  <Group justify='space-between' wrap='nowrap'>
                    <Stack gap={0}>
                      <strong>{o.label}</strong>
                      {o.presentation && (
                        <ScopedAugmentDetails
                          augmentName={o.label}
                          presentation={o.presentation}
                          fallbackDescription={o.fallbackDescription}
                        />
                      )}
                      <Text size='xs' c='dimmed'>
                        {o.augmentType}
                        {o.disabled ? ' · Above item minimum level' : ''}
                      </Text>
                    </Stack>
                    <Badge size='sm' variant='light' color='gray'>
                      ML {o.minimumLevel ?? '?'}
                    </Badge>
                  </Group>
                )}
              </UnstyledButton>
            ))}
            {!visible.length && (
              <Text size='sm' p='sm' c='dimmed'>
                {nothingFoundMessage ?? 'No compatible augments match these filters.'}
              </Text>
            )}
            {visible.length > limit && (
              <Button
                fullWidth
                variant='subtle'
                size='xs'
                onClick={() => {
                  setLimit((n) => n + 30)
                }}
              >
                Show more augments
              </Button>
            )}
          </div>
        </Stack>
      </Modal>
    </>
  )
}
