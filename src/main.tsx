import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './app/AppRouter.tsx'
import { cssVariablesResolver, theme } from './app/theme.ts'
import '@mantine/core/styles.css'
import './app/fonts.css'

const root = document.querySelector('#root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme='auto'>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </MantineProvider>
    </StrictMode>
  )
}
