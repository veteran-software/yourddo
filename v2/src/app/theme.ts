import {
  AppShell,
  Button,
  Card,
  Combobox,
  createTheme,
  Divider,
  Drawer,
  Input,
  Menu,
  Modal,
  NavLink,
  Paper,
  Tabs,
  Title,
  type CSSVariablesResolver
} from '@mantine/core'
import classes from './theme.module.css'

export const theme = createTheme({
  primaryColor: 'gold',
  primaryShade: 5,
  autoContrast: true,
  luminanceThreshold: 0.179,
  defaultRadius: 'sm',
  fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
  headings: {
    fontFamily: 'Cinzel, Georgia, serif',
    fontWeight: '600'
  },
  colors: {
    dark: [
      '#e5e8f0',
      '#c9cedd',
      '#a8b1c5',
      '#8390a8',
      '#515d76',
      '#384258',
      '#2a2f40',
      '#1d212f',
      '#171b27',
      '#11141e'
    ],
    gold: [
      '#fcf6e7',
      '#f3e7c7',
      '#e5cf98',
      '#d6b66c',
      '#c6a052',
      '#b38b36',
      '#977126',
      '#79571e',
      '#5e421b',
      '#432e16'
    ],
    crimson: [
      '#fff0f1',
      '#f9dce0',
      '#ecb7c0',
      '#dc8d9c',
      '#c75d73',
      '#b43c57',
      '#98283f',
      '#7e1f35',
      '#651d2f',
      '#4c1926'
    ]
  },
  shadows: {
    xs: '0 2px 5px var(--app-shadow), inset 0 1px 0 var(--app-highlight)',
    sm: '0 4px 12px var(--app-shadow), inset 0 1px 0 var(--app-highlight)',
    md: '0 8px 24px var(--app-shadow)',
    lg: '0 12px 36px var(--app-shadow)',
    xl: '0 20px 60px var(--app-shadow)'
  },
  components: {
    AppShell: AppShell.extend({
      styles: {
        header: {
          background: 'linear-gradient(110deg, #121620, #252b3c)',
          color: '#e5e8f0',
          borderColor: '#76613c',
          boxShadow: '0 2px 12px var(--app-shadow)'
        },
        navbar: { background: 'var(--app-nav)', borderColor: 'var(--app-border)' },
        main: {
          backgroundColor: 'var(--mantine-color-body)',
          backgroundImage: 'radial-gradient(ellipse at top right, var(--app-ambient), transparent 65%)'
        }
      }
    }),
    Paper: Paper.extend({
      defaultProps: { shadow: 'xs' },
      classNames: { root: classes.paper },
      styles: {
        root: {
          backgroundColor: 'var(--app-paper-surface, var(--app-panel))',
          borderColor: 'var(--app-border)'
        }
      }
    }),
    Card: Card.extend({
      styles: { root: { backgroundColor: 'var(--app-raised)', borderColor: 'var(--app-border)' } }
    }),
    Title: Title.extend({
      styles: (_, { order }) => ({
        root: {
          color: 'var(--app-heading)',
          letterSpacing: order === 1 ? '0.025em' : undefined,
          fontFamily: order === 1 || order === 2 ? undefined : 'var(--mantine-font-family)'
        }
      })
    }),
    Button: Button.extend({ defaultProps: { fw: 600 } }),
    NavLink: NavLink.extend({
      classNames: { root: classes.navLink },
      styles: { root: { borderRadius: 'var(--mantine-radius-sm)' }, label: { fontWeight: 500 } }
    }),
    Input: Input.extend({ classNames: { input: classes.input } }),
    Tabs: Tabs.extend({ classNames: { tab: classes.tab, list: classes.tabList } }),
    Divider: Divider.extend({ defaultProps: { color: 'var(--app-border)' } }),
    Combobox: Combobox.extend({
      styles: { dropdown: { backgroundColor: 'var(--app-raised)', borderColor: 'var(--app-border)' } }
    }),
    Menu: Menu.extend({
      styles: { dropdown: { backgroundColor: 'var(--app-raised)', borderColor: 'var(--app-border)' } }
    }),
    Drawer: Drawer.extend({
      styles: {
        content: { backgroundColor: 'var(--app-panel)' },
        header: { backgroundColor: 'var(--app-nav)', borderBottom: '1px solid var(--app-border)' },
        title: { fontFamily: 'var(--mantine-font-family-headings)', fontWeight: 600 }
      }
    }),
    Modal: Modal.extend({
      styles: {
        content: { backgroundColor: 'var(--app-panel)', border: '1px solid var(--app-border)' },
        header: { backgroundColor: 'var(--app-panel)' },
        title: { fontFamily: 'var(--mantine-font-family-headings)', fontWeight: 600 }
      }
    })
  }
})

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--puzzle-tile-size': 'min(4.84rem, (100cqw - 0.5rem) / 6)'
  },
  dark: {
    '--mantine-color-body': '#1d212f',
    '--mantine-color-text': '#e5e8f0',
    '--mantine-color-bright': '#f6f2e9',
    '--mantine-color-dimmed': '#a8b1c5',
    '--mantine-color-placeholder': '#929eb5',
    '--mantine-color-default': '#30384b',
    '--mantine-color-default-hover': '#3a455b',
    '--mantine-color-default-border': '#515d76',
    '--mantine-color-gold-light': 'rgba(198, 160, 82, 0.14)',
    '--mantine-color-gold-light-hover': 'rgba(198, 160, 82, 0.22)',
    '--mantine-color-gold-light-color': '#e5cf98',
    '--app-nav': '#171c29',
    '--app-panel': '#282e40',
    '--app-raised': '#30384b',
    '--app-input': '#191f2d',
    '--app-border': '#424c63',
    '--app-heading': '#f0e4ca',
    '--app-accent': '#d6b66c',
    '--app-active': '#393328',
    '--app-active-text': '#efcf8c',
    '--app-crimson': '#c75d73',
    '--app-ambient': 'rgba(198, 160, 82, 0.055)',
    '--app-shadow': 'rgba(5, 8, 17, 0.24)',
    '--app-highlight': 'rgba(222, 229, 247, 0.045)'
  },
  light: {
    '--mantine-color-body': '#eeede8',
    '--mantine-color-text': '#2a3041',
    '--mantine-color-bright': '#202637',
    '--mantine-color-dimmed': '#606779',
    '--mantine-color-placeholder': '#697183',
    '--mantine-color-anchor': '#79571e',
    '--mantine-color-default': '#fffdf8',
    '--mantine-color-default-hover': '#f1ede3',
    '--mantine-color-default-color': '#2a3041',
    '--mantine-color-default-border': '#c1bdb3',
    '--mantine-color-gold-light': '#eee0be',
    '--mantine-color-gold-light-hover': '#e5d2a5',
    '--mantine-color-gold-light-color': '#604318',
    '--app-nav': '#e3e2dc',
    '--app-panel': '#faf8f2',
    '--app-raised': '#fffdf8',
    '--app-input': '#fffefa',
    '--app-border': '#ccc8bd',
    '--app-heading': '#30354a',
    '--app-accent': '#79571e',
    '--app-active': '#eee0be',
    '--app-active-text': '#604318',
    '--app-crimson': '#98283f',
    '--app-ambient': 'rgba(179, 139, 54, 0.06)',
    '--app-shadow': 'rgba(36, 32, 22, 0.07)',
    '--app-highlight': 'rgba(255, 255, 255, 0.8)'
  }
})
