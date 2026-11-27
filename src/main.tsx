import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './app/AppRouter.tsx'
import { prepareRoutePage, type PreparedRoutePage } from './app/routePages'
import { cssVariablesResolver, theme } from './app/theme.ts'
import '@mantine/core/styles.css'
import './app/fonts.css'

const root = document.querySelector('#root')
if (root) {
  const app = createRoot(root)
  const render = (prepared?: PreparedRoutePage) => {
    app.render(
      <StrictMode>
        <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme='auto'>
          <BrowserRouter>
            <AppRouter prepared={prepared} />
          </BrowserRouter>
        </MantineProvider>
      </StrictMode>
    )
  }
  // The static page stays visible while the entry route and its CSS load.
  void prepareRoutePage(window.location.pathname).then(render, () => {
    render()
  })
}
