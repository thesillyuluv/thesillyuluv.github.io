import { getSettings } from './state';
import { findByProps } from '@vendetta/metro';
let showCustomColorPicker;
function resolveShowCustomColorPicker() {
    if (typeof showCustomColorPicker === 'function')
        return showCustomColorPicker;
    try {
        const colorPicker = findByProps('showCustomColorPickerActionSheet');
        if (typeof colorPicker?.showCustomColorPickerActionSheet === 'function') {
            showCustomColorPicker = colorPicker.showCustomColorPickerActionSheet;
            return showCustomColorPicker;
        }
    }
    catch {
    }
    return undefined;
}
export function colorIntToHex(color) {
    const value = (color & 0xffffff) >>> 0;
    return `#${value.toString(16).padStart(6, '0')}`;
}
export function openNativeColorPicker(onSelect) {
    const show = resolveShowCustomColorPicker();
    if (typeof show !== 'function')
        return;
    const { bubbleColor } = getSettings();
    show({
        color: typeof bubbleColor === 'number' ? bubbleColor & 0xffffff : 0x000000,
        onSelect: (color) => {
            if (typeof color === 'number')
                onSelect((color & 0xffffff) | 0xff000000);
        },
    });
}
