// ChatBubbles Plugin - Bundled Version
(() => {
  // State Management
  const DEFAULTS = {
    avatarRadius: 12,
    bubbleChatRadius: 40,
    customBubbleColor: false,
    bubbleColor: null,
  };

  let localSettings = undefined;

  function initStorage() {
    // Import storage from @vendetta/plugin
    const { storage } = require("@vendetta/plugin");
    localSettings = { ...DEFAULTS, ...storage };
  }

  function getSettings() {
    return localSettings ?? DEFAULTS;
  }

  function setSetting(key, value) {
    if (!localSettings) return;
    const { storage } = require("@vendetta/plugin");
    localSettings[key] = value;
    storage[key] = value;
  }

  // Bubbles Module
  const { findByProps } = require("@vendetta/metro");
  const PLUGIN_ID = "dev.kmmiio99o.chatbubbles";

  function log(module, action, found) {
    globalThis.__kmmiio?.logUsage?.(PLUGIN_ID, module, action, found);
  }

  function isNativeAvailable() {
    try {
      const native = findByProps("callNativeMethod");
      return typeof native?.callNativeMethod === "function";
    } catch {
      return false;
    }
  }

  function hookBubbles() {
    if (!isNativeAvailable()) return Promise.resolve();
    const native = findByProps("callNativeMethod");
    const result = native.callNativeMethod("bubbles.hook", []);
    log("native", "bubbles.hook", true);
    return result;
  }

  function unhookBubbles() {
    if (!isNativeAvailable()) return Promise.resolve();
    const native = findByProps("callNativeMethod");
    const result = native.callNativeMethod("bubbles.unhook", []);
    log("native", "bubbles.unhook", true);
    return result;
  }

  function configureBubbles(avatarRadius, bubbleRadius, bubbleColor) {
    if (!isNativeAvailable()) return Promise.resolve();
    const native = findByProps("callNativeMethod");
    const result = native.callNativeMethod("bubbles.configure", [
      avatarRadius,
      bubbleRadius,
      bubbleColor == null ? null : bubbleColor.toString(),
    ]);
    log("native", "bubbles.configure", true);
    return result;
  }

  // Color Picker Module
  let showCustomColorPicker;

  function resolveShowCustomColorPicker() {
    if (typeof showCustomColorPicker === "function")
      return showCustomColorPicker;

    try {
      const colorPicker = findByProps("showCustomColorPickerActionSheet");
      if (typeof colorPicker?.showCustomColorPickerActionSheet === "function") {
        showCustomColorPicker = colorPicker.showCustomColorPickerActionSheet;
        return showCustomColorPicker;
      }
    } catch {}

    return undefined;
  }

  function colorIntToHex(color) {
    const value = (color & 0xffffff) >>> 0;
    return `#${value.toString(16).padStart(6, "0")}`;
  }

  function openNativeColorPicker(onSelect) {
    const show = resolveShowCustomColorPicker();
    if (typeof show !== "function") return;
    const { bubbleColor } = getSettings();
    show({
      color:
        typeof bubbleColor === "number" ? bubbleColor & 0xffffff : 0x000000,
      onSelect: (color) => {
        if (typeof color === "number")
          onSelect((color & 0xffffff) | 0xff000000);
      },
    });
  }

  // Manager Module
  const { Dispatcher } = require("@vendetta/metro/common");
  const { processColor } = require("react-native");

  const APPEARANCE_EVENTS = [
    "CACHE_LOADED",
    "SELECTIVELY_SYNCED_USER_SETTINGS_UPDATE",
    "THEME_UPDATE",
  ];

  function getBubbleColor() {
    const { customBubbleColor, bubbleColor } = getSettings();
    if (customBubbleColor && typeof bubbleColor === "number")
      return bubbleColor;
    try {
      const tokens = findByProps("colors");
      const token = tokens?.colors?.BACKGROUND_SECONDARY_ALT;
      const theme = findByProps("theme")?.theme;
      const resolved = tokens?.internal?.resolveSemanticColor(theme, token);
      if (typeof resolved === "string" && resolved.startsWith("#")) {
        return Number(processColor(resolved));
      }
    } catch {}
    return null;
  }

  function updateBubbleAppearance() {
    const { avatarRadius, bubbleChatRadius } = getSettings();
    configureBubbles(
      Math.round(Number(avatarRadius) || 0),
      Math.round(Number(bubbleChatRadius) || 0),
      getBubbleColor()
    ).catch((e) => {
      console.error("[ChatBubbles] bubbles.configure failed:", e);
    });
  }

  function startBubbles(cleanup) {
    let stop = () => {};

    void (async () => {
      await new Promise((r) => setTimeout(r, 0));

      if (!isNativeAvailable()) {
        return;
      }

      await hookBubbles();

      const subs = [];

      for (const event of APPEARANCE_EVENTS) {
        Dispatcher.subscribe(event, updateBubbleAppearance);
        subs.push(() =>
          Dispatcher.unsubscribe(event, updateBubbleAppearance)
        );
      }

      stop = () => {
        for (const un of subs) un();
        void unhookBubbles().catch(() => {});
      };

      updateBubbleAppearance();
    })();

    cleanup(() => stop());
  }

  // Settings UI
  const React = require("react");
  const { ScrollView, View } = require("react-native");
  const {
    Pages,
    Card,
    Stack,
    TableRowGroup,
    TableRow,
    TableSwitchRow,
    Slider,
    Text,
  } = require("@vendetta/ui/components/design");

  const { Page } = Pages;

  function Settings() {
    const s = getSettings();
    const set = (patch) => {
      Object.entries(patch).forEach(([key, value]) => {
        setSetting(key, value);
      });
    };

    return React.createElement(
      Page,
      null,
      React.createElement(
        ScrollView,
        { contentContainerStyle: { padding: 0 } },
        React.createElement(
          Stack,
          null,
          React.createElement(
            TableRowGroup,
            { title: "Appearance" },
            React.createElement(
              Card,
              { style: { padding: 16, gap: 20 } },
              React.createElement(SliderRow, {
                label: "Avatar Radius",
                value: s.avatarRadius,
                onChange: (v) => set({ avatarRadius: v }),
              }),
              React.createElement(SliderRow, {
                label: "Bubble Radius",
                value: s.bubbleChatRadius,
                onChange: (v) => set({ bubbleChatRadius: v }),
              })
            )
          ),
          React.createElement(
            TableRowGroup,
            null,
            React.createElement(TableSwitchRow, {
              label: "Custom Bubble Color",
              subLabel: "Off uses the plugin's default bubble color",
              value: s.customBubbleColor,
              onValueChange: (v) => set({ customBubbleColor: v }),
            }),
            s.customBubbleColor &&
              React.createElement(TableRow, {
                label: "Bubble Color",
                subLabel:
                  s.bubbleColor != null
                    ? colorIntToHex(s.bubbleColor)
                    : "Tap to choose a color",
                arrow: true,
                trailing: React.createElement(View, {
                  style: {
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor:
                      s.bubbleColor != null
                        ? colorIntToHex(s.bubbleColor)
                        : "#000000",
                  },
                }),
                onPress: () =>
                  openNativeColorPicker((color) =>
                    set({ bubbleColor: color })
                  ),
              })
          )
        )
      )
    );
  }

  function SliderRow({ label, value, onChange }) {
    return React.createElement(
      View,
      { style: { gap: 8 } },
      React.createElement(
        View,
        {
          style: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        },
        React.createElement(
          Text,
          { variant: "text-md/semibold", color: "text-strong" },
          label
        ),
        React.createElement(
          Text,
          { variant: "text-md/medium", color: "text-muted" },
          Math.round(value)
        )
      ),
      React.createElement(Slider, {
        value: value,
        minimumValue: 0,
        maximumValue: 50,
        step: 1,
        onValueChange: onChange,
      })
    );
  }

  // Main Plugin Export
  const { createUnpatcher } = require("@lib/patcher");
  const { cleanup } = createUnpatcher();

  module.exports = {
    onLoad() {
      initStorage();
      startBubbles(cleanup);
    },

    onUnload() {
      cleanup();
    },

    settings: Settings,
  };
})();
