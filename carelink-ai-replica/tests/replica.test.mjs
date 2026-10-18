import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('replica has an independent Vite entry and application source', () => {
  assert.ok(existsSync(new URL('../index.html', import.meta.url)))
  assert.ok(existsSync(new URL('../src/App.tsx', import.meta.url)))
  assert.ok(existsSync(new URL('../src/main.tsx', import.meta.url)))
})

test('source retains the documented original hash page states', () => {
  const app = read('../src/App.tsx')
  for (const route of ['home', 'hospitals', 'hospital-detail', 'doctors', 'appointments', 'blood']) {
    assert.ok(app.includes(route), `expected source to include ${route}`)
  }
})

test('source retains AI, auth, and Supabase configuration boundaries', () => {
  const app = read('../src/App.tsx')
  const client = read('../src/lib/supabase.ts')
  assert.ok(app.includes('chatOpen'))
  assert.ok(app.includes('authOpen'))
  assert.ok(client.includes('VITE_SUPABASE_URL'))
  assert.ok(client.includes('VITE_SUPABASE_PUBLISHABLE_KEY'))
  assert.ok(!client.includes('service_role'))
})

test('replica documentation clearly records visual verification limits', () => {
  const matrix = read('../replica-docs/VERIFICATION_MATRIX.md')
  assert.ok(matrix.includes('Pixel-level parity'))
  assert.ok(matrix.includes('NOT VERIFIED'))
})
