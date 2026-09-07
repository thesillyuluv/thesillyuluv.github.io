import { getSettings, setSetting } from './lib/state';
import { colorIntToHex, openNativeColorPicker } from './lib/colorPicker';
import { ScrollView, View } from 'react-native';
import { Pages, Card, Stack, TableRowGroup, TableRow, TableSwitchRow, Slider, Text } from '@vendetta/ui/components/design';
const { Page } = Pages;
export default function Settings() {
    const s = getSettings();
    const set = (patch) => {
        Object.entries(patch).forEach(([key, value]) => {
            setSetting(key, value);
        });
    };
    return React.createElement(Page, null,
        React.createElement(ScrollView, { contentContainerStyle: { padding: 0 } },
            React.createElement(Stack, null,
                React.createElement(TableRowGroup, { title: "Appearance" },
                    React.createElement(Card, { style: { padding: 16, gap: 20 } },
                        React.createElement(SliderRow, { label: "Avatar Radius", value: s.avatarRadius, onChange: v => set({ avatarRadius: v }) }),
                        React.createElement(SliderRow, { label: "Bubble Radius", value: s.bubbleChatRadius, onChange: v => set({ bubbleChatRadius: v }) }))),
                React.createElement(TableRowGroup, null,
                    React.createElement(TableSwitchRow, { label: "Custom Bubble Color", subLabel: "Off uses the plugin's default bubble color", value: s.customBubbleColor, onValueChange: v => set({ customBubbleColor: v }) }),
                    s.customBubbleColor && (React.createElement(TableRow, { label: "Bubble Color", subLabel: s.bubbleColor != null
                        ? colorIntToHex(s.bubbleColor)
                        : 'Tap to choose a color', arrow: true, trailing: React.createElement(View, { style: {
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: s.bubbleColor != null
                                ? colorIntToHex(s.bubbleColor)
                                : '#000000',
                        } }), onPress: () => openNativeColorPicker(color => set({ bubbleColor: color })) }))))));
}
function SliderRow({ label, value, onChange, }) {
    return React.createElement(View, { style: { gap: 8 } },
        React.createElement(View, { style: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        } },
            React.createElement(Text, { variant: "text-md/semibold", color: "text-strong" }, label),
            React.createElement(Text, { variant: "text-md/medium", color: "text-muted" }, Math.round(value))),
        React.createElement(Slider, { value: value, minimumValue: 0, maximumValue: 50, step: 1, onValueChange: onChange }));
}
