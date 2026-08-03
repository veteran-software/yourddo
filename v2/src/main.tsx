import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { theme } from './app/theme.ts'
import '@mantine/core/styles.css'

const root = document.querySelector('main#root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <MantineProvider theme={theme} defaultColorScheme='auto'>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MantineProvider>
    </StrictMode>
  )
}
