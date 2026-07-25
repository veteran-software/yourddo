import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import * as z from 'zod'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const outputFile = fileURLToPath(new URL('../public/schemas/gear-planner-save.schema.json', import.meta.url))
const checkOnly = process.argv.includes('--check')

const vite = await createServer({
  root: projectRoot,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent'
})

try {
  const { SaveFileV1Schema } = await vite.ssrLoadModule('/src/schemas/saveFile.ts')
  const { $schema, ...generatedSchema } = z.toJSONSchema(SaveFileV1Schema, {
    target: 'draft-2020-12',
    io: 'input',
    reused: 'ref'
  })
  const schema = {
    $schema,
    $id: 'https://yourddo.com/schemas/gear-planner-save.schema.json',
    title: 'YourDDO Gear Planner Save File v1',
    description: 'The complete format produced by the YourDDO Gear Planner JSON export.',
    ...generatedSchema
  }
  const contents = `${JSON.stringify(schema, null, 2)}\n`

  if (checkOnly) {
    const existing = await readFile(outputFile, 'utf8').catch(() => '')
    if (existing !== contents) {
      console.error('Gear Planner JSON Schema is out of date. Run `yarn schema:gear-planner`.')
      process.exitCode = 1
    }
  } else {
    await mkdir(fileURLToPath(new URL('../public/schemas', import.meta.url)), { recursive: true })
    await writeFile(outputFile, contents)
    console.log(`Generated ${outputFile}`)
  }
} finally {
  await vite.close()
}
