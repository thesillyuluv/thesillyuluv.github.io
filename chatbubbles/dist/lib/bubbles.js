import { findByProps } from '@vendetta/metro';
const PLUGIN_ID = 'dev.kmmiio99o.chatbubbles';
function log(module, action, found) {
    globalThis.__kmmiio?.logUsage?.(PLUGIN_ID, module, action, found);
}
export function isNativeAvailable() {
    try {
        const native = findByProps('callNativeMethod');
        return typeof native?.callNativeMethod === 'function';
    }
    catch {
        return false;
    }
}
export function hookBubbles() {
    if (!isNativeAvailable())
        return Promise.resolve();
    const native = findByProps('callNativeMethod');
    const result = native.callNativeMethod('bubbles.hook', []);
    log('native', 'bubbles.hook', true);
    return result;
}
export function unhookBubbles() {
    if (!isNativeAvailable())
        return Promise.resolve();
    const native = findByProps('callNativeMethod');
    const result = native.callNativeMethod('bubbles.unhook', []);
    log('native', 'bubbles.unhook', true);
    return result;
}
export function configureBubbles(avatarRadius, bubbleRadius, bubbleColor) {
    if (!isNativeAvailable())
        return Promise.resolve();
    const native = findByProps('callNativeMethod');
    const result = native.callNativeMethod('bubbles.configure', [
        avatarRadius,
        bubbleRadius,
        bubbleColor == null ? null : bubbleColor.toString(),
    ]);
    log('native', 'bubbles.configure', true);
    return result;
}
