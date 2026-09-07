import { initStorage } from './lib/state'
import Settings from './settings'
import { startBubbles } from './lib/manager'
import { createUnpatcher } from '@lib/patcher'

const { cleanup } = createUnpatcher()

export default {
  onLoad() {
    initStorage()
    startBubbles(cleanup)
  },
  
  onUnload() {
    cleanup()
  },
  
  settings: Settings,
}
