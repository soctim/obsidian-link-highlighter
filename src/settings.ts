import {App, PluginSettingTab, Setting} from "obsidian";
import LinkHighlighterPlugin from "./main";
import {Colorizer} from "./helpers";

export interface LinkHighlighterSettings {
    useCustomColors: boolean,
    customBackgroundColor: string,
    customTextColor: string
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
        let {containerEl} = this;

        containerEl.empty();
        containerEl.createEl('h2', {text: 'Link Highlighter Settings'});

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

        let backgroundColorSetting = new Setting(containerEl)
            .setName('Custom Background Color')
            .addText(component => component
                .setPlaceholder('Enter HEX color code')
                .setValue(this.plugin.settings.customBackgroundColor)
                .setDisabled(!this.plugin.settings.useCustomColors)
                .onChange(async (value) => {
                    this.colorizer.setBackgroundColor(value);
                    this.plugin.settings.customBackgroundColor = value;
                    await this.plugin.saveSettings();
                }));

        let textColorSetting = new Setting(containerEl)
            .setName('Custom Text Color')
            .addText(text => text
                .setPlaceholder('Enter HEX color code')
                .setValue(this.plugin.settings.customTextColor)
                .onChange(async (value) => {
                    this.colorizer.setTextColor(value);
                    this.plugin.settings.customTextColor = value;
                    await this.plugin.saveSettings();
                }));

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
}