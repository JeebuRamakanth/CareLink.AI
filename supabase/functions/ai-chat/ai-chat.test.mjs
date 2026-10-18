import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('AI edge function documents Telugu and romanized Telugu support', () => {
  const source = read('../functions/ai-chat/index.ts')
  assert.match(source, /romanized Telugu/)
  assert.match(source, /Telugu script/)
  assert.match(source, /SYSTEM_PROMPT/)
})

test('AI edge function has an emergency-first 112 response and avoids dispatch claims', () => {
  const source = read('../functions/ai-chat/index.ts')
  assert.match(source, /emergencyPatterns/)
  assert.match(source, /emergency_number: '112'/)
  assert.match(source, /This chat ambulance dispatch చేయలేదు/)
})

test('AI edge function validates image input and passes it as multimodal content', () => {
  const source = read('../functions/ai-chat/index.ts')
  assert.match(source, /imageDataUrl/)
  assert.match(source, /image\/\(png\|jpeg\|webp\)/)
  assert.match(source, /image_url/)
  assert.match(source, /8_000_000/)
})

test('original and replica expose SOS, emergency directions and image upload', () => {
  for (const path of ['../../src/App.tsx', '../../carelink-ai-replica/src/App.tsx']) {
    const app = read(path)
    assert.match(app, /tel:112/)
    assert.match(app, /openEmergencyDirections/)
    assert.match(app, /handleChatImage/)
    assert.match(app, /imageDataUrl/)
    assert.match(app, /google\.com\/maps\/dir\//)
  }
})
