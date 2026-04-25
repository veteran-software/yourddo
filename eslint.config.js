import eslintReact from '@eslint-react/eslint-plugin'
import js from '@eslint/js'
import * as sonarjs from 'eslint-plugin-sonarjs'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    ignores: [
      './dist/*',
      '**/*.css',
      '**/*.svg',
      './eslint.config.js',
      'src/pages/gearPlannerv2/**',
      'src/redux/slices/gearPlanner.slice.ts'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ['scripts/**/*'],
    ...tseslint.configs.disableTypeChecked
  },
  eslintReact.configs['recommended-typescript'],
  sonarjs.configs.recommended,
  {
    files: ['scripts/**/*'],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
])
