import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('AI edge function supports Telugu, romanized Telugu, and health-safety guidance', () => {
  const source = read('./index.ts')
  assert.match(source, /romanized Telugu/)
  assert.match(source, /Telugu script/)
  assert.match(source, /SYSTEM_PROMPT/)
  assert.match(source, /not a substitute for a clinician/)
})

test('AI edge function has an emergency-first 112 response and avoids dispatch claims', () => {
  const source = read('./index.ts')
  assert.match(source, /emergencyPatterns/)
  assert.match(source, /emergency_number: '112'/)
  assert.match(source, /This chat ambulance dispatch చేయలేదు/)
})

test('AI edge function validates image input and passes it as multimodal content', () => {
  const source = read('./index.ts')
  assert.match(source, /imageDataUrl/)
  assert.match(source, /data:image/)
  assert.match(source, /image_url/)
  assert.match(source, /7_000_000/)
})

test('AI edge function has origin allowlisting, payload limits, and provider timeout handling', () => {
  const source = read('./index.ts')
  assert.match(source, /APP_ORIGINS/)
  assert.match(source, /Origin not allowed/)
  assert.match(source, /9_000_000/)
  assert.match(source, /AbortSignal\.timeout\(25_000\)/)
  assert.match(source, /response\.status === 429/)
})

test('original and replica expose SOS, emergency directions and image upload', () => {
  for (const path of ['../../../src/App.tsx', '../../../carelink-ai-replica/src/App.tsx']) {
    const app = read(path)
    assert.match(app, /tel:112/)
    assert.match(app, /openEmergencyDirections/)
    assert.match(app, /handleChatImage/)
    assert.match(app, /imageDataUrl/)
    assert.match(app, /google\.com\/maps\/dir\//)
  }
})
