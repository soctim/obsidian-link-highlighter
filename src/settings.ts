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
                        div.toggleClass('link-highlighter__hide_setting', !enabled)

                        await this.plugin.saveSettings()

                        if (enabled) {
                            this.colorizer.setTextColor(this.plugin.settings.customTextColor)
                            this.colorizer.setBackgroundColor(this.plugin.settings.customBackgroundColor)
                        } else {
                            this.colorizer.setupColors()
                        }
                    })
            })


        // Workaround with class with display: none 
        // because visibility: hidden works not so good
        const div = containerEl.createDiv({cls: this.plugin.settings.useCustomColors ? null : 'link-highlighter__hide_setting' });

        this.initPickr(div, 'Custom Background Color', this.plugin.settings.customBackgroundColor);
        this.initPickr(div, 'Custom Text Color', this.plugin.settings.customTextColor)

        new Setting(div)
            .setName('Element highlighting example')
            .addButton(btn =>
                btn
                    .setClass('link-highlighter-example')
                    .setButtonText('Hello World!')
            )
    }

    initPickr(containerEl: HTMLElement, name: string, defaultColor: string): Setting {
        let pickrDefault: string = defaultColor;

        let pickr: Pickr;
        return new Setting(containerEl)
            .setName(name)
            .then((setting) => {
                pickr = Pickr.create({
                    el: setting.controlEl.createEl('input', { cls: "picker" }),
                    theme: 'monolith',
                    default: pickrDefault,
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