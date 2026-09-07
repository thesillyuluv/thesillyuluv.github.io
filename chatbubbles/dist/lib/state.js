import { DEFAULTS } from '../defaults';
import { storage } from '@vendetta/plugin';
let localSettings;
export function initStorage() {
    localSettings = { ...DEFAULTS, ...storage };
}
export function getSettings() {
    return localSettings ?? DEFAULTS;
}
export function setSetting(key, value) {
    if (!localSettings)
        return;
    localSettings[key] = value;
    storage[key] = value;
}
export { DEFAULTS };
