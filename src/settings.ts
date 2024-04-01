import { App, PluginSettingTab, Setting } from "obsidian";
import LinkHighlighterPlugin from "./main";
import { Colorizer } from "./colorizer";
import Pickr from "@simonwep/pickr";

export interface LinkHighlighterSettings {
    useCustomColors: boolean,
    customBackgroundColor: string,
    customTextColor: string
    customColorRGB?: string
}

export const DEFAULT_SETTINGS: LinkHighlighterSettings = {
    useCustomColors: false,
    customBackgroundColor: '#ffffff',
    customTextColor: '#000000'
}

export class HighlighterSettingTab extends PluginSettingTab {
    plugin: LinkHighlighterPlugin;
    colorizer: Colorizer;

    constructor(app: App, plugin: LinkHighlighterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.colorizer = new Colorizer(this.plugin.settings)
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'Link Highlighter Settings' });

        new Setting(containerEl)
            .setName('Use Custom Colors')
            .addToggle(component => {
                component
                    .setValue(this.plugin.settings.useCustomColors)
                    .onChange(async (enabled) => {
                        this.plugin.settings.useCustomColors = enabled
                        await this.plugin.saveSettings()

                        if (enabled) {
                            this.colorizer.setTextColor(this.plugin.settings.customTextColor)
                            this.colorizer.setBackgroundColor(this.plugin.settings.customBackgroundColor)
                            toggleInputDisable(false)
                        } else {
                            toggleInputDisable(true)
                            this.colorizer.setupColors()
                        }
                    })
            })

        let backgroundColorSetting = this.initPickr(containerEl, 'Custom Background Color', this.plugin.settings.customBackgroundColor);
        let textColorSetting = this.initPickr(containerEl, 'Custom Text Color', this.plugin.settings.customTextColor)

        new Setting(containerEl)
            .setName('Element highlighting example')
            .addButton(btn =>
                btn
                    .setClass('link-highlighter-example')
                    .setButtonText('Hello World!')
                    .setDisabled(true)
            )

        function toggleInputDisable(value: boolean) {
            backgroundColorSetting.setDisabled(value)
            textColorSetting.setDisabled(value)
        }
    }

    initPickr(containerEl: HTMLElement, name: string, defaultColor: string): Setting {
        let pickrDefault: string = defaultColor;

        let pickr: Pickr;
        return new Setting(containerEl)
            .setName(name)
            .then((setting) => {
                pickr = Pickr.create({
                    el: setting.controlEl.createEl('input', { cls: "picker" }),
                    theme: 'nano',
                    default: pickrDefault,
                    disabled: !this.plugin.settings.useCustomColors,
                    components: {
                        preview: true,
                        opacity: true,
                        hue: true,
                        interaction: {
                            hex: true,
                            input: true,
                            clear: true,
                            save: true
                        }
                    }
                })
                    .on('show', () => {
                        const { result } = (pickr.getRoot() as any).interaction;
                        requestAnimationFrame(() =>
                            requestAnimationFrame(() => result.select())
                        );
                    })
                    .on('save', (color: Pickr.HSVaColor, instance: Pickr) => {
                        if (!color) return;
                        instance.hide();
                        const savedColor = color.toHEXA().toString();
                        this.setAndSavePickrSetting(savedColor, name === 'Custom Text Color' ? 'customTextColor' : 'customBackgroundColor');
                    })
                    .on('cancel', (instance: Pickr) => {
                        instance.hide();
                    })
            })
            .addExtraButton((btn) => {
                btn.setIcon("reset")
                    .setDisabled(!this.plugin.settings.useCustomColors)
                    .onClick(() => {
                        pickr.setColor(defaultColor);
                        this.setAndSavePickrSetting(defaultColor, name === 'Custom Text Color' ? 'customTextColor' : 'customBackgroundColor');
                    })
                    .setTooltip('restore default color');
            });
    }


    setAndSavePickrSetting(savedColor: string, setting: 'customTextColor' | 'customBackgroundColor'): void {
        this.plugin.settings[setting] = savedColor;
        if (setting === 'customTextColor') {
            this.colorizer.setTextColor(savedColor)
        } else {
            this.colorizer.setBackgroundColor(savedColor)
        }

        this.plugin.saveSettings();
    }
}