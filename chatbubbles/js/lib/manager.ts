import { Dispatcher } from '@vendetta/metro/common'
import {
  configureBubbles,
  hookBubbles,
  isNativeAvailable,
  unhookBubbles,
} from './bubbles'
import { getSettings } from './state'
import { findByProps } from '@vendetta/metro'
import { processColor } from 'react-native'

const APPEARANCE_EVENTS = [
  'CACHE_LOADED',
  'SELECTIVELY_SYNCED_USER_SETTINGS_UPDATE',
  'THEME_UPDATE',
]

function getBubbleColor(): number | null {
  const { customBubbleColor, bubbleColor } = getSettings()
  if (customBubbleColor && typeof bubbleColor === 'number') return bubbleColor
  try {
    const tokens = findByProps('colors')
    const token = tokens?.colors?.BACKGROUND_SECONDARY_ALT
    const theme = findByProps('theme')?.theme
    const resolved = tokens?.internal?.resolveSemanticColor(theme, token)
    if (typeof resolved === 'string' && resolved.startsWith('#')) {
      return Number(processColor(resolved))
    }
  } catch {}
  return null
}

function updateBubbleAppearance() {
  const { avatarRadius, bubbleChatRadius } = getSettings()
  configureBubbles(
    Math.round(Number(avatarRadius) || 0),
    Math.round(Number(bubbleChatRadius) || 0),
    getBubbleColor(),
  ).catch(e => {
    console.error('[ChatBubbles] bubbles.configure failed:', e)
  })
}

export function startBubbles(cleanup: () => void) {
  let stop = () => {}

  void (async () => {
    await new Promise(r => setTimeout(r, 0))

    if (!isNativeAvailable()) {
      return
    }

    await hookBubbles()

    const subs: Array<() => void> = []

    for (const event of APPEARANCE_EVENTS) {
      Dispatcher.subscribe(event, updateBubbleAppearance)
      subs.push(() => Dispatcher.unsubscribe(event, updateBubbleAppearance))
    }

    stop = () => {
      for (const un of subs) un()
      void unhookBubbles().catch(() => {})
    }

    updateBubbleAppearance()
  })()

  cleanup(() => stop())
}
