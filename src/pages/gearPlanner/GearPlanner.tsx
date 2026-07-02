import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Button, Card, Container, Modal } from 'react-bootstrap'
import { FaChevronRight, FaTriangleExclamation } from 'react-icons/fa6'
import { useLocation, useNavigate } from 'react-router-dom'
import PermalinkModal from '../../components/common/PermalinkModal.tsx'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { addSetup as addSetupAction, setActiveSetup as setActiveSetupAction } from '../../redux/slices/gearPlannerSlice'
import CharacterSettingsSidebar from './components/CharacterSettingsSidebar.tsx'
import EnchantmentSearchOffcanvas from './components/EnchantmentSearchOffcanvas.tsx'
import FiligreeModal from './components/FiligreeModal.tsx'
import InfoModal from './components/InfoModal.tsx'
import ItemBrowserOffcanvas from './components/ItemBrowserOffcanvas.tsx'
import PermalinkImportEffect from './components/PermalinkImportEffect.tsx'
import PlannerToolbar from './components/PlannerToolbar.tsx'
import SetBonusBrowserOffcanvas from './components/SetBonusBrowserOffcanvas.tsx'
import SettingsModal from './components/SettingsModal.tsx'
import SetupTabs from './components/SetupTabs.tsx'
import { generateBBCodeExport, generateDiscordMarkdownExport } from './exportHelpers'
import useGearPlanner from './hooks/useGearPlanner.tsx'
import { buildPermalinkUrl, encodeGearPermalink } from './permalink.ts'
import { exportSetupsToJson, importSetupsFromJson } from './saveHelpers'
import { type GearItem, type GearSetup, GearSlot } from './types'
import './GearPlanner.css'

const GearPlanner = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { characterSetups: setups, activeSetupId } = useAppSelector((state) => state.gearPlanner)
  const { troveData } = useAppSelector((state) => state.app)

  const [showPermalink, setShowPermalink] = useState(false)
  const [filigreeTarget, setFiligreeTarget] = useState<{
    item: GearItem
    slot: GearSlot
  } | null>(null)
  const [enchantmentSearch, setEnchantmentSearch] = useState('')
  const [enchantmentBonusType, setEnchantmentBonusType] = useState('')
  const [itemNameSearch] = useState('')

  const gpHook = useGearPlanner({
    enchantmentSearch,
    enchantmentBonusType,
    itemNameSearch,
    setBonusFilter: null,
    showConflicts: true,
    showOwnedOnly: false
  })

  const { showSidebar, setShowSidebar, setShowEnchantmentSearch, pendingMinorArtifact, setPendingMinorArtifact } =
    gpHook

  const GEAR_PLANNER_INFO_DISMISSED_KEY = 'gearPlannerInfoDismissed'

  const [showSettings, setShowSettings] = useState(false)
  const [showFiligreeModal, setShowFiligreeModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(() => {
    try {
      return localStorage.getItem(GEAR_PLANNER_INFO_DISMISSED_KEY) !== 'true'
    } catch {
      return true
    }
  })
  const [dontShowInfoAgain, setDontShowInfoAgain] = useState(false)

  const handleInfoModalClose = () => {
    if (dontShowInfoAgain) {
      try {
        localStorage.setItem(GEAR_PLANNER_INFO_DISMISSED_KEY, 'true')
      } catch {
        /* ignore */
      }
    }
    setShowInfoModal(false)
  }

  const importFileRef = useRef<HTMLInputElement>(null)

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    void importSetupsFromJson(file)
      .then((importedSetups) => {
        gpHook.importSetups(importedSetups)
        alert(`Imported ${String(importedSetups.length)} setup(s) successfully.`)
      })
      .catch((err: unknown) => {
        alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      })
  }

  const handleImportSetup = useCallback(
    (importedSetup: GearSetup) => {
      dispatch(addSetupAction(importedSetup))
      dispatch(setActiveSetupAction(importedSetup.id))
    },
    [dispatch]
  )

  useEffect(() => {
    const win = globalThis as unknown as Window
    win.openFiligreeModal = (item: GearItem, slot: GearSlot) => {
      setFiligreeTarget({ item, slot })
      win.filigreeTarget = { item, slot }
      setShowFiligreeModal(true)
    }
    return () => {
      delete win.openFiligreeModal
      delete win.filigreeTarget
    }
  }, [])

  if (gpHook.loading || !gpHook.dataReady) {
    return (
      <Container className='py-4 text-center'>
        <output className='spinner-border text-primary'>
          <span className='visually-hidden'>Loading Gear Data...</span>
        </output>
        <p className='mt-2' aria-hidden='true'>
          {gpHook.loading ? 'Loading Gear Data...' : 'Preparing Item Browser...'}
        </p>
      </Container>
    )
  }

  const handleBonusClick = (name: string, bonusType: string) => {
    setEnchantmentSearch(name)
    setEnchantmentBonusType(bonusType)
    gpHook.setShowEnchantmentSearch(true)
  }

  const handleSetEnchantmentSearch = (search: string) => {
    setEnchantmentSearch(search)
    setEnchantmentBonusType('')
  }

  return (
    <div className='gear-planner-container'>
      <Button
        variant='primary'
        className='gear-planner-sidebar-toggle shadow-sm'
        onClick={() => {
          setShowSidebar(!showSidebar)
        }}
        title='Toggle Settings Sidebar'
      >
        <FaChevronRight className={showSidebar ? 'rotate-180' : ''} style={{ transition: 'transform 0.3s' }} />
      </Button>

      <CharacterSettingsSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        activeSetup={gpHook.activeSetup}
      />

      <Container fluid='lg' className='py-4'>
        <Alert variant='warning' className='d-flex align-items-center gap-2'>
          <FaTriangleExclamation className='flex-shrink-0' />
          <span>
            <strong>Beta:</strong> The Gear Planner is currently in beta. Please report any bugs or feature requests to{' '}
            <strong>Ague</strong> in the{' '}
            <Alert.Link href='https://discord.gg/jk3hYA5Jgv' target='_blank' rel='noreferrer'>
              YourDDO Discord server
            </Alert.Link>
            .
          </span>
        </Alert>
        <Card className='shadow'>
          <PlannerToolbar
            onOpenInfo={() => {
              setDontShowInfoAgain(false)
              setShowInfoModal(true)
            }}
            onBrowseSetBonuses={() => {
              gpHook.openSetBonusBrowser(null)
            }}
            onSearchEnchantments={() => {
              setShowEnchantmentSearch(true)
            }}
            onSaveToFile={() => {
              try {
                exportSetupsToJson(setups)
              } catch (err: unknown) {
                alert(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
              }
            }}
            onForumExport={() => {
              const encoded = encodeGearPermalink(gpHook.activeSetup)
              const permalinkUrl = buildPermalinkUrl(encoded, location)
              const content = generateBBCodeExport(
                gpHook.activeSetup,
                gpHook.essenceEnchantments,
                gpHook.activeSetup.artificerPet,
                gpHook.activeSetup.druidPet,
                permalinkUrl
              )
              navigator.clipboard.writeText(content).catch(console.error)
              alert('Forum BBCode copied to clipboard!')
            }}
            onDiscordExport={() => {
              const encoded = encodeGearPermalink(gpHook.activeSetup)
              const permalinkUrl = buildPermalinkUrl(encoded, location)
              const content = generateDiscordMarkdownExport(
                gpHook.activeSetup,
                gpHook.essenceEnchantments,
                gpHook.activeSetup.artificerPet,
                gpHook.activeSetup.druidPet,
                permalinkUrl
              )
              navigator.clipboard.writeText(content).catch(console.error)
              alert('Discord Markdown copied to clipboard!')
            }}
            onImport={() => {
              importFileRef.current?.click()
            }}
            onPermalink={() => {
              setShowPermalink(true)
            }}
            onSettings={() => {
              setShowSettings(true)
            }}
            onAddSetup={gpHook.addSetup}
            onClearTab={gpHook.clearTab}
          />

          <Card.Body>
            <SetupTabs
              setups={setups}
              activeSetupId={activeSetupId}
              activeSetup={gpHook.activeSetup}
              characterEquipped={gpHook.characterEquipped}
              allItems={gpHook.allItems}
              allAugments={gpHook.allAugments}
              allCurses={gpHook.allCurses}
              allFiligrees={gpHook.allFiligrees}
              essenceEnchantments={gpHook.essenceEnchantments}
              renderSlot={gpHook.renderSlot}
              getEntityState={gpHook.getEntityState}
              openSetBonusBrowser={gpHook.openSetBonusBrowser}
              onSelectSetup={(setupId) => {
                dispatch(setActiveSetupAction(setupId))
              }}
              onDeleteSetup={gpHook.deleteSetup}
              onBonusClick={handleBonusClick}
            />
          </Card.Body>
        </Card>

        <SettingsModal
          show={showSettings}
          onHide={() => {
            setShowSettings(false)
          }}
          activeSetup={gpHook.activeSetup}
          dispatch={dispatch}
          updateClassProficiencies={gpHook.updateClassProficiencies}
        />

        <EnchantmentSearchOffcanvas
          enchantmentSearch={enchantmentSearch}
          setEnchantmentSearch={handleSetEnchantmentSearch}
          troveData={troveData}
          {...gpHook}
        />

        <SetBonusBrowserOffcanvas troveData={troveData} {...gpHook} />

        {filigreeTarget && (
          <FiligreeModal
            show={showFiligreeModal}
            onHide={() => {
              setShowFiligreeModal(false)
            }}
            item={filigreeTarget.item}
            slot={filigreeTarget.slot}
            setup={gpHook.activeSetup}
            allFiligrees={gpHook.allFiligrees}
            setFiligree={gpHook.setSlottedFiligree}
            setUnlockedFiligreeSlots={gpHook.setUnlockedFiligreeSlots}
          />
        )}

        <ItemBrowserOffcanvas troveData={troveData} {...gpHook} />

        <InfoModal
          show={showInfoModal}
          dontShowAgain={dontShowInfoAgain}
          onDontShowAgainChange={setDontShowInfoAgain}
          onClose={handleInfoModalClose}
        />

        <PermalinkModal
          show={showPermalink}
          onHide={() => {
            setShowPermalink(false)
          }}
          buildUrl={() => buildPermalinkUrl(encodeGearPermalink(gpHook.activeSetup), location)}
          title='Create a Gear Planner Permalink'
        />

        <PermalinkImportEffect
          loading={gpHook.loading}
          location={location}
          navigate={navigate}
          allItems={gpHook.allItems}
          allAugments={gpHook.allAugments}
          allCurses={gpHook.allCurses}
          onImportSetup={handleImportSetup}
        />

        <Modal
          show={!!pendingMinorArtifact}
          onHide={() => {
            setPendingMinorArtifact(null)
          }}
          centered
        >
          <Modal.Header closeButton className='bg-warning text-dark'>
            <Modal.Title>Minor Artifact Restriction</Modal.Title>
          </Modal.Header>

          <Modal.Body className='bg-dark text-light'>
            <p>
              You already have a minor artifact in your gear set. A player can only wear one minor artifact at a time.
            </p>
            <p className='mb-0'>
              Please choose a different item for this slot, or remove the existing minor artifact first.
            </p>
          </Modal.Body>

          <Modal.Footer className='bg-dark border-top-0'>
            <Button
              variant='outline-light'
              onClick={() => {
                setPendingMinorArtifact(null)
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <input
        ref={importFileRef}
        type='file'
        accept='.json'
        style={{ display: 'none' }}
        onChange={handleImportFileChange}
      />
    </div>
  )
}

export default GearPlanner

declare global {
  interface Window {
    openFiligreeModal?: (item: GearItem, slot: GearSlot) => void
    filigreeTarget?: { item: GearItem; slot: GearSlot }
  }
}
