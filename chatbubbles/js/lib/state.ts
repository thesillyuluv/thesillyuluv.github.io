import { DEFAULTS } from '../defaults'
import { storage } from '@vendetta/plugin'
import type { ChatBubblesStorage } from '../types'

let localSettings: ChatBubblesStorage | undefined

export function initStorage() {
  localSettings = { ...DEFAULTS, ...storage }
}

export function getSettings(): ChatBubblesStorage {
  return localSettings ?? DEFAULTS
}

export function setSetting<K extends keyof ChatBubblesStorage>(
  key: K,
  value: ChatBubblesStorage[K]
) {
  if (!localSettings) return
  localSettings[key] = value
  storage[key] = value
}

export { DEFAULTS }
